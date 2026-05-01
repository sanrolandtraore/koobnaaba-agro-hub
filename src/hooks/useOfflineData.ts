import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  cacheData,
  getCachedData,
  addToSyncQueue,
  applyOptimisticInsert,
  applyOptimisticUpdate,
  applyOptimisticDelete,
} from '@/lib/offlineDb';

interface UseOfflineDataOptions {
  table: string;
  queryKey?: string;
  select?: string;
  orderBy?: string;
  ascending?: boolean;
  filter?: { column: string; value: any }[];
  limit?: number;
}

const isOfflineTempId = (value: unknown): value is string => (
  typeof value === 'string' && value.startsWith('offline-')
);

function hasTempReference(value: any, key?: string): boolean {
  const isIdKey = key === 'id' || key?.endsWith('_id') || key?.endsWith('_ids') || key === 'assigned_members';

  if (typeof value === 'string') {
    return isIdKey && isOfflineTempId(value);
  }

  if (Array.isArray(value)) {
    return value.some((item) => hasTempReference(item, key));
  }

  if (value && typeof value === 'object') {
    return Object.entries(value).some(([entryKey, entryValue]) => hasTempReference(entryValue, entryKey));
  }

  return false;
}

export function useOfflineData<T = any>({
  table,
  queryKey,
  select = '*',
  orderBy = 'created_at',
  ascending = false,
  filter,
  limit = 500,
}: UseOfflineDataOptions) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const stableFilter = JSON.stringify(filter ?? []);
  const cacheKey = queryKey || `${select}|${orderBy}|${ascending}|${limit}|${stableFilter}`;

  useEffect(() => {
    const goOnline = () => setIsOffline(false);
    const goOffline = () => setIsOffline(true);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);

    const parsedFilter: { column: string; value: any }[] = JSON.parse(stableFilter);

    if (navigator.onLine) {
      try {
        let query = (supabase.from(table as any) as any).select(select);
        for (const f of parsedFilter) {
          query = query.eq(f.column, f.value);
        }
        query = query.order(orderBy, { ascending }).limit(limit);

        const { data: result, error } = await query;
        if (error) throw error;

        setData(result || []);
        await cacheData(table, cacheKey, result || []);
      } catch (err: any) {
        console.error('Fetch error, falling back to cache:', err);
        const cached = await getCachedData(table, cacheKey);
        if (cached) {
          setData(cached as T[]);
          toast.info('Données chargées depuis le cache local');
        } else {
          toast.error(err.message);
        }
      }
    } else {
      const cached = await getCachedData(table, cacheKey);
      if (cached) {
        setData(cached as T[]);
      } else {
        toast.warning('Aucune donnée en cache pour le mode hors-ligne');
      }
    }

    setLoading(false);
  }, [table, cacheKey, select, orderBy, ascending, stableFilter, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const queueOfflineInsert = useCallback(async (row: any, message: string) => {
    const tempId = `offline-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const offlineRow = { ...row, id: tempId, _offline: true, created_at: new Date().toISOString() };
    await addToSyncQueue({ table, operation: 'insert', data: offlineRow });
    await applyOptimisticInsert(table, cacheKey, offlineRow);
    setData(prev => [offlineRow as T, ...prev]);
    toast.info(message);
    return offlineRow;
  }, [table, cacheKey]);

  const ensureSession = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      toast.error('Session expirée ou indisponible. Reconnectez-vous avant de continuer.');
      return null;
    }
    return session;
  }, []);

  const insertRow = useCallback(async (row: any) => {
    if (!navigator.onLine) {
      return queueOfflineInsert(row, 'Enregistré hors-ligne, sera synchronisé au retour de la connexion');
    }

    const session = await ensureSession();
    if (!session) return null;

    if (hasTempReference(row)) {
      return queueOfflineInsert(
        row,
        'Cette donnée dépend d’un élément pas encore synchronisé. Elle sera envoyée automatiquement juste après.'
      );
    }

    const { data: result, error } = await (supabase.from(table as any) as any).insert(row).select();
    if (error) {
      toast.error(error.message);
      return null;
    }
    await fetchData();
    return result?.[0] || null;
  }, [table, ensureSession, fetchData, queueOfflineInsert]);

  const updateRow = useCallback(async (id: string, updates: any) => {
    if (navigator.onLine) {
      const session = await ensureSession();
      if (!session) return false;

      if (isOfflineTempId(id) || hasTempReference(updates)) {
        await addToSyncQueue({ table, operation: 'update', data: { id, ...updates } });
        await applyOptimisticUpdate(table, cacheKey, id, updates);
        setData(prev => prev.map((r: any) => r.id === id ? { ...r, ...updates, _offline: true } : r));
        toast.info('Modification en attente de synchronisation');
        return true;
      }

      const { error } = await (supabase.from(table as any) as any).update(updates).eq('id', id);
      if (error) {
        toast.error(error.message);
        return false;
      }
      await fetchData();
      return true;
    } else {
      await addToSyncQueue({ table, operation: 'update', data: { id, ...updates } });
      await applyOptimisticUpdate(table, cacheKey, id, updates);
      setData(prev => prev.map((r: any) => r.id === id ? { ...r, ...updates } : r));
      toast.info('Modification enregistrée hors-ligne');
      return true;
    }
  }, [table, cacheKey, ensureSession, fetchData]);

  const deleteRow = useCallback(async (id: string) => {
    if (navigator.onLine) {
      const session = await ensureSession();
      if (!session) return false;

      if (isOfflineTempId(id)) {
        await addToSyncQueue({ table, operation: 'delete', data: { id } });
        await applyOptimisticDelete(table, cacheKey, id);
        setData(prev => prev.filter((r: any) => r.id !== id));
        toast.info('Suppression en attente de synchronisation');
        return true;
      }

      const { error } = await (supabase.from(table as any) as any).delete().eq('id', id);
      if (error) {
        toast.error(error.message);
        return false;
      }
      await fetchData();
      return true;
    } else {
      await addToSyncQueue({ table, operation: 'delete', data: { id } });
      await applyOptimisticDelete(table, cacheKey, id);
      setData(prev => prev.filter((r: any) => r.id !== id));
      toast.info('Suppression enregistrée hors-ligne');
      return true;
    }
  }, [table, cacheKey, ensureSession, fetchData]);

  return { data, loading, isOffline, refetch: fetchData, insertRow, updateRow, deleteRow };
}

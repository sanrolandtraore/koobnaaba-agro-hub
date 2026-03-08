import { supabase } from '@/integrations/supabase/client';
import { getSyncQueue, removeSyncQueueItem, updateSyncQueueItem, getSyncQueueCount } from './offlineDb';
import { toast } from 'sonner';

const MAX_RETRIES = 5;

type SyncListener = (pending: number) => void;
const listeners = new Set<SyncListener>();

export function onSyncChange(fn: SyncListener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

async function notifyListeners() {
  const count = await getSyncQueueCount();
  listeners.forEach(fn => fn(count));
}

export async function processSyncQueue(): Promise<{ synced: number; failed: number }> {
  const queue = await getSyncQueue();
  let synced = 0;
  let failed = 0;

  for (const item of queue) {
    if (item.retries >= MAX_RETRIES) {
      failed++;
      continue;
    }

    try {
      let error: any = null;

      switch (item.operation) {
        case 'insert': {
          const { id: _tempId, _offline, ...insertData } = item.data;
          const res = await (supabase.from(item.table as any) as any).insert(insertData);
          error = res.error;
          break;
        }
        case 'update': {
          const { id, ...updateData } = item.data;
          const res = await (supabase.from(item.table) as any).update(updateData).eq('id', id);
          error = res.error;
          break;
        }
        case 'delete': {
          const res = await (supabase.from(item.table) as any).delete().eq('id', item.data.id);
          error = res.error;
          break;
        }
      }

      if (error) {
        console.error(`Sync failed for ${item.table}:`, error);
        await updateSyncQueueItem(item.id, { retries: item.retries + 1 });
        failed++;
      } else {
        await removeSyncQueueItem(item.id);
        synced++;
      }
    } catch (err) {
      console.error(`Sync error for ${item.table}:`, err);
      await updateSyncQueueItem(item.id, { retries: item.retries + 1 });
      failed++;
    }
  }

  await notifyListeners();
  return { synced, failed };
}

export async function syncOnReconnect(): Promise<void> {
  const count = await getSyncQueueCount();
  if (count === 0) return;

  toast.info(`Synchronisation de ${count} modification(s)...`);
  const { synced, failed } = await processSyncQueue();

  if (synced > 0) {
    toast.success(`${synced} modification(s) synchronisée(s)`);
  }
  if (failed > 0) {
    toast.error(`${failed} modification(s) en échec, nouvelle tentative plus tard`);
  }
}

// Auto-sync when coming back online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    setTimeout(() => syncOnReconnect(), 1500);
  });
}

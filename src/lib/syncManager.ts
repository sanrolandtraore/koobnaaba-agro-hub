import { supabase } from '@/integrations/supabase/client';
import { getSyncQueue, removeSyncQueueItem, updateSyncQueueItem, getSyncQueueCount, replaceOfflineId } from './offlineDb';
import { toast } from 'sonner';

const MAX_RETRIES = 5;

type SyncListener = (pending: number) => void;
const listeners = new Set<SyncListener>();

export function onSyncChange(fn: SyncListener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

async function notifyListeners() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const count = await getSyncQueueCount(user.id);
  listeners.forEach(fn => fn(count));
}

export async function processSyncQueue(): Promise<{ synced: number; failed: number }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { synced: 0, failed: 0 };

  const queue = await getSyncQueue(user.id);
  let synced = 0;
  let failed = 0;

  for (let index = 0; index < queue.length; index++) {
    const item = queue[index];
    if (item.retries >= MAX_RETRIES) {
      failed++;
      continue;
    }

    try {
      let error: any = null;

      switch (item.operation) {
        case 'insert': {
          const { id: tempId, _offline, ...insertData } = item.data;
          const res = await (supabase.from(item.table as any) as any).insert(insertData).select().single();
          error = res.error;
          if (!error && typeof tempId === 'string' && tempId.startsWith('offline-') && res.data?.id) {
            await replaceOfflineId(tempId, res.data.id);
            // The queue snapshot is already in memory; update following items
            // so dependent inserts/updates use the freshly assigned server id.
            for (let pendingIndex = index + 1; pendingIndex < queue.length; pendingIndex++) {
              queue[pendingIndex] = {
                ...queue[pendingIndex],
                data: replaceReferences(queue[pendingIndex].data, tempId, res.data.id),
              };
            }
          }
          break;
        }
        case 'update': {
          const { id, ...updateData } = item.data;
          const res = await (supabase.from(item.table as any) as any).update(updateData).eq('id', id);
          error = res.error;
          break;
        }
        case 'delete': {
          const res = await (supabase.from(item.table as any) as any).delete().eq('id', item.data.id);
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

function replaceReferences(value: any, fromId: string, toId: string): any {
  if (value === fromId) return toId;
  if (Array.isArray(value)) return value.map((item) => replaceReferences(item, fromId, toId));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, replaceReferences(item, fromId, toId)]));
  }
  return value;
}

export async function syncOnReconnect(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const count = await getSyncQueueCount(user.id);
  if (count === 0) {
    // Still notify so UIs can refetch fresh server data after reconnect
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('koobnaaba:sync-completed'));
    }
    return;
  }

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
    setTimeout(async () => {
      await syncOnReconnect();
      // Notify the rest of the app (hooks, dashboards) that they should refetch
      window.dispatchEvent(new CustomEvent('koobnaaba:sync-completed'));
    }, 1500);
  });
}


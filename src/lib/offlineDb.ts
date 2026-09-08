import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface SyncQueueItem {
  id: string;
  table: string;
  operation: 'insert' | 'update' | 'delete';
  data: any;
  timestamp: number;
  retries: number;
}

interface OfflineDBSchema extends DBSchema {
  cachedData: {
    key: string; // "table:queryKey"
    value: {
      key: string;
      table: string;
      data: any[];
      cachedAt: number;
    };
  };
  syncQueue: {
    key: string;
    value: SyncQueueItem;
    indexes: { 'by-table': string; 'by-timestamp': number };
  };
}

const DB_NAME = 'koobnaaba-offline';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<OfflineDBSchema> | null = null;

export async function getDb(): Promise<IDBPDatabase<OfflineDBSchema>> {
  if (dbInstance) return dbInstance;
  
  dbInstance = await openDB<OfflineDBSchema>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('cachedData')) {
        db.createObjectStore('cachedData', { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains('syncQueue')) {
        const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
        syncStore.createIndex('by-table', 'table');
        syncStore.createIndex('by-timestamp', 'timestamp');
      }
    },
  });
  
  return dbInstance;
}

// ── Cache operations ──

export async function cacheData(table: string, queryKey: string, data: any[]): Promise<void> {
  const db = await getDb();
  const key = `${table}:${queryKey}`;
  await db.put('cachedData', { key, table, data, cachedAt: Date.now() });
}

export async function getCachedData(table: string, queryKey: string): Promise<any[] | null> {
  const db = await getDb();
  const key = `${table}:${queryKey}`;
  const entry = await db.get('cachedData', key);
  return entry?.data ?? null;
}

export async function clearTableCache(table: string): Promise<void> {
  const db = await getDb();
  const tx = db.transaction('cachedData', 'readwrite');
  const store = tx.objectStore('cachedData');
  let cursor = await store.openCursor();
  while (cursor) {
    if (cursor.value.table === table) {
      await cursor.delete();
    }
    cursor = await cursor.continue();
  }
  await tx.done;
}

// ── Sync queue operations ──

export async function addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retries'>): Promise<string> {
  const db = await getDb();
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  await db.put('syncQueue', { ...item, id, timestamp: Date.now(), retries: 0 });
  return id;
}

export async function getSyncQueue(): Promise<SyncQueueItem[]> {
  const db = await getDb();
  return db.getAllFromIndex('syncQueue', 'by-timestamp');
}

export async function removeSyncQueueItem(id: string): Promise<void> {
  const db = await getDb();
  await db.delete('syncQueue', id);
}

export async function updateSyncQueueItem(id: string, updates: Partial<SyncQueueItem>): Promise<void> {
  const db = await getDb();
  const item = await db.get('syncQueue', id);
  if (item) {
    await db.put('syncQueue', { ...item, ...updates });
  }
}

export async function getSyncQueueCount(): Promise<number> {
  const db = await getDb();
  return db.count('syncQueue');
}

// ── Offline session ──

const SESSION_KEY = 'offline-session';

export interface OfflineSession {
  userId: string;
  email: string;
  fullName: string;
  roles: string[];
  profile: { full_name: string; phone: string | null; email: string | null; avatar_url: string | null };
  savedAt: number;
}

export async function saveOfflineSession(session: OfflineSession): Promise<void> {
  const db = await getDb();
  await db.put('cachedData', { key: SESSION_KEY, table: '_session', data: [session], cachedAt: Date.now() });
}

export async function getOfflineSession(): Promise<OfflineSession | null> {
  const db = await getDb();
  const entry = await db.get('cachedData', SESSION_KEY);
  if (!entry?.data?.[0]) return null;
  const session = entry.data[0] as OfflineSession;
  // La session locale n'expire pas : l'utilisateur reste connecté
  // jusqu'à ce qu'il se déconnecte lui-même.
  return session;

}

export async function clearOfflineSession(): Promise<void> {
  const db = await getDb();
  await db.delete('cachedData', SESSION_KEY);
}

// ── Optimistic local cache update ──

export async function applyOptimisticInsert(table: string, queryKey: string, newRow: any): Promise<void> {
  const cached = await getCachedData(table, queryKey);
  if (cached) {
    await cacheData(table, queryKey, [newRow, ...cached]);
  }
}

export async function applyOptimisticUpdate(table: string, queryKey: string, id: string, updates: any): Promise<void> {
  const cached = await getCachedData(table, queryKey);
  if (cached) {
    const updated = cached.map((row: any) => (row.id === id ? { ...row, ...updates } : row));
    await cacheData(table, queryKey, updated);
  }
}

export async function applyOptimisticDelete(table: string, queryKey: string, id: string): Promise<void> {
  const cached = await getCachedData(table, queryKey);
  if (cached) {
    await cacheData(table, queryKey, cached.filter((row: any) => row.id !== id));
  }
}

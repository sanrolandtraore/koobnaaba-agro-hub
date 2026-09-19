import { cacheData, getCachedData } from "@/lib/offlineDb";

const TABLE = "_diagnosis_queue";
const KEY = "pending";

export interface PendingDiagnosis {
  id: string;
  cropKey: string;
  symptoms: string;
  imageBase64?: string;
  mimeType?: string;
  imagePreview?: string;
  latitude?: number | null;
  longitude?: number | null;
  parcelName?: string;
  createdAt: string;
}

export async function getPendingDiagnoses(): Promise<PendingDiagnosis[]> {
  return ((await getCachedData(TABLE, KEY)) as PendingDiagnosis[]) ?? [];
}

export async function addPendingDiagnosis(item: Omit<PendingDiagnosis, "id" | "createdAt">) {
  const list = await getPendingDiagnoses();
  const entry: PendingDiagnosis = {
    ...item,
    id: `pending-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  };
  await cacheData(TABLE, KEY, [entry, ...list]);
  return entry;
}

export async function removePendingDiagnosis(id: string) {
  const list = await getPendingDiagnoses();
  await cacheData(TABLE, KEY, list.filter((p) => p.id !== id));
}

// ── Historique local des analyses (consultable hors-ligne) ──

const HISTORY_TABLE = "_diagnosis_history";

export interface LocalDiagnosis {
  id: string;
  crop_key: string | null;
  symptoms_input: string | null;
  diagnosis_summary: string | null;
  confidence: number | null;
  treatment_bio: string | null;
  treatment_chemical: string | null;
  ai_response: any;
  latitude?: number | null;
  longitude?: number | null;
  parcel_name?: string | null;
  created_at: string;
  synced?: boolean;
}

export async function getLocalHistory(userId: string): Promise<LocalDiagnosis[]> {
  return ((await getCachedData(HISTORY_TABLE, userId)) as LocalDiagnosis[]) ?? [];
}

export async function saveLocalHistory(userId: string, rows: LocalDiagnosis[]) {
  await cacheData(HISTORY_TABLE, userId, rows.slice(0, 200));
}

export async function addLocalHistory(userId: string, row: LocalDiagnosis) {
  const list = await getLocalHistory(userId);
  await saveLocalHistory(userId, [row, ...list.filter((r) => r.id !== row.id)]);
}

import { getDb } from './offlineDb';

// PIN-based quick auth for KoobNaaba
// - PIN is 4 digits, hashed (SHA-256) with a per-device salt
// - Linked to a userId so we can fast-restore the offline session on this device
// - Device fingerprint = stable random id stored locally (acts as Flutter Secure Storage equivalent)

const PIN_KEY = 'pin-auth';
const DEVICE_KEY = 'device-fingerprint';

interface PinRecord {
  userId: string;
  identifier: string; // phone-email or email
  pinHash: string;
  salt: string;
  deviceId: string;
  createdAt: number;
  lastUsedAt: number;
}

function randomHex(bytes: number): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function getDeviceFingerprint(): Promise<string> {
  try {
    const db = await getDb();
    const entry = await db.get('cachedData', DEVICE_KEY);
    if (entry?.data?.[0]?.deviceId) return entry.data[0].deviceId as string;
    const deviceId = randomHex(16);
    await db.put('cachedData', { key: DEVICE_KEY, table: '_device', data: [{ deviceId }], cachedAt: Date.now() });
    return deviceId;
  } catch {
    return 'unknown-device';
  }
}

export async function setupPin(userId: string, identifier: string, pin: string): Promise<{ ok: boolean; error?: string }> {
  if (!/^\d{4}$/.test(pin)) return { ok: false, error: 'Le code PIN doit contenir 4 chiffres' };
  try {
    const db = await getDb();
    const deviceId = await getDeviceFingerprint();
    const salt = randomHex(8);
    const pinHash = await sha256(`${pin}|${salt}|${deviceId}|koobnaaba-pin-2026`);
    const record: PinRecord = {
      userId,
      identifier: identifier.toLowerCase(),
      pinHash,
      salt,
      deviceId,
      createdAt: Date.now(),
      lastUsedAt: Date.now(),
    };
    await db.put('cachedData', { key: PIN_KEY, table: '_pin', data: [record], cachedAt: Date.now() });
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Erreur stockage PIN' };
  }
}

export async function getPinRecord(): Promise<PinRecord | null> {
  try {
    const db = await getDb();
    const entry = await db.get('cachedData', PIN_KEY);
    return (entry?.data?.[0] as PinRecord) ?? null;
  } catch {
    return null;
  }
}

export async function hasPin(): Promise<boolean> {
  const rec = await getPinRecord();
  return !!rec;
}

export async function verifyPin(pin: string): Promise<{ ok: boolean; record?: PinRecord; error?: string }> {
  if (!/^\d{4}$/.test(pin)) return { ok: false, error: 'PIN invalide' };
  const rec = await getPinRecord();
  if (!rec) return { ok: false, error: 'Aucun PIN configuré sur cet appareil' };
  const deviceId = await getDeviceFingerprint();
  if (rec.deviceId !== deviceId) return { ok: false, error: 'Cet appareil n\'est pas reconnu' };
  const candidate = await sha256(`${pin}|${rec.salt}|${rec.deviceId}|koobnaaba-pin-2026`);
  if (candidate !== rec.pinHash) return { ok: false, error: 'Code PIN incorrect' };
  // update lastUsedAt
  try {
    const db = await getDb();
    await db.put('cachedData', { key: PIN_KEY, table: '_pin', data: [{ ...rec, lastUsedAt: Date.now() }], cachedAt: Date.now() });
  } catch {}
  return { ok: true, record: rec };
}

export async function clearPin(): Promise<void> {
  try {
    const db = await getDb();
    await db.delete('cachedData', PIN_KEY);
  } catch {}
}

import { getDb } from './offlineDb';

const CREDENTIALS_KEY = 'offline-credentials';

interface OfflineCredentials {
  identifier: string; // normalized phone number (digits + optional leading '+')
  passwordHash: string;
  savedAt: number;
}

// Normalize any phone-like input or legacy email-format identifier
// (e.g. "+22670000000@koobnaaba.local") to a canonical phone string.
export function normalizePhoneIdentifier(input: string): string {
  if (!input) return '';
  // Strip the legacy "@koobnaaba.local" suffix if present
  const base = input.split('@')[0];
  // Keep digits and a leading '+'
  const cleaned = base.replace(/[^0-9+]/g, '');
  return cleaned.toLowerCase();
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'koobnaaba-salt-2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function saveOfflineCredentials(identifier: string, password: string): Promise<void> {
  try {
    const db = await getDb();
    const passwordHash = await hashPassword(password);
    const creds: OfflineCredentials = {
      identifier: normalizePhoneIdentifier(identifier),
      passwordHash,
      savedAt: Date.now(),
    };
    await db.put('cachedData', {
      key: CREDENTIALS_KEY,
      table: '_credentials',
      data: [creds],
      cachedAt: Date.now(),
    });
  } catch (e) {
    console.warn('Failed to save offline credentials:', e);
  }
}

export async function verifyOfflineCredentials(identifier: string, password: string): Promise<boolean> {
  try {
    const db = await getDb();
    const entry = await db.get('cachedData', CREDENTIALS_KEY);
    if (!entry?.data?.[0]) return false;
    const creds = entry.data[0] as OfflineCredentials;
    // Expire after 30 days
    if (Date.now() - creds.savedAt > 30 * 24 * 60 * 60 * 1000) return false;
    if (creds.identifier !== normalizePhoneIdentifier(identifier)) return false;
    const inputHash = await hashPassword(password);
    return inputHash === creds.passwordHash;
  } catch (e) {
    console.warn('Failed to verify offline credentials:', e);
    return false;
  }
}

export async function hasOfflineCredentials(): Promise<boolean> {
  try {
    const db = await getDb();
    const entry = await db.get('cachedData', CREDENTIALS_KEY);
    if (!entry?.data?.[0]) return false;
    const creds = entry.data[0] as OfflineCredentials;
    return Date.now() - creds.savedAt < 30 * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

export async function clearOfflineCredentials(): Promise<void> {
  try {
    const db = await getDb();
    await db.delete('cachedData', CREDENTIALS_KEY);
  } catch (e) {
    console.warn('Failed to clear offline credentials:', e);
  }
}

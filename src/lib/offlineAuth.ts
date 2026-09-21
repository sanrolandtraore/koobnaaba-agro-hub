import { getDb } from './offlineDb';

const CREDENTIALS_PREFIX = 'credentials:';

interface OfflineCredentials {
  identifier: string; // normalized phone number (digits + optional leading '+')
  passwordHash: string;
  salt: string;
  version: 2;
  savedAt: number;
}

// Normalize any phone-like input or legacy email-format identifier
// (e.g. "+22670000000@koobnaaba.local") to a canonical phone string.
// For real emails (anything other than @koobnaaba.local), keep the email
// lowercased as-is so users can sign in offline with email too.
export function normalizePhoneIdentifier(input: string): string {
  if (!input) return '';
  const lower = input.trim().toLowerCase();
  // Real email — keep as-is
  if (lower.includes('@') && !lower.endsWith('@koobnaaba.local')) {
    return lower;
  }
  // Strip the internal "@koobnaaba.local" suffix if present
  const base = lower.split('@')[0];
  // Keep digits and a leading '+'
  return base.replace(/[^0-9+]/g, '');
}

const PBKDF2_ITERATIONS = 210_000;

function randomSalt(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const hashBuffer = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: encoder.encode(salt), iterations: PBKDF2_ITERATIONS },
    key,
    256,
  );
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function saveOfflineCredentials(identifier: string, password: string): Promise<void> {
  try {
    const db = await getDb();
    const normalizedIdentifier = normalizePhoneIdentifier(identifier);
    if (!normalizedIdentifier) return;
    const { data: { user } } = await (await import('@/integrations/supabase/client')).supabase.auth.getUser();
    if (!user) return;
    const salt = randomSalt();
    const passwordHash = await hashPassword(password, salt);
    const creds: OfflineCredentials = {
      identifier: normalizedIdentifier,
      passwordHash,
      salt,
      version: 2,
      savedAt: Date.now(),
    };
    await db.put('cachedData', {
      key: `${CREDENTIALS_PREFIX}${normalizedIdentifier}`,
      table: '_credentials',
      userId: user.id,
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
    const normalizedIdentifier = normalizePhoneIdentifier(identifier);
    if (!normalizedIdentifier) return false;
    const entry = await db.get('cachedData', `${CREDENTIALS_PREFIX}${normalizedIdentifier}`);
    if (!entry?.data?.[0]) return false;
    const creds = entry.data[0] as OfflineCredentials;
    // Credentials saved by older builds used a fixed, public salt. They must be
    // replaced by a successful online sign-in before offline access is allowed.
    if (creds.version !== 2 || !creds.salt) return false;
    // Expire after 30 days
    if (Date.now() - creds.savedAt > 30 * 24 * 60 * 60 * 1000) return false;
    if (creds.identifier !== normalizePhoneIdentifier(identifier)) return false;
    const inputHash = await hashPassword(password, creds.salt);
    return inputHash === creds.passwordHash;
  } catch (e) {
    console.warn('Failed to verify offline credentials:', e);
    return false;
  }
}

export async function hasOfflineCredentials(): Promise<boolean> {
  try {
    const db = await getDb();
    const { data: { user } } = await (await import('@/integrations/supabase/client')).supabase.auth.getUser();
    if (!user) return false;
    const normalizedIdentifier = normalizePhoneIdentifier(user.email || '');
    const entry = await db.get('cachedData', `${CREDENTIALS_PREFIX}${normalizedIdentifier}`);
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
    const { data: { user } } = await (await import('@/integrations/supabase/client')).supabase.auth.getUser();
    if (user) {
      const normalizedIdentifier = normalizePhoneIdentifier(user.email || '');
      await db.delete('cachedData', `${CREDENTIALS_PREFIX}${normalizedIdentifier}`);
    }
  } catch (e) {
    console.warn('Failed to clear offline credentials:', e);
  }
}


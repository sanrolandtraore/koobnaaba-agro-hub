import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const SUPABASE_PUBLISHABLE_KEY = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '').trim();

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error('KoobNaaba: VITE_SUPABASE_URL et VITE_SUPABASE_PUBLISHABLE_KEY doivent être configurées dans Vercel/.env local.');
}

export const getSupabaseConfig = () => ({
  url: SUPABASE_URL,
  key: SUPABASE_PUBLISHABLE_KEY,
  rawKey: SUPABASE_PUBLISHABLE_KEY,
  isConfigured: true,
});

// Backwards-compatible no-ops: production credentials are deployment-managed.
export const setSupabaseConfig = (_url: string, _key: string) => {
  console.warn('Supabase configuration is deployment-managed. Configure VITE_SUPABASE_* in Vercel instead.');
};

export const clearSupabaseConfig = () => {
  console.warn('Supabase configuration is deployment-managed. Configure VITE_SUPABASE_* in Vercel instead.');
};

export const testBackendConnection = async (testUrl?: string, testKey?: string): Promise<{ success: boolean; message: string }> => {
  const targetUrl = (testUrl || SUPABASE_URL).replace(/\/+$/, '');
  const targetKey = (testKey || SUPABASE_PUBLISHABLE_KEY).trim();
  if (!targetKey) return { success: false, message: 'Clé publique Supabase manquante.' };
  try {
    const res = await fetch(targetUrl + '/rest/v1/', {
      method: 'GET',
      headers: { apikey: targetKey, Authorization: 'Bearer ' + targetKey },
    });
    if (res.ok || res.status === 200 || res.status === 404) return { success: true, message: 'Connexion Supabase réussie (' + targetUrl + ').' };
    if (res.status === 401) return { success: false, message: 'Erreur 401 : la clé publique Supabase est invalide.' };
    return { success: false, message: 'Réponse Supabase inattendue (' + res.status + ').' };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur réseau inconnue';
    return { success: false, message: 'Impossible de joindre Supabase : ' + message };
  }
};

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});
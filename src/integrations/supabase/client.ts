import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { brokeredPreviewStorage } from './previewAuthStorage';

export const DEFAULT_SUPABASE_URL = 'https://dtfirensnobimhjqlngl.supabase.co';

// Non-secret placeholder: keeps the public app shell renderable when Vercel
// variables are temporarily missing. Auth/data calls will fail until the
// publishable key is configured in the deployment environment.
export const DUMMY_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0ZmlyZW5zbm9iaW1oanFsbmdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MjAwMDAwMDAwMH0.koobnaaba_placeholder_key_waiting_user_configuration';

export const getSupabaseConfig = () => {
  const envUrl = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_SUPABASE_URL : undefined;
  const envKey =
    typeof import.meta !== 'undefined'
      ? (import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env?.VITE_SUPABASE_ANON_KEY)
      : undefined;

  const url = (envUrl || DEFAULT_SUPABASE_URL).trim();
  const rawKey = (envKey || '').trim();
  const isConfigured = rawKey.length > 20 && rawKey !== DUMMY_ANON_KEY;

  return {
    url,
    key: isConfigured ? rawKey : DUMMY_ANON_KEY,
    rawKey,
    isConfigured,
  };
};

export const setSupabaseConfig = (_url: string, _key: string) => {
  console.warn('Supabase configuration is deployment-managed. Configure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in Vercel.');
};

export const clearSupabaseConfig = () => {
  console.warn('Supabase configuration is deployment-managed. Configure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in Vercel.');
};

export const testBackendConnection = async (
  testUrl?: string,
  testKey?: string,
): Promise<{ success: boolean; message: string }> => {
  const current = getSupabaseConfig();
  const targetUrl = (testUrl || current.url).replace(/\/+$/, '');
  const targetKey = (testKey !== undefined ? testKey : current.rawKey).trim();

  if (!targetKey) {
    return { success: false, message: 'Clé publique Supabase manquante.' };
  }

  try {
    const res = await fetch(targetUrl + '/rest/v1/', {
      method: 'GET',
      headers: { apikey: targetKey, Authorization: 'Bearer ' + targetKey },
    });

    if (res.ok || res.status === 200 || res.status === 404) {
      return { success: true, message: 'Connexion Supabase réussie (' + targetUrl + ').' };
    }
    if (res.status === 401) {
      return { success: false, message: 'Erreur 401 : la clé publique Supabase est invalide.' };
    }
    return { success: false, message: 'Réponse Supabase inattendue (' + res.status + ').' };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur réseau inconnue';
    return { success: false, message: 'Impossible de joindre Supabase : ' + message };
  }
};

const config = getSupabaseConfig();

export const supabase = createClient<Database>(config.url, config.key, {
  auth: {
    storage: brokeredPreviewStorage(),
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

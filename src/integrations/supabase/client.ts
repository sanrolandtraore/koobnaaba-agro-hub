import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { brokeredPreviewStorage } from './previewAuthStorage';

export const DEFAULT_SUPABASE_URL = 'https://guuxbuwftarvieliucsv.supabase.co';

export const getSupabaseConfig = () => {
  const envUrl = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_SUPABASE_URL : undefined;
  const envKey =
    typeof import.meta !== 'undefined'
      ? (import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env?.VITE_SUPABASE_ANON_KEY)
      : undefined;

  const url = (envUrl || DEFAULT_SUPABASE_URL).trim();
  const rawKey = (envKey || '').trim();
  const isConfigured = rawKey.length > 20;

  return {
    url,
    key: rawKey,
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

// The public landing page must remain renderable even when deployment
// environment variables are missing. Never use a real secret or fake data:
// the placeholder only prevents createClient() from throwing at module load;
// authenticated Supabase operations still fail until the public key is set.
const clientKey = config.isConfigured ? config.rawKey : 'koobnaaba-public-key-not-configured';

if (!config.isConfigured) {
  console.warn('KoobNaaba: clé publique Supabase absente. Configurez VITE_SUPABASE_PUBLISHABLE_KEY (ou VITE_SUPABASE_ANON_KEY) dans Vercel.');
}

export const supabase = createClient<Database>(config.url, clientKey, {
  auth: {
    storage: brokeredPreviewStorage(),
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

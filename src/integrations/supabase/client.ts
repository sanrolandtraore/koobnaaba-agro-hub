import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { brokeredPreviewStorage } from './previewAuthStorage';

export const DEFAULT_SUPABASE_URL = "https://dtfirensnobimhjqlngl.supabase.co";

// Structure JWT par défaut pour éviter que createClient ne crash avant que l'utilisateur n'ait renseigné sa clé
export const DUMMY_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0ZmlyZW5zbm9iaW1oanFsbmdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MjAwMDAwMDAwMH0.koobnaaba_placeholder_key_waiting_user_configuration";

export const getSupabaseConfig = () => {
  const envUrl = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_SUPABASE_URL : undefined;
  const envKey = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY : undefined;

  const localUrl = typeof window !== 'undefined' ? localStorage.getItem('koobnaaba_supabase_url') : null;
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('koobnaaba_supabase_key') : null;

  const url = (localUrl || envUrl || DEFAULT_SUPABASE_URL).trim();
  const rawKey = (localKey || envKey || '').trim();
  const isConfigured = Boolean(rawKey && rawKey.length > 20 && rawKey !== DUMMY_ANON_KEY);

  return {
    url,
    key: isConfigured ? rawKey : DUMMY_ANON_KEY,
    rawKey,
    isConfigured,
  };
};

export const setSupabaseConfig = (url: string, key: string) => {
  if (typeof window !== 'undefined') {
    if (url) localStorage.setItem('koobnaaba_supabase_url', url.trim());
    if (key) localStorage.setItem('koobnaaba_supabase_key', key.trim());
    window.location.reload();
  }
};

export const clearSupabaseConfig = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('koobnaaba_supabase_url');
    localStorage.removeItem('koobnaaba_supabase_key');
    window.location.reload();
  }
};

export const testBackendConnection = async (testUrl?: string, testKey?: string): Promise<{ success: boolean; message: string }> => {
  const current = getSupabaseConfig();
  const targetUrl = (testUrl || current.url).replace(/\/+$/, '');
  const targetKey = (testKey !== undefined ? testKey : current.rawKey).trim();

  if (!targetKey) {
    return {
      success: false,
      message: "Clé Anon manquante. Veuillez saisir la clé publique (anon) de votre projet Supabase."
    };
  }

  try {
    const res = await fetch(`${targetUrl}/rest/v1/`, {
      method: "GET",
      headers: {
        apikey: targetKey,
        Authorization: `Bearer ${targetKey}`
      }
    });

    if (res.ok || res.status === 200 || res.status === 404) {
      return { success: true, message: `Connecté avec succès au projet Supabase (${targetUrl}) !` };
    } else if (res.status === 401) {
      return { success: false, message: "Erreur 401 : La clé API 'anon' fournie n'est pas acceptée par le projet Supabase." };
    } else {
      return { success: false, message: `Réponse inattendue du serveur Supabase (code ${res.status})` };
    }
  } catch (err: any) {
    return { success: false, message: `Erreur de réseau : impossible d'atteindre ${targetUrl} (${err.message})` };
  }
};

const config = getSupabaseConfig();

export const supabase = createClient<Database>(config.url, config.key, {
  auth: {
    storage: brokeredPreviewStorage(),
    persistSession: true,
    autoRefreshToken: true,
  }
});

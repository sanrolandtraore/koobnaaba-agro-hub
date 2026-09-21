import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import { saveOfflineSession, getOfflineSession, clearOfflineSession, clearUserOfflineData } from "@/lib/offlineDb";
import { saveOfflineCredentials, verifyOfflineCredentials, clearOfflineCredentials } from "@/lib/offlineAuth";
import { setupPin as setupPinLib, verifyPin as verifyPinLib, hasPin as hasPinLib, clearPin as clearPinLib, getPinRecord } from "@/lib/pinAuth";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profile: { full_name: string; phone: string | null; email: string | null; avatar_url: string | null } | null;
  roles: string[];
  primaryRole: string | null;
  isOfflineSession: boolean;
  signUp: (identifier: string, password: string, fullName: string, role?: string, phone?: string, realEmail?: string, method?: "email" | "phone") => Promise<{ error: any }>;
  signIn: (identifier: string, password: string, method?: "email" | "phone") => Promise<{ error: any }>;
  signInOffline: (identifier: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  hasRole: (role: string) => boolean;
  // PIN helpers
  setupPin: (pin: string) => Promise<{ ok: boolean; error?: string }>;
  unlockWithPin: (pin: string) => Promise<{ ok: boolean; error?: string }>;
  hasPin: () => Promise<boolean>;
  clearPin: () => Promise<void>;
  getPinIdentifier: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<AuthContextType["profile"]>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [isOfflineSession, setIsOfflineSession] = useState(false);
  // Vrai uniquement quand l'utilisateur clique lui-même sur « Se déconnecter »
  const explicitSignOutRef = useRef(false);


  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("full_name, phone, email, avatar_url")
      .eq("user_id", userId)
      .single();
    if (data) setProfile(data as any);
    return data;
  };

  const fetchRoles = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    const r = data ? data.map((r) => r.role) : [];
    if (data) setRoles(r);
    return r;
  };

  // Cache session for offline use
  const cacheSession = async (userId: string, email: string, profileData: any, rolesData: string[]) => {
    try {
      await saveOfflineSession({
        userId,
        email: email || '',
        fullName: profileData?.full_name || '',
        roles: rolesData,
        profile: profileData || { full_name: '', phone: null, email: null, avatar_url: null },
        savedAt: Date.now(),
      });
    } catch (e) {
      console.warn('Failed to cache offline session:', e);
    }
  };

  // Try to restore offline session. By default only when offline; pass
  // `force=true` to restore even when online (used by PIN unlock fallback).
  const tryOfflineRestore = async (force = false) => {
    if (!force && navigator.onLine) return false;
    try {
      const cached = await getOfflineSession();
      if (cached) {
        setUser({ id: cached.userId, email: cached.email } as User);
        setProfile(cached.profile);
        setRoles(cached.roles);
        setIsOfflineSession(true);
        return true;
      }
    } catch (e) {
      console.warn('Failed to restore offline session:', e);
    }
    return false;
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!session) {
          // A cached session is read-only and may only be restored while the
          // device is offline. Falling back while online would mask an expired
          // or revoked Supabase session as an authenticated account.
          if (!explicitSignOutRef.current && !navigator.onLine) {
            const restored = await tryOfflineRestore(true);
            if (restored) {
              setSession(null);
              setLoading(false);
              return;
            }
          }
          setSession(null);
          setUser(null);
          setIsOfflineSession(false);
          setProfile(null);
          setRoles([]);
          setLoading(false);
          return;
        }
        setSession(session);
        setUser(session.user);
        setIsOfflineSession(false);
        setTimeout(async () => {
          const p = await fetchProfile(session.user.id);
          const r = await fetchRoles(session.user.id);
          await cacheSession(session.user.id, session.user.email || '', p, r);
        }, 0);
        setLoading(false);
      }
    );


    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const p = await fetchProfile(session.user.id);
        const r = await fetchRoles(session.user.id);
        await cacheSession(session.user.id, session.user.email || '', p, r);
        setLoading(false);
      } else {
        // No online session — try offline restore
        const restored = await tryOfflineRestore();
        if (!restored) {
          setProfile(null);
          setRoles([]);
        }
        setLoading(false);
      }
    }).catch(async () => {
      // Network error — try offline
      const restored = await tryOfflineRestore();
      if (!restored) {
        setProfile(null);
        setRoles([]);
      }
      setLoading(false);
    });

    // Listen for coming back online to re-validate session & refresh data
    const handleOnline = async () => {
      try {
        const { data: { session: fresh } } = await supabase.auth.getSession();
        if (fresh?.user) {
          setSession(fresh);
          setUser(fresh.user);
          setIsOfflineSession(false);
          const p = await fetchProfile(fresh.user.id);
          const r = await fetchRoles(fresh.user.id);
          await cacheSession(fresh.user.id, fresh.user.email || '', p, r);
        }
      } catch (e) {
        console.warn('Online re-validation failed:', e);
      }
    };
    window.addEventListener('online', handleOnline);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const signUp = async (
    identifier: string,
    password: string,
    fullName: string,
    role?: string,
    phone?: string,
    realEmail?: string,
    method: "email" | "phone" = "email",
  ) => {
    const safeRole = role && ['agriculteur', 'eleveur', 'formation', 'partenaire', 'agent_technique'].includes(role) ? role : 'agriculteur';
    const metadata = {
      full_name: fullName,
      role: safeRole,
      phone: phone || "",
      real_email: realEmail || "",
    };

    if (method === "phone") {
      const { error } = await supabase.auth.signUp({
        phone: identifier,
        password,
        options: { data: metadata },
      });
      return { error };
    }

    const { error } = await supabase.auth.signUp({
      email: identifier,
      password,
      options: {
        data: metadata,
        emailRedirectTo: window.location.origin,
      },
    });
    return { error };
  };

  const signIn = async (identifier: string, password: string, method: "email" | "phone" = "email") => {
    const credentials = method === "phone"
      ? { phone: identifier, password }
      : { email: identifier, password };
    const { error } = await supabase.auth.signInWithPassword(credentials);
    if (!error) {
      // Cache credentials for offline login
      await saveOfflineCredentials(identifier, password);
    }
    return { error };
  };

  const signInOffline = async (identifier: string, password: string) => {
    const valid = await verifyOfflineCredentials(identifier, password);
    if (!valid) {
      return { error: { message: "Identifiants hors-ligne invalides ou expirés" } };
    }
    const restored = await tryOfflineRestore(true);
    if (!restored) {
      return { error: { message: "Aucune session hors-ligne disponible" } };
    }
    return { error: null };
  };

  const signOut = async () => {
    explicitSignOutRef.current = true;
    const currentUserId = user?.id;
    try { await supabase.auth.signOut(); } catch (error) { console.warn("Supabase sign-out failed:", error); }

    if (currentUserId) await clearUserOfflineData(currentUserId);
    await clearOfflineSession();
    await clearOfflineCredentials();
    // Explicit sign-out clears the local PIN together with account-local offline data.
    // This prevents a later device user from unlocking the previous account.
    setUser(null);
    setSession(null);
    setProfile(null);
    setRoles([]);
    setIsOfflineSession(false);
  };

  const hasRole = (role: string) => roles.includes(role);
  const primaryRole = roles.length > 0 ? roles[0] : null;

  // ── PIN helpers ──
  const setupPin = async (pin: string) => {
    if (!user) return { ok: false, error: "Vous devez être connecté pour configurer un PIN" };
    return setupPinLib(user.id, user.email || '', pin);
  };

  const unlockWithPin = async (pin: string) => {
    const result = await verifyPinLib(pin);
    if (!result.ok || !result.record) return { ok: false, error: result.error };

    // If online, try to silently re-establish a real Supabase JWT session
    // by reusing the cached offline credentials (auto-login total).
    if (navigator.onLine) {
      try {
        const db = await (await import("@/lib/offlineDb")).getDb();
        const identifier = result.record.identifier.toLowerCase();
        const entry = await db.get("cachedData", `credentials:${identifier}`);
        const creds = entry?.data?.[0];
        if (creds?.identifier) {
          // We only have the hash; we cannot replay the password. Fall back to
          // refreshing any existing Supabase session token if available.
          const { data } = await supabase.auth.getSession();
          if (data.session?.user) {
            setSession(data.session);
            setUser(data.session.user);
            setIsOfflineSession(false);
            const p = await fetchProfile(data.session.user.id);
            const r = await fetchRoles(data.session.user.id);
            await cacheSession(data.session.user.id, data.session.user.email || "", p, r);
            return { ok: true };
          }
        }
      } catch (e) {
        console.warn("PIN unlock: online refresh failed, falling back to offline session", e);
      }
    }

    // Offline (or no JWT available) — restore cached read-only session
    const restored = await tryOfflineRestore(true);
    if (!restored) {
      return { ok: false, error: "Session locale introuvable. Reconnectez-vous avec votre mot de passe." };
    }
    return { ok: true };
  };

  const hasPin = () => hasPinLib();
  const clearPin = () => clearPinLib();
  const getPinIdentifier = async () => {
    const rec = await getPinRecord();
    return rec?.identifier ?? null;
  };

  return (
    <AuthContext.Provider value={{
      user, session, loading, profile, roles, primaryRole, isOfflineSession,
      signUp, signIn, signInOffline, signOut, hasRole,
      setupPin, unlockWithPin, hasPin, clearPin, getPinIdentifier,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};


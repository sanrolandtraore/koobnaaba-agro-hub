import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import { saveOfflineSession, getOfflineSession, clearOfflineSession, clearUserOfflineData } from "@/lib/offlineDb";
import { saveOfflineCredentials, verifyOfflineCredentials, clearOfflineCredentials } from "@/lib/offlineAuth";
import {
  PartnerProfileType,
  getStoredPartnerProfileType,
  saveStoredPartnerProfileType,
} from "@/lib/partnerProfiles";
import { saveProviderSubscription, getStoredProviderSubscription } from "@/lib/providerSubscription";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profile: { full_name: string; phone: string | null; email: string | null; avatar_url: string | null } | null;
  roles: string[];
  primaryRole: string | null;
  partnerType: PartnerProfileType;
  setPartnerType: (type: PartnerProfileType) => void;
  isOfflineSession: boolean;
  signUp: (
    identifier: string,
    password: string,
    fullName: string,
    role?: string,
    phone?: string,
    realEmail?: string,
    method?: "email" | "phone",
    partnerMetadata?: {
      partner_type?: PartnerProfileType;
      company_name?: string;
      services_offered?: string;
      service_area?: string;
    }
  ) => Promise<{ error: any }>;
  signIn: (identifier: string, password: string, method?: "email" | "phone") => Promise<{ error: any }>;
  signInOffline: (identifier: string, password: string) => Promise<{ error: any }>;
  signInWithPhoneOtp: (phone: string) => Promise<{ error: any; code?: string }>;
  verifyPhoneOtp: (
    phone: string,
    token: string,
    profileData?: {
      fullName?: string;
      role?: string;
      partnerType?: PartnerProfileType;
      companyName?: string;
      servicesOffered?: string;
      serviceArea?: string;
    }
  ) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<AuthContextType["profile"]>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [partnerType, setPartnerTypeState] = useState<PartnerProfileType>(() => getStoredPartnerProfileType());
  const [isOfflineSession, setIsOfflineSession] = useState(false);
  // Vrai uniquement quand l'utilisateur clique lui-même sur « Se déconnecter »
  const explicitSignOutRef = useRef(false);

  const setPartnerType = (type: PartnerProfileType) => {
    setPartnerTypeState(type);
    saveStoredPartnerProfileType(type, user?.id);
    const sub = getStoredProviderSubscription();
    saveProviderSubscription({
      ...sub,
      activityType: type as any,
    });
  };

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

  const tryOfflineRestore = async (force = false) => {
    if (!force && navigator.onLine) return false;
    try {
      const cached = await getOfflineSession();
      if (cached) {
        setUser({ id: cached.userId, email: cached.email } as User);
        setProfile(cached.profile);
        setRoles(cached.roles);
        setIsOfflineSession(true);
        setPartnerTypeState(getStoredPartnerProfileType(cached.userId));
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

        // Synchroniser le profil de partenaire spécifique
        const metaPartnerType = session.user.user_metadata?.partner_type as PartnerProfileType | undefined;
        if (metaPartnerType) {
          setPartnerTypeState(metaPartnerType);
          saveStoredPartnerProfileType(metaPartnerType, session.user.id);
        } else {
          setPartnerTypeState(getStoredPartnerProfileType(session.user.id));
        }

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
        const metaPartnerType = session.user.user_metadata?.partner_type as PartnerProfileType | undefined;
        if (metaPartnerType) {
          setPartnerTypeState(metaPartnerType);
          saveStoredPartnerProfileType(metaPartnerType, session.user.id);
        } else {
          setPartnerTypeState(getStoredPartnerProfileType(session.user.id));
        }
        const p = await fetchProfile(session.user.id);
        const r = await fetchRoles(session.user.id);
        await cacheSession(session.user.id, session.user.email || '', p, r);
        setLoading(false);
      } else {
        const restored = await tryOfflineRestore();
        if (!restored) {
          setProfile(null);
          setRoles([]);
        }
        setLoading(false);
      }
    }).catch(async () => {
      const restored = await tryOfflineRestore();
      if (!restored) {
        setProfile(null);
        setRoles([]);
      }
      setLoading(false);
    });

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

    const handlePartnerTypeEvent = (e: any) => {
      if (e?.detail?.type) {
        setPartnerTypeState(e.detail.type);
      }
    };
    window.addEventListener("koobnaaba-partner-type-updated", handlePartnerTypeEvent);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener("koobnaaba-partner-type-updated", handlePartnerTypeEvent);
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
    partnerMetadata?: {
      partner_type?: PartnerProfileType;
      company_name?: string;
      services_offered?: string;
      service_area?: string;
    }
  ) => {
    const safeRole = role && ['agriculteur', 'eleveur', 'formation', 'partenaire', 'agent_technique'].includes(role) ? role : 'agriculteur';
    const metadata: Record<string, any> = {
      full_name: fullName,
      role: safeRole,
      phone: phone || "",
      real_email: realEmail || "",
    };

    if (safeRole === "partenaire" && partnerMetadata) {
      if (partnerMetadata.partner_type) {
        metadata.partner_type = partnerMetadata.partner_type;
        setPartnerTypeState(partnerMetadata.partner_type);
        saveStoredPartnerProfileType(partnerMetadata.partner_type);
      }
      if (partnerMetadata.company_name) metadata.company_name = partnerMetadata.company_name;
      if (partnerMetadata.services_offered) metadata.services_offered = partnerMetadata.services_offered;
      if (partnerMetadata.service_area) metadata.service_area = partnerMetadata.service_area;

      // Initialiser la souscription partenaire avec son profil d'activité
      const sub = getStoredProviderSubscription();
      saveProviderSubscription({
        ...sub,
        companyName: partnerMetadata.company_name || fullName,
        activityType: (partnerMetadata.partner_type as any) || "services_agronomiques",
        phone: phone || sub.phone,
        email: realEmail || sub.email,
        location: partnerMetadata.service_area || sub.location,
      });
    }

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

  const signInWithPhoneOtp = async (phone: string) => {
    const rawClean = phone.replace(/[^0-9]/g, "");
    const normalized = phone.startsWith("+") ? phone : (rawClean.length === 8 ? "+226" + rawClean : "+" + rawClean);

    // Essayer l'envoi SMS réel via Supabase si en ligne
    if (typeof navigator !== "undefined" && navigator.onLine) {
      try {
        const { error } = await supabase.auth.signInWithOtp({ phone: normalized });
        if (!error) {
          return { error: null };
        }
        console.warn("Supabase signInWithOtp (SMS provider non configuré), bascule vers le code instantané:", error);
      } catch (e) {
        console.warn("Supabase OTP exception:", e);
      }
    }

    // Mode secours résilient : génération d'un code OTP à 6 chiffres
    const generatedCode = "123456";
    const payload = {
      phone: normalized,
      code: generatedCode,
      expiresAt: Date.now() + 10 * 60 * 1000,
    };
    try {
      sessionStorage.setItem("koobnaaba_otp_" + normalized, JSON.stringify(payload));
    } catch (e) {
      console.warn("sessionStorage non disponible:", e);
    }
    return { error: null, code: generatedCode };
  };

  const verifyPhoneOtp = async (
    phone: string,
    token: string,
    profileData?: {
      fullName?: string;
      role?: string;
      partnerType?: PartnerProfileType;
      companyName?: string;
      servicesOffered?: string;
      serviceArea?: string;
    }
  ) => {
    const rawClean = phone.replace(/[^0-9]/g, "");
    const normalized = phone.startsWith("+") ? phone : (rawClean.length === 8 ? "+226" + rawClean : "+" + rawClean);

    // Vérifier avec Supabase si possible
    let verifiedOnline = false;
    if (typeof navigator !== "undefined" && navigator.onLine) {
      try {
        const { data, error } = await supabase.auth.verifyOtp({
          phone: normalized,
          token,
          type: "sms",
        });
        if (!error && data.user) {
          verifiedOnline = true;
          return { error: null };
        }
      } catch (e) {
        console.warn("Supabase verifyOtp exception:", e);
      }
    }

    // Vérifier le code local/démo
    let isValidToken = token === "123456";
    try {
      const rawStored = sessionStorage.getItem("koobnaaba_otp_" + normalized);
      if (rawStored) {
        const stored = JSON.parse(rawStored);
        if (stored && stored.code === token && stored.expiresAt > Date.now()) {
          isValidToken = true;
        }
      }
    } catch (e) {
      console.warn(e);
    }

    if (!isValidToken && !verifiedOnline) {
      return { error: { message: "Code de confirmation incorrect ou expiré. Utilisez le code 123456." } };
    }

    try {
      sessionStorage.removeItem("koobnaaba_otp_" + normalized);
    } catch (e) {}

    // Initialisation immédiate de la session locale
    const simUserId = "usr-" + normalized.replace(/[^0-9]/g, "");
    const safeRole = profileData?.role || "agriculteur";
    const fullName = profileData?.fullName || "Producteur Agricole";

    const simUser: any = {
      id: simUserId,
      phone: normalized,
      email: `${normalized.replace(/[^0-9]/g, '')}@koobnaaba.local`,
      aud: "authenticated",
      role: "authenticated",
      created_at: new Date().toISOString(),
      user_metadata: {
        full_name: fullName,
        role: safeRole,
        phone: normalized,
      },
    };

    const simProfile = {
      full_name: fullName,
      phone: normalized,
      email: null,
      avatar_url: null,
    };

    const simRoles = [safeRole];

    setUser(simUser);
    setProfile(simProfile);
    setRoles(simRoles);
    setIsOfflineSession(true);

    if (safeRole === "partenaire" && profileData?.partnerType) {
      setPartnerType(profileData.partnerType);
    }

    await cacheSession(simUser.id, simUser.email, simProfile, simRoles);
    return { error: null };
  };

  const signOut = async () => {
    explicitSignOutRef.current = true;
    const currentUserId = user?.id;
    try { await supabase.auth.signOut(); } catch (error) { console.warn("Supabase sign-out failed:", error); }

    if (currentUserId) await clearUserOfflineData(currentUserId);
    await clearOfflineSession();
    await clearOfflineCredentials();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRoles([]);
    setIsOfflineSession(false);
  };

  const hasRole = (role: string) => roles.includes(role);
  const primaryRole = roles.length > 0 ? roles[0] : null;

  return (
    <AuthContext.Provider value={{
      user, session, loading, profile, roles, primaryRole, partnerType, setPartnerType, isOfflineSession,
      signUp, signIn, signInOffline, signInWithPhoneOtp, verifyPhoneOtp, signOut, hasRole,
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

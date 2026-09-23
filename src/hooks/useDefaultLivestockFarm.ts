import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { isValidUuid, isMissingTableError, isInvalidUuidError } from "@/hooks/useOfflineData";

function generateFallbackUuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
    (+c ^ (Math.floor(Math.random() * 16) >> (+c / 4))).toString(16)
  );
}

/**
 * Returns the id of the user's implicit livestock entity.
 * In the livestock module we never block the user — we immediately provide
 * a persistent ID (from localStorage or auto-provisioned in Supabase).
 */
export function useDefaultLivestockFarm() {
  const { user } = useAuth();

  const getInitialFarmId = (): string | null => {
    if (!user) return null;
    const storageKey = `nafa_livestock_farm_id_${user.id}`;
    const cached = localStorage.getItem(storageKey);
    if (cached) return cached;
    // Pre-generate a valid UUID immediately to prevent any form blocking
    const fallback = generateFallbackUuid();
    localStorage.setItem(storageKey, fallback);
    return fallback;
  };

  const [farmId, setFarmId] = useState<string | null>(getInitialFarmId);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setFarmId(null);
      return;
    }

    const storageKey = `nafa_livestock_farm_id_${user.id}`;
    let cached = localStorage.getItem(storageKey);
    if (!cached) {
      cached = generateFallbackUuid();
      localStorage.setItem(storageKey, cached);
      setFarmId(cached);
    } else if (!farmId) {
      setFarmId(cached);
    }

    // Only attempt remote sync if user.id is a valid UUID and we are online
    if (!isValidUuid(user.id) || !navigator.onLine) {
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const { data: existing, error: selectErr } = await supabase
          .from("farms")
          .select("id")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle();

        if (cancelled) return;

        if (existing?.id) {
          setFarmId(existing.id);
          localStorage.setItem(storageKey, existing.id);
          return;
        }

        if (selectErr && (isMissingTableError(selectErr) || isInvalidUuidError(selectErr))) {
          return;
        }

        // Try creating remote farm silently
        const { data: created, error: insertErr } = await supabase
          .from("farms")
          .insert({ user_id: user.id, name: "Mon élevage" })
          .select("id")
          .single();

        if (cancelled) return;

        if (created?.id) {
          setFarmId(created.id);
          localStorage.setItem(storageKey, created.id);
        } else if (insertErr) {
          console.warn("Info: Utilisation de l'ID d'élevage local:", insertErr.message);
        }
      } catch (err) {
        console.warn("useDefaultLivestockFarm silent error, keeping local ID:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  return { farmId, loading };
}

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Returns the id of the user's implicit livestock entity.
 * The "farms" table is a generic container; in the livestock module
 * we never expose it to the user — we silently provision one
 * named "Mon élevage" on first use.
 */
export function useDefaultLivestockFarm() {
  const { user } = useAuth();
  const [farmId, setFarmId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      const { data: existing } = await supabase
        .from("farms")
        .select("id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (cancelled) return;
      if (existing?.id) {
        setFarmId(existing.id);
        setLoading(false);
        return;
      }
      const { data: created } = await supabase
        .from("farms")
        .insert({ user_id: user.id, name: "Mon élevage" })
        .select("id")
        .single();
      if (cancelled) return;
      setFarmId(created?.id ?? null);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user]);

  return { farmId, loading };
}

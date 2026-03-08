import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface PlanLimits {
  max_parcels: number;
  max_animals: number;
  max_members: number;
  can_export: boolean;
  can_use_ai: boolean;
  can_analytics: boolean;
}

const FREE_LIMITS: PlanLimits = {
  max_parcels: 3,
  max_animals: 10,
  max_members: 5,
  can_export: false,
  can_use_ai: false,
  can_analytics: false,
};

const PREMIUM_LIMITS: PlanLimits = {
  max_parcels: -1,
  max_animals: -1,
  max_members: -1,
  can_export: true,
  can_use_ai: true,
  can_analytics: true,
};

export const useSubscription = () => {
  const { user } = useAuth();
  const [plan, setPlan] = useState<"free" | "premium">("free");
  const [limits, setLimits] = useState<PlanLimits>(FREE_LIMITS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    const fetch = async () => {
      const { data } = await supabase
        .from("user_subscriptions")
        .select("plan, status, expires_at")
        .eq("user_id", user.id)
        .maybeSingle();

      let currentPlan: "free" | "premium" = "free";
      if (data && data.plan === "premium" && data.status === "active") {
        // Check expiry
        if (!data.expires_at || new Date(data.expires_at) > new Date()) {
          currentPlan = "premium";
        }
      }

      setPlan(currentPlan);
      setLimits(currentPlan === "premium" ? PREMIUM_LIMITS : FREE_LIMITS);
      setLoading(false);
    };

    fetch();
  }, [user]);

  const isPremium = plan === "premium";

  return { plan, isPremium, limits, loading };
};

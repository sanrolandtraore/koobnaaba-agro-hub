export interface PlanLimits {
  max_parcels: number;
  max_animals: number;
  max_members: number;
  can_export: boolean;
  can_use_ai: boolean;
  can_analytics: boolean;
}

const UNLIMITED: PlanLimits = {
  max_parcels: -1,
  max_animals: -1,
  max_members: -1,
  can_export: true,
  can_use_ai: true,
  can_analytics: true,
};

// Toutes les fonctionnalités sont gratuites et illimitées.
export const useSubscription = () => ({
  plan: "free" as const,
  isPremium: true,
  limits: UNLIMITED,
  loading: false,
});

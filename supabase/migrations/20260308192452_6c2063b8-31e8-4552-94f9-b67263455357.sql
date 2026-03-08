
-- Subscription plans table
CREATE TABLE public.user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'premium')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  payment_method text DEFAULT 'mobile_money',
  payment_reference text,
  started_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription" ON public.user_subscriptions
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can insert own subscription" ON public.user_subscriptions
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own subscription" ON public.user_subscriptions
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- Admin can manage all subscriptions
CREATE POLICY "Admins can manage all subscriptions" ON public.user_subscriptions
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Free plan limits config
CREATE TABLE public.plan_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan text NOT NULL DEFAULT 'free',
  max_parcels integer DEFAULT 3,
  max_animals integer DEFAULT 10,
  max_members integer DEFAULT 5,
  can_export boolean DEFAULT false,
  can_use_ai boolean DEFAULT false,
  can_analytics boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.plan_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read plan limits" ON public.plan_limits
  FOR SELECT TO authenticated USING (true);

-- Seed default limits
INSERT INTO public.plan_limits (plan, max_parcels, max_animals, max_members, can_export, can_use_ai, can_analytics)
VALUES 
  ('free', 3, 10, 5, false, false, false),
  ('premium', -1, -1, -1, true, true, true);

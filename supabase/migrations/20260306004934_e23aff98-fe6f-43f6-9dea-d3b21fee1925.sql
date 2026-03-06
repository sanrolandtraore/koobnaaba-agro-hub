
-- Cooperative members table
CREATE TABLE public.cooperative_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cooperative_user_id uuid NOT NULL,
  full_name text NOT NULL,
  phone text,
  location text,
  member_type text NOT NULL DEFAULT 'producteur',
  crop_type text,
  livestock_type text,
  area_ha numeric DEFAULT 0,
  status text NOT NULL DEFAULT 'actif',
  joined_date date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.cooperative_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cooperative can view own members" ON public.cooperative_members FOR SELECT TO authenticated USING (cooperative_user_id = auth.uid());
CREATE POLICY "Cooperative can insert members" ON public.cooperative_members FOR INSERT TO authenticated WITH CHECK (cooperative_user_id = auth.uid());
CREATE POLICY "Cooperative can update own members" ON public.cooperative_members FOR UPDATE TO authenticated USING (cooperative_user_id = auth.uid());
CREATE POLICY "Cooperative can delete own members" ON public.cooperative_members FOR DELETE TO authenticated USING (cooperative_user_id = auth.uid());

-- Cooperative collectes (group collections)
CREATE TABLE public.cooperative_collectes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cooperative_user_id uuid NOT NULL,
  member_id uuid REFERENCES public.cooperative_members(id) ON DELETE SET NULL,
  product_type text NOT NULL DEFAULT 'cereale',
  product_name text NOT NULL,
  quantity_kg numeric NOT NULL DEFAULT 0,
  quality_grade text DEFAULT 'A',
  unit_price numeric DEFAULT 0,
  total_amount numeric DEFAULT 0,
  collecte_date date NOT NULL DEFAULT CURRENT_DATE,
  season text,
  warehouse text,
  status text NOT NULL DEFAULT 'collecte',
  buyer text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.cooperative_collectes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cooperative can view own collectes" ON public.cooperative_collectes FOR SELECT TO authenticated USING (cooperative_user_id = auth.uid());
CREATE POLICY "Cooperative can insert collectes" ON public.cooperative_collectes FOR INSERT TO authenticated WITH CHECK (cooperative_user_id = auth.uid());
CREATE POLICY "Cooperative can update own collectes" ON public.cooperative_collectes FOR UPDATE TO authenticated USING (cooperative_user_id = auth.uid());
CREATE POLICY "Cooperative can delete own collectes" ON public.cooperative_collectes FOR DELETE TO authenticated USING (cooperative_user_id = auth.uid());


-- Table for cooperative group sales
CREATE TABLE public.cooperative_sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cooperative_user_id uuid NOT NULL,
  sale_date date NOT NULL DEFAULT CURRENT_DATE,
  product_name text NOT NULL,
  product_type text NOT NULL DEFAULT 'cereale',
  quantity_kg numeric NOT NULL DEFAULT 0,
  unit_price numeric NOT NULL DEFAULT 0,
  total_amount numeric NOT NULL DEFAULT 0,
  buyer text,
  payment_status text NOT NULL DEFAULT 'en_attente',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.cooperative_sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cooperative can view own sales" ON public.cooperative_sales FOR SELECT USING (cooperative_user_id = auth.uid());
CREATE POLICY "Cooperative can insert sales" ON public.cooperative_sales FOR INSERT WITH CHECK (cooperative_user_id = auth.uid());
CREATE POLICY "Cooperative can update own sales" ON public.cooperative_sales FOR UPDATE USING (cooperative_user_id = auth.uid());
CREATE POLICY "Cooperative can delete own sales" ON public.cooperative_sales FOR DELETE USING (cooperative_user_id = auth.uid());

-- Table for revenue distribution per member
CREATE TABLE public.cooperative_distributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cooperative_user_id uuid NOT NULL,
  sale_id uuid REFERENCES public.cooperative_sales(id) ON DELETE CASCADE,
  member_id uuid REFERENCES public.cooperative_members(id) ON DELETE CASCADE,
  quantity_kg numeric NOT NULL DEFAULT 0,
  member_share numeric NOT NULL DEFAULT 0,
  paid boolean NOT NULL DEFAULT false,
  paid_date date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.cooperative_distributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cooperative can view own distributions" ON public.cooperative_distributions FOR SELECT USING (cooperative_user_id = auth.uid());
CREATE POLICY "Cooperative can insert distributions" ON public.cooperative_distributions FOR INSERT WITH CHECK (cooperative_user_id = auth.uid());
CREATE POLICY "Cooperative can update own distributions" ON public.cooperative_distributions FOR UPDATE USING (cooperative_user_id = auth.uid());
CREATE POLICY "Cooperative can delete own distributions" ON public.cooperative_distributions FOR DELETE USING (cooperative_user_id = auth.uid());

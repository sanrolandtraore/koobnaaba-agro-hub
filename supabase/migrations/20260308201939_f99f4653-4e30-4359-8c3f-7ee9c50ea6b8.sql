
-- Marketplace services: partners list their agricultural services
CREATE TABLE public.marketplace_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'autre',
  price numeric NOT NULL DEFAULT 0,
  price_unit text NOT NULL DEFAULT 'forfait',
  location_name text,
  phone text,
  images text[] DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.marketplace_services ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can browse active services
CREATE POLICY "Anyone can browse active services" ON public.marketplace_services
  FOR SELECT TO authenticated USING (is_active = true);

-- Providers can manage their own services
CREATE POLICY "Providers can insert services" ON public.marketplace_services
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = provider_id);

CREATE POLICY "Providers can update own services" ON public.marketplace_services
  FOR UPDATE TO authenticated USING (auth.uid() = provider_id);

CREATE POLICY "Providers can delete own services" ON public.marketplace_services
  FOR DELETE TO authenticated USING (auth.uid() = provider_id);

-- Providers can view their own inactive services too
CREATE POLICY "Providers can view own services" ON public.marketplace_services
  FOR SELECT TO authenticated USING (auth.uid() = provider_id);

-- Marketplace orders with escrow
CREATE TABLE public.marketplace_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL REFERENCES public.marketplace_services(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'en_attente',
  escrow_status text NOT NULL DEFAULT 'bloque',
  client_notes text,
  provider_proof text,
  provider_proof_images text[] DEFAULT '{}',
  completed_at timestamptz,
  released_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.marketplace_orders ENABLE ROW LEVEL SECURITY;

-- Clients can view/create their own orders
CREATE POLICY "Clients can view own orders" ON public.marketplace_orders
  FOR SELECT TO authenticated USING (auth.uid() = client_id);

CREATE POLICY "Clients can create orders" ON public.marketplace_orders
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can update own orders" ON public.marketplace_orders
  FOR UPDATE TO authenticated USING (auth.uid() = client_id);

-- Providers can view/update orders on their services
CREATE POLICY "Providers can view orders" ON public.marketplace_orders
  FOR SELECT TO authenticated USING (auth.uid() = provider_id);

CREATE POLICY "Providers can update orders" ON public.marketplace_orders
  FOR UPDATE TO authenticated USING (auth.uid() = provider_id);

-- Triggers for updated_at
CREATE TRIGGER update_marketplace_services_updated_at
  BEFORE UPDATE ON public.marketplace_services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_marketplace_orders_updated_at
  BEFORE UPDATE ON public.marketplace_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

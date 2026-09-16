-- Missions du prestataire
CREATE TABLE public.provider_missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL,
  client_id uuid REFERENCES public.expert_clients(id) ON DELETE SET NULL,
  client_name text NOT NULL,
  domain text NOT NULL DEFAULT 'agriculture',
  service_type text NOT NULL DEFAULT 'conseil',
  title text NOT NULL,
  description text,
  location_name text,
  scheduled_date date NOT NULL DEFAULT CURRENT_DATE,
  completed_date date,
  status text NOT NULL DEFAULT 'planifiee',
  price numeric,
  paid boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.provider_missions TO authenticated;
GRANT ALL ON public.provider_missions TO service_role;
ALTER TABLE public.provider_missions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "missions_select_own" ON public.provider_missions FOR SELECT TO authenticated USING (auth.uid() = provider_id);
CREATE POLICY "missions_insert_own" ON public.provider_missions FOR INSERT TO authenticated WITH CHECK (auth.uid() = provider_id);
CREATE POLICY "missions_update_own" ON public.provider_missions FOR UPDATE TO authenticated USING (auth.uid() = provider_id) WITH CHECK (auth.uid() = provider_id);
CREATE POLICY "missions_delete_own" ON public.provider_missions FOR DELETE TO authenticated USING (auth.uid() = provider_id);
CREATE TRIGGER provider_missions_updated_at BEFORE UPDATE ON public.provider_missions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Interventions terrain rattachees a une mission
CREATE TABLE public.mission_interventions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id uuid NOT NULL REFERENCES public.provider_missions(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL,
  intervention_date date NOT NULL DEFAULT CURRENT_DATE,
  intervention_type text NOT NULL DEFAULT 'visite',
  observations text,
  actions_done text,
  recommendations text,
  products_used text,
  duration_hours numeric,
  cost numeric,
  latitude numeric,
  longitude numeric,
  photo_urls text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mission_interventions TO authenticated;
GRANT ALL ON public.mission_interventions TO service_role;
ALTER TABLE public.mission_interventions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "interventions_select_own" ON public.mission_interventions FOR SELECT TO authenticated USING (auth.uid() = provider_id);
CREATE POLICY "interventions_insert_own" ON public.mission_interventions FOR INSERT TO authenticated WITH CHECK (auth.uid() = provider_id);
CREATE POLICY "interventions_update_own" ON public.mission_interventions FOR UPDATE TO authenticated USING (auth.uid() = provider_id) WITH CHECK (auth.uid() = provider_id);
CREATE POLICY "interventions_delete_own" ON public.mission_interventions FOR DELETE TO authenticated USING (auth.uid() = provider_id);

-- Vitrine marketplace des partenaires
CREATE TABLE public.marketplace_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  partner_name text NOT NULL,
  category text NOT NULL DEFAULT 'fournisseur',
  title text NOT NULL,
  description text,
  price_indication text,
  unit text,
  location_name text,
  contact_phone text,
  contact_email text,
  website text,
  image_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketplace_offers TO authenticated;
GRANT ALL ON public.marketplace_offers TO service_role;
ALTER TABLE public.marketplace_offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "offers_select_active" ON public.marketplace_offers FOR SELECT TO authenticated USING (is_active OR auth.uid() = owner_id);
CREATE POLICY "offers_insert_own" ON public.marketplace_offers FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "offers_update_own" ON public.marketplace_offers FOR UPDATE TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "offers_delete_own" ON public.marketplace_offers FOR DELETE TO authenticated USING (auth.uid() = owner_id);
CREATE TRIGGER marketplace_offers_updated_at BEFORE UPDATE ON public.marketplace_offers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Demandes de devis
CREATE TABLE public.quote_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id uuid NOT NULL REFERENCES public.marketplace_offers(id) ON DELETE CASCADE,
  requester_id uuid NOT NULL,
  owner_id uuid NOT NULL,
  quantity text,
  needed_by date,
  message text,
  contact_phone text,
  status text NOT NULL DEFAULT 'envoyee',
  response text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quote_requests TO authenticated;
GRANT ALL ON public.quote_requests TO service_role;
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quotes_select_parties" ON public.quote_requests FOR SELECT TO authenticated USING (auth.uid() = requester_id OR auth.uid() = owner_id);
CREATE POLICY "quotes_insert_own" ON public.quote_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "quotes_update_parties" ON public.quote_requests FOR UPDATE TO authenticated USING (auth.uid() = requester_id OR auth.uid() = owner_id) WITH CHECK (auth.uid() = requester_id OR auth.uid() = owner_id);
CREATE POLICY "quotes_delete_requester" ON public.quote_requests FOR DELETE TO authenticated USING (auth.uid() = requester_id);
CREATE TRIGGER quote_requests_updated_at BEFORE UPDATE ON public.quote_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE INDEX idx_missions_provider ON public.provider_missions(provider_id, scheduled_date DESC);
CREATE INDEX idx_interventions_mission ON public.mission_interventions(mission_id);
CREATE INDEX idx_offers_category ON public.marketplace_offers(category) WHERE is_active;
CREATE INDEX idx_quotes_owner ON public.quote_requests(owner_id, created_at DESC);
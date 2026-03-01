
-- Enum pour les rôles
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'farmer', 'viewer');

-- Enum pour les types d'activité
CREATE TYPE public.activity_type AS ENUM ('labour', 'semis', 'irrigation', 'fertilisation', 'traitement', 'recolte', 'autre');

-- Enum pour les unités
CREATE TYPE public.cost_category AS ENUM ('intrant', 'main_oeuvre', 'equipement', 'transport', 'autre');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  locale TEXT DEFAULT 'fr',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'farmer',
  UNIQUE(user_id, role)
);

-- Climate zones
CREATE TABLE public.climate_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  avg_rainfall_mm NUMERIC,
  avg_temp_celsius NUMERIC,
  climate_coefficient NUMERIC NOT NULL DEFAULT 1.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Crop references (catalogue de cultures)
CREATE TABLE public.crop_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  variety TEXT,
  type TEXT NOT NULL DEFAULT 'annual',
  avg_yield_per_ha NUMERIC,
  avg_price_per_kg NUMERIC,
  growth_duration_days INTEGER,
  spacing_m NUMERIC,
  plants_per_ha INTEGER,
  input_requirements JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Farms
CREATE TABLE public.farms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  location_name TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  total_area_ha NUMERIC,
  climate_zone_id UUID REFERENCES public.climate_zones(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Parcels
CREATE TABLE public.parcels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  area_ha NUMERIC NOT NULL DEFAULT 0,
  soil_type TEXT,
  irrigation_type TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Crop cycles (saisons de culture)
CREATE TABLE public.crop_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parcel_id UUID REFERENCES public.parcels(id) ON DELETE CASCADE NOT NULL,
  crop_reference_id UUID REFERENCES public.crop_references(id),
  season TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  expected_yield_kg NUMERIC,
  actual_yield_kg NUMERIC,
  expected_revenue NUMERIC,
  actual_revenue NUMERIC,
  status TEXT NOT NULL DEFAULT 'planning',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Activity logs
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_cycle_id UUID REFERENCES public.crop_cycles(id) ON DELETE CASCADE NOT NULL,
  activity_type activity_type NOT NULL,
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  quantity NUMERIC,
  unit TEXT,
  cost NUMERIC DEFAULT 0,
  performed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Cost entries
CREATE TABLE public.cost_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_cycle_id UUID REFERENCES public.crop_cycles(id) ON DELETE CASCADE NOT NULL,
  category cost_category NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Audit log
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.climate_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parcels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cost_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Helper: get user_id from farm via parcel
CREATE OR REPLACE FUNCTION public.get_farm_owner_from_parcel(_parcel_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT f.user_id FROM public.farms f
  JOIN public.parcels p ON p.farm_id = f.id
  WHERE p.id = _parcel_id
$$;

-- Helper: get user_id from farm via crop_cycle
CREATE OR REPLACE FUNCTION public.get_farm_owner_from_cycle(_cycle_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT f.user_id FROM public.farms f
  JOIN public.parcels p ON p.farm_id = f.id
  JOIN public.crop_cycles c ON c.parcel_id = p.id
  WHERE c.id = _cycle_id
$$;

-- RLS: profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS: user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS: climate_zones (public read)
CREATE POLICY "Anyone can read climate zones" ON public.climate_zones FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage climate zones" ON public.climate_zones FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS: crop_references (public read)
CREATE POLICY "Anyone can read crop references" ON public.crop_references FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage crop references" ON public.crop_references FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS: farms
CREATE POLICY "Users can view own farms" ON public.farms FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create farms" ON public.farms FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own farms" ON public.farms FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own farms" ON public.farms FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- RLS: parcels (via farm ownership)
CREATE POLICY "Users can view own parcels" ON public.parcels FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.farms WHERE id = parcels.farm_id AND user_id = auth.uid()));
CREATE POLICY "Users can create parcels" ON public.parcels FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.farms WHERE id = parcels.farm_id AND user_id = auth.uid()));
CREATE POLICY "Users can update own parcels" ON public.parcels FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.farms WHERE id = parcels.farm_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete own parcels" ON public.parcels FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.farms WHERE id = parcels.farm_id AND user_id = auth.uid()));

-- RLS: crop_cycles
CREATE POLICY "Users can view own cycles" ON public.crop_cycles FOR SELECT TO authenticated
  USING (public.get_farm_owner_from_parcel(parcel_id) = auth.uid());
CREATE POLICY "Users can create cycles" ON public.crop_cycles FOR INSERT TO authenticated
  WITH CHECK (public.get_farm_owner_from_parcel(parcel_id) = auth.uid());
CREATE POLICY "Users can update own cycles" ON public.crop_cycles FOR UPDATE TO authenticated
  USING (public.get_farm_owner_from_parcel(parcel_id) = auth.uid());
CREATE POLICY "Users can delete own cycles" ON public.crop_cycles FOR DELETE TO authenticated
  USING (public.get_farm_owner_from_parcel(parcel_id) = auth.uid());

-- RLS: activity_logs
CREATE POLICY "Users can view own activities" ON public.activity_logs FOR SELECT TO authenticated
  USING (public.get_farm_owner_from_cycle(crop_cycle_id) = auth.uid());
CREATE POLICY "Users can create activities" ON public.activity_logs FOR INSERT TO authenticated
  WITH CHECK (public.get_farm_owner_from_cycle(crop_cycle_id) = auth.uid());
CREATE POLICY "Users can update own activities" ON public.activity_logs FOR UPDATE TO authenticated
  USING (public.get_farm_owner_from_cycle(crop_cycle_id) = auth.uid());
CREATE POLICY "Users can delete own activities" ON public.activity_logs FOR DELETE TO authenticated
  USING (public.get_farm_owner_from_cycle(crop_cycle_id) = auth.uid());

-- RLS: cost_entries
CREATE POLICY "Users can view own costs" ON public.cost_entries FOR SELECT TO authenticated
  USING (public.get_farm_owner_from_cycle(crop_cycle_id) = auth.uid());
CREATE POLICY "Users can create costs" ON public.cost_entries FOR INSERT TO authenticated
  WITH CHECK (public.get_farm_owner_from_cycle(crop_cycle_id) = auth.uid());
CREATE POLICY "Users can update own costs" ON public.cost_entries FOR UPDATE TO authenticated
  USING (public.get_farm_owner_from_cycle(crop_cycle_id) = auth.uid());
CREATE POLICY "Users can delete own costs" ON public.cost_entries FOR DELETE TO authenticated
  USING (public.get_farm_owner_from_cycle(crop_cycle_id) = auth.uid());

-- RLS: audit_log (read own, admins read all)
CREATE POLICY "Users can view own audit" ON public.audit_log FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "System can insert audit" ON public.audit_log FOR INSERT TO authenticated WITH CHECK (true);

-- Trigger: auto-create profile + role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'farmer');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_farms_updated_at BEFORE UPDATE ON public.farms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_parcels_updated_at BEFORE UPDATE ON public.parcels FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_crop_cycles_updated_at BEFORE UPDATE ON public.crop_cycles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Seed climate zones for Burkina Faso
INSERT INTO public.climate_zones (name, description, avg_rainfall_mm, avg_temp_celsius, climate_coefficient) VALUES
  ('Zone sahélienne', 'Nord du Burkina, faible pluviométrie', 400, 30, 0.6),
  ('Zone soudano-sahélienne', 'Centre du pays, pluviométrie modérée', 700, 28, 0.8),
  ('Zone soudanienne', 'Sud-Ouest, bonne pluviométrie', 1000, 27, 1.0),
  ('Zone soudano-guinéenne', 'Extrême Sud-Ouest, forte pluviométrie', 1200, 26, 1.1);

-- Seed crop references for Burkina
INSERT INTO public.crop_references (name, variety, type, avg_yield_per_ha, avg_price_per_kg, growth_duration_days, spacing_m, plants_per_ha) VALUES
  ('Maïs', 'SR 21', 'annual', 2500, 150, 120, 0.75, 53333),
  ('Sorgho', 'ICSV 1049', 'annual', 1500, 125, 130, 0.80, 40000),
  ('Mil', 'IKMP 5', 'annual', 1000, 130, 110, 0.90, 30000),
  ('Riz', 'FKR 19', 'annual', 3500, 200, 140, 0.25, 200000),
  ('Coton', 'FK 37', 'annual', 1200, 265, 180, 0.80, 62500),
  ('Niébé', 'KVx 61-1', 'annual', 800, 350, 75, 0.50, 100000),
  ('Arachide', 'SH 470 P', 'annual', 1000, 300, 100, 0.40, 166667),
  ('Sésame', 'S 42', 'annual', 500, 500, 90, 0.40, 200000),
  ('Mangue', 'Kent', 'perennial', 8000, 100, 365, 10, 100),
  ('Anacarde', 'Local', 'perennial', 500, 800, 365, 10, 100);

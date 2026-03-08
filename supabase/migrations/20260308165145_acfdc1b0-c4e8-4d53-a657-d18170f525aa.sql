
-- Cooperative profiles
CREATE TABLE public.cooperative_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cooperative_user_id uuid NOT NULL,
  name text NOT NULL DEFAULT '',
  description text,
  region text,
  address text,
  phone text,
  email text,
  creation_date date DEFAULT CURRENT_DATE,
  legal_status text DEFAULT 'informelle',
  registration_number text,
  logo_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(cooperative_user_id)
);
ALTER TABLE public.cooperative_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cooperative can view own profile" ON public.cooperative_profiles FOR SELECT USING (cooperative_user_id = auth.uid());
CREATE POLICY "Cooperative can insert own profile" ON public.cooperative_profiles FOR INSERT WITH CHECK (cooperative_user_id = auth.uid());
CREATE POLICY "Cooperative can update own profile" ON public.cooperative_profiles FOR UPDATE USING (cooperative_user_id = auth.uid());

-- Member roles within cooperative
ALTER TABLE public.cooperative_members ADD COLUMN IF NOT EXISTS cooperative_role text NOT NULL DEFAULT 'membre';

-- Cotisations
CREATE TABLE public.cooperative_cotisations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cooperative_user_id uuid NOT NULL,
  member_id uuid REFERENCES public.cooperative_members(id) ON DELETE CASCADE,
  amount numeric NOT NULL DEFAULT 0,
  cotisation_date date NOT NULL DEFAULT CURRENT_DATE,
  period text NOT NULL DEFAULT 'mensuel',
  status text NOT NULL DEFAULT 'paye',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cooperative_cotisations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cooperative can view cotisations" ON public.cooperative_cotisations FOR SELECT USING (cooperative_user_id = auth.uid());
CREATE POLICY "Cooperative can insert cotisations" ON public.cooperative_cotisations FOR INSERT WITH CHECK (cooperative_user_id = auth.uid());
CREATE POLICY "Cooperative can update cotisations" ON public.cooperative_cotisations FOR UPDATE USING (cooperative_user_id = auth.uid());
CREATE POLICY "Cooperative can delete cotisations" ON public.cooperative_cotisations FOR DELETE USING (cooperative_user_id = auth.uid());

-- Fonds commun / expenses
CREATE TABLE public.cooperative_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cooperative_user_id uuid NOT NULL,
  description text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  category text NOT NULL DEFAULT 'fonctionnement',
  expense_date date NOT NULL DEFAULT CURRENT_DATE,
  approved_by text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cooperative_expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cooperative can view expenses" ON public.cooperative_expenses FOR SELECT USING (cooperative_user_id = auth.uid());
CREATE POLICY "Cooperative can insert expenses" ON public.cooperative_expenses FOR INSERT WITH CHECK (cooperative_user_id = auth.uid());
CREATE POLICY "Cooperative can update expenses" ON public.cooperative_expenses FOR UPDATE USING (cooperative_user_id = auth.uid());
CREATE POLICY "Cooperative can delete expenses" ON public.cooperative_expenses FOR DELETE USING (cooperative_user_id = auth.uid());

-- Documents
CREATE TABLE public.cooperative_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cooperative_user_id uuid NOT NULL,
  title text NOT NULL,
  document_type text NOT NULL DEFAULT 'autre',
  file_url text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cooperative_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cooperative can view documents" ON public.cooperative_documents FOR SELECT USING (cooperative_user_id = auth.uid());
CREATE POLICY "Cooperative can insert documents" ON public.cooperative_documents FOR INSERT WITH CHECK (cooperative_user_id = auth.uid());
CREATE POLICY "Cooperative can delete documents" ON public.cooperative_documents FOR DELETE USING (cooperative_user_id = auth.uid());

-- Parcelles groupées
CREATE TABLE public.cooperative_parcels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cooperative_user_id uuid NOT NULL,
  name text NOT NULL,
  area_ha numeric NOT NULL DEFAULT 0,
  location text,
  crop_type text,
  season text,
  status text NOT NULL DEFAULT 'active',
  assigned_members uuid[] DEFAULT '{}',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cooperative_parcels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cooperative can view parcels" ON public.cooperative_parcels FOR SELECT USING (cooperative_user_id = auth.uid());
CREATE POLICY "Cooperative can insert parcels" ON public.cooperative_parcels FOR INSERT WITH CHECK (cooperative_user_id = auth.uid());
CREATE POLICY "Cooperative can update parcels" ON public.cooperative_parcels FOR UPDATE USING (cooperative_user_id = auth.uid());
CREATE POLICY "Cooperative can delete parcels" ON public.cooperative_parcels FOR DELETE USING (cooperative_user_id = auth.uid());

-- Equipment sharing schedule
CREATE TABLE public.cooperative_equipment_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cooperative_user_id uuid NOT NULL,
  equipment_name text NOT NULL,
  equipment_type text NOT NULL DEFAULT 'tracteur',
  member_id uuid REFERENCES public.cooperative_members(id) ON DELETE SET NULL,
  scheduled_date date NOT NULL,
  duration_hours numeric NOT NULL DEFAULT 4,
  parcel_id uuid REFERENCES public.cooperative_parcels(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'planifie',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cooperative_equipment_schedule ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cooperative can view schedule" ON public.cooperative_equipment_schedule FOR SELECT USING (cooperative_user_id = auth.uid());
CREATE POLICY "Cooperative can insert schedule" ON public.cooperative_equipment_schedule FOR INSERT WITH CHECK (cooperative_user_id = auth.uid());
CREATE POLICY "Cooperative can update schedule" ON public.cooperative_equipment_schedule FOR UPDATE USING (cooperative_user_id = auth.uid());
CREATE POLICY "Cooperative can delete schedule" ON public.cooperative_equipment_schedule FOR DELETE USING (cooperative_user_id = auth.uid());

-- Storage for cooperative documents
INSERT INTO storage.buckets (id, name, public) VALUES ('cooperative-docs', 'cooperative-docs', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Cooperative can upload docs" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'cooperative-docs');
CREATE POLICY "Cooperative can view own docs" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'cooperative-docs');
CREATE POLICY "Cooperative can delete own docs" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'cooperative-docs');

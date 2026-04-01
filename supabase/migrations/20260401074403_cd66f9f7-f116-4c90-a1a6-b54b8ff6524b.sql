
-- Table for geolocated field observations (markers on parcels)
CREATE TABLE public.field_observations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  parcel_name TEXT,
  observation_type TEXT NOT NULL DEFAULT 'autre',
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  photo_urls TEXT[] DEFAULT '{}'::TEXT[],
  severity TEXT DEFAULT 'moyen',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.field_observations ENABLE ROW LEVEL SECURITY;

-- Expert can manage their own observations
CREATE POLICY "Users can view own observations" ON public.field_observations
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can create observations" ON public.field_observations
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own observations" ON public.field_observations
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can delete own observations" ON public.field_observations
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Table for expert GPS parcels (drawn polygons)
CREATE TABLE public.expert_parcels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  geometry JSONB,
  area_ha NUMERIC DEFAULT 0,
  perimeter_m NUMERIC DEFAULT 0,
  center_lat NUMERIC,
  center_lng NUMERIC,
  notes TEXT,
  client_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.expert_parcels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own expert parcels" ON public.expert_parcels
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can create expert parcels" ON public.expert_parcels
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own expert parcels" ON public.expert_parcels
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can delete own expert parcels" ON public.expert_parcels
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Storage bucket for observation photos
INSERT INTO storage.buckets (id, name, public) VALUES ('field-observations', 'field-observations', true);

CREATE POLICY "Users can upload observation photos" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'field-observations' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view observation photos" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'field-observations');

CREATE POLICY "Users can delete own observation photos" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'field-observations' AND (storage.foldername(name))[1] = auth.uid()::text);

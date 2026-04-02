
CREATE TABLE public.scouting_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  parcel_name TEXT,
  client_name TEXT,
  visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  crop_type TEXT,
  growth_stage TEXT,
  general_condition TEXT DEFAULT 'moyen',
  problems_identified JSONB DEFAULT '[]'::jsonb,
  recommendations TEXT,
  proposed_treatment TEXT,
  notes TEXT,
  photo_urls TEXT[] DEFAULT '{}'::text[],
  latitude NUMERIC,
  longitude NUMERIC,
  report_shared_to TEXT[] DEFAULT '{}'::text[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.scouting_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scouting sessions"
ON public.scouting_sessions FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create scouting sessions"
ON public.scouting_sessions FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own scouting sessions"
ON public.scouting_sessions FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can delete own scouting sessions"
ON public.scouting_sessions FOR DELETE
TO authenticated
USING (user_id = auth.uid());

CREATE TRIGGER update_scouting_sessions_updated_at
BEFORE UPDATE ON public.scouting_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE public.partner_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('fournisseur','assurance','programme','banque')),
  name text NOT NULL,
  contact_name text,
  phone text,
  email text,
  location text,
  website text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.partner_entries TO authenticated;
GRANT ALL ON public.partner_entries TO service_role;

ALTER TABLE public.partner_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own partner entries"
  ON public.partner_entries FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER partner_entries_set_updated_at
  BEFORE UPDATE ON public.partner_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE INDEX idx_partner_entries_user_category ON public.partner_entries(user_id, category);
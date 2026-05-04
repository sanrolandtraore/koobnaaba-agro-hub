
-- 1) Prevent privilege escalation on cooperative_members.cooperative_role
CREATE OR REPLACE FUNCTION public.protect_cooperative_member_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _admin_roles text[] := ARRAY['president','vice_president','tresorier','secretaire'];
BEGIN
  -- service_role bypass
  IF current_setting('request.jwt.claims', true)::json->>'role' = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- Owner of the cooperative can do anything
  IF NEW.cooperative_user_id = auth.uid() THEN
    RETURN NEW;
  END IF;

  -- For non-owners: block assignment of admin roles
  IF TG_OP = 'INSERT' THEN
    IF NEW.cooperative_role = ANY(_admin_roles) THEN
      RAISE EXCEPTION 'Seul le propriétaire de la coopérative peut désigner un rôle administratif';
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Block changes to cooperative_role unless caller is owner
    IF OLD.cooperative_role IS DISTINCT FROM NEW.cooperative_role THEN
      RAISE EXCEPTION 'Seul le propriétaire de la coopérative peut modifier le rôle d''un membre';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_cooperative_member_role_trg ON public.cooperative_members;
CREATE TRIGGER protect_cooperative_member_role_trg
BEFORE INSERT OR UPDATE ON public.cooperative_members
FOR EACH ROW EXECUTE FUNCTION public.protect_cooperative_member_role();

-- 2) Restrict partner access to service_requests via explicit assignment
ALTER TABLE public.service_requests
  ADD COLUMN IF NOT EXISTS assigned_partner_id uuid;

CREATE INDEX IF NOT EXISTS idx_service_requests_assigned_partner
  ON public.service_requests(assigned_partner_id);

DROP POLICY IF EXISTS "Partners can view all service requests" ON public.service_requests;
DROP POLICY IF EXISTS "Partners can update service requests" ON public.service_requests;

CREATE POLICY "Partners can view assigned service requests"
ON public.service_requests
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'partenaire'::app_role)
  AND assigned_partner_id = auth.uid()
);

CREATE POLICY "Partners can update assigned service requests"
ON public.service_requests
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'partenaire'::app_role)
  AND assigned_partner_id = auth.uid()
);

-- Allow request owner to assign/unassign a partner (already covered by "Users can update own service requests")

-- 3) Add UPDATE policy on cooperative-docs storage bucket
CREATE POLICY "Cooperative can update own docs"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'cooperative-docs'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'cooperative-docs'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

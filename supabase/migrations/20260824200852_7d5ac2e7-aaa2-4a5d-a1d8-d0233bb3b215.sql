-- 1. Revoke anon EXECUTE on SECURITY DEFINER role helper (no anon policy uses it)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;

-- 2. Restrict linked_user_id assignment + prevent cooperative transfer on members
CREATE OR REPLACE FUNCTION public.protect_cooperative_member_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _admin_roles text[] := ARRAY['president','vice_president','tresorier','secretaire'];
BEGIN
  IF current_setting('request.jwt.claims', true)::json->>'role' = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- Owner of the cooperative can do anything
  IF NEW.cooperative_user_id = auth.uid() THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.cooperative_role = ANY(_admin_roles) THEN
      RAISE EXCEPTION 'Seul le propriétaire de la coopérative peut désigner un rôle administratif';
    END IF;
    -- Only the invite flow (self-join) may link an auth account
    IF NEW.linked_user_id IS NOT NULL AND NEW.linked_user_id <> auth.uid() THEN
      RAISE EXCEPTION 'Seul le propriétaire de la coopérative peut rattacher un compte utilisateur à un membre';
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.cooperative_role IS DISTINCT FROM NEW.cooperative_role THEN
      RAISE EXCEPTION 'Seul le propriétaire de la coopérative peut modifier le rôle d''un membre';
    END IF;
    IF OLD.linked_user_id IS DISTINCT FROM NEW.linked_user_id THEN
      RAISE EXCEPTION 'Seul le propriétaire de la coopérative peut modifier le compte lié d''un membre';
    END IF;
    IF OLD.cooperative_user_id IS DISTINCT FROM NEW.cooperative_user_id THEN
      RAISE EXCEPTION 'Un membre ne peut pas être transféré vers une autre coopérative';
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

DROP POLICY IF EXISTS "Cooperative can update own members" ON public.cooperative_members;
CREATE POLICY "Cooperative can update own members"
ON public.cooperative_members
FOR UPDATE
TO authenticated
USING (
  cooperative_user_id = auth.uid()
  OR (cooperative_user_id = public.get_cooperative_owner_for_member(auth.uid()) AND public.is_cooperative_admin(auth.uid()))
)
WITH CHECK (
  cooperative_user_id = auth.uid()
  OR (cooperative_user_id = public.get_cooperative_owner_for_member(auth.uid()) AND public.is_cooperative_admin(auth.uid()))
);

-- 3. Workers: prevent moving a worker to a farm you do not own
DROP POLICY IF EXISTS "Users can update own workers" ON public.workers;
CREATE POLICY "Users can update own workers"
ON public.workers
FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.farms f WHERE f.id = workers.farm_id AND f.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.farms f WHERE f.id = workers.farm_id AND f.user_id = auth.uid()));

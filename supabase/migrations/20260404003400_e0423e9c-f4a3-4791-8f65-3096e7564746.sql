
-- 1. Fix partner_directory SELECT policy: only show verified partners or own entries
DROP POLICY IF EXISTS "Authenticated can view partners" ON public.partner_directory;
CREATE POLICY "Authenticated can view verified or own partners"
ON public.partner_directory FOR SELECT TO authenticated
USING (is_verified = true OR created_by = auth.uid());

-- 2. Remove duplicate INSERT/UPDATE/DELETE policies on partner_directory
DROP POLICY IF EXISTS "Users can create partners" ON public.partner_directory;
DROP POLICY IF EXISTS "Users can update own partners" ON public.partner_directory;
DROP POLICY IF EXISTS "Users can delete own partners" ON public.partner_directory;

-- 3. Fix marketplace_orders UPDATE policies with WITH CHECK
-- Drop existing UPDATE policies
DROP POLICY IF EXISTS "Clients can update own orders" ON public.marketplace_orders;
DROP POLICY IF EXISTS "Providers can update orders" ON public.marketplace_orders;
DROP POLICY IF EXISTS "Users can update own orders" ON public.marketplace_orders;

-- Clients can only update client_notes and release escrow (only when status = 'termine')
CREATE POLICY "Clients can update own orders"
ON public.marketplace_orders FOR UPDATE TO authenticated
USING (auth.uid() = client_id)
WITH CHECK (auth.uid() = client_id);

-- Providers can update their orders (proof fields, status)
CREATE POLICY "Providers can update orders"
ON public.marketplace_orders FOR UPDATE TO authenticated
USING (auth.uid() = provider_id)
WITH CHECK (auth.uid() = provider_id);

-- 4. Create a function to enforce escrow transition rules
CREATE OR REPLACE FUNCTION public.validate_escrow_transition()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If escrow_status is being changed
  IF OLD.escrow_status IS DISTINCT FROM NEW.escrow_status THEN
    -- Only clients can release escrow, and only when order is completed
    IF NEW.escrow_status = 'libere' THEN
      IF auth.uid() != OLD.client_id THEN
        RAISE EXCEPTION 'Seul le client peut libérer le paiement';
      END IF;
      IF OLD.status != 'termine' THEN
        RAISE EXCEPTION 'Le paiement ne peut être libéré que pour une commande terminée';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_escrow_transition_trigger
BEFORE UPDATE ON public.marketplace_orders
FOR EACH ROW
EXECUTE FUNCTION public.validate_escrow_transition();

-- 5. Fix field-observations storage bucket: make private
UPDATE storage.buckets SET public = false WHERE id = 'field-observations';

-- Drop existing SELECT policy and create owner-scoped one
DROP POLICY IF EXISTS "Give users access to own folder o4xl1r_0" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view field observations" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can view field observations" ON storage.objects;

-- Try to drop any existing SELECT policy on field-observations bucket
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE tablename = 'objects' AND schemaname = 'storage'
    AND policyname ILIKE '%field%observation%'
    AND cmd = 'r'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Users can view own observation photos"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'field-observations'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

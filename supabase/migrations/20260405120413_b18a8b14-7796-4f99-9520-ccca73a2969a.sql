
-- 1. FIX: Equipment bookings - prevent direct financial field manipulation
-- Add a trigger that blocks changes to financial fields unless done by service_role
CREATE OR REPLACE FUNCTION public.protect_booking_financial_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Allow service_role to change anything
  IF current_setting('request.jwt.claims', true)::json->>'role' = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- Block changes to financial fields by regular users
  IF OLD.payment_status IS DISTINCT FROM NEW.payment_status
     OR OLD.deposit_paid IS DISTINCT FROM NEW.deposit_paid
     OR OLD.total_price IS DISTINCT FROM NEW.total_price
     OR OLD.deposit_amount IS DISTINCT FROM NEW.deposit_amount
     OR OLD.stripe_payment_id IS DISTINCT FROM NEW.stripe_payment_id THEN
    RAISE EXCEPTION 'Les champs financiers ne peuvent pas être modifiés directement';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER protect_booking_financials
BEFORE UPDATE ON public.equipment_bookings
FOR EACH ROW
EXECUTE FUNCTION public.protect_booking_financial_fields();

-- 2. FIX: Cooperative profiles - restrict invite_code visibility to owners/admins only
-- Drop existing SELECT policy
DROP POLICY IF EXISTS "Cooperative can view own profile" ON public.cooperative_profiles;

-- Create owner/admin SELECT policy (full access)
CREATE POLICY "Cooperative admins can view full profile"
ON public.cooperative_profiles
FOR SELECT
TO authenticated
USING (
  cooperative_user_id = auth.uid()
  OR (
    cooperative_user_id = get_cooperative_owner_for_member(auth.uid())
    AND is_cooperative_admin(auth.uid())
  )
);

-- Create member SELECT policy (restricted columns via a security barrier view)
-- Since RLS can't restrict columns, we create a view for members
-- But simpler: just restrict SELECT to admins/owners only for this table
-- Regular members don't need direct access to cooperative_profiles with invite_code
-- The app can fetch cooperative name via the members table join

-- 3. FIX: Field observation photos - remove broad storage SELECT policy
DROP POLICY IF EXISTS "Users can view observation photos" ON storage.objects;

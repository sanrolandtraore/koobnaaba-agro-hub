-- 1) Reviews must be tied to a real completed booking of the reviewer
DROP POLICY IF EXISTS "Reviewers can create reviews" ON public.equipment_reviews;
CREATE POLICY "Reviewers can create reviews"
ON public.equipment_reviews
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = reviewer_id
  AND EXISTS (
    SELECT 1 FROM public.equipment_bookings b
    WHERE b.id = equipment_reviews.booking_id
      AND b.renter_id = auth.uid()
      AND b.listing_id = equipment_reviews.listing_id
      AND b.status = 'terminee'::booking_status
  )
);

-- 2) Server-side pricing on INSERT
CREATE OR REPLACE FUNCTION public.set_order_amount_from_service()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE _price numeric; _provider uuid;
BEGIN
  IF current_setting('request.jwt.claims', true)::json->>'role' = 'service_role' THEN
    RETURN NEW;
  END IF;
  SELECT price, provider_id INTO _price, _provider
  FROM public.marketplace_services WHERE id = NEW.service_id;
  IF _price IS NULL THEN
    RAISE EXCEPTION 'Service introuvable';
  END IF;
  NEW.amount := _price;
  NEW.provider_id := _provider;
  NEW.escrow_status := COALESCE(NEW.escrow_status, 'en_attente');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_order_amount ON public.marketplace_orders;
CREATE TRIGGER trg_set_order_amount
BEFORE INSERT ON public.marketplace_orders
FOR EACH ROW EXECUTE FUNCTION public.set_order_amount_from_service();

CREATE OR REPLACE FUNCTION public.set_booking_price_from_listing()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE _rate numeric; _dep numeric; _days int;
BEGIN
  IF current_setting('request.jwt.claims', true)::json->>'role' = 'service_role' THEN
    RETURN NEW;
  END IF;
  SELECT daily_rate, COALESCE(deposit_amount, 0) INTO _rate, _dep
  FROM public.equipment_listings WHERE id = NEW.listing_id;
  IF _rate IS NULL THEN
    RAISE EXCEPTION 'Annonce introuvable';
  END IF;
  IF NEW.end_date < NEW.start_date THEN
    RAISE EXCEPTION 'Dates de réservation invalides';
  END IF;
  _days := (NEW.end_date - NEW.start_date) + 1;
  NEW.total_price := _rate * _days;
  NEW.deposit_amount := _dep;
  NEW.deposit_paid := false;
  NEW.payment_status := COALESCE(NEW.payment_status, 'en_attente');
  NEW.stripe_payment_id := NULL;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_booking_price ON public.equipment_bookings;
CREATE TRIGGER trg_set_booking_price
BEFORE INSERT ON public.equipment_bookings
FOR EACH ROW EXECUTE FUNCTION public.set_booking_price_from_listing();

-- 3) OTP codes for password reset (server-side only)
CREATE TABLE IF NOT EXISTS public.password_reset_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  user_id uuid,
  code_hash text NOT NULL,
  attempts int NOT NULL DEFAULT 0,
  consumed_at timestamptz,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_password_reset_codes_phone ON public.password_reset_codes(phone);

GRANT ALL ON public.password_reset_codes TO service_role;
ALTER TABLE public.password_reset_codes ENABLE ROW LEVEL SECURITY;
-- no policies: only service_role (edge functions) may access
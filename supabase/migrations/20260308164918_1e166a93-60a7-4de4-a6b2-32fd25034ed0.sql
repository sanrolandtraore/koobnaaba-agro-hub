
-- Partner directory categories enum
CREATE TYPE public.partner_category AS ENUM ('credit_agricole', 'assurance_agricole', 'fournisseur_intrants', 'ministere_agriculture', 'autre');

-- Partner directory table
CREATE TABLE public.partner_directory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category partner_category NOT NULL,
  description TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  website TEXT,
  address TEXT,
  logo_url TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.partner_directory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view partners" ON public.partner_directory FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create partners" ON public.partner_directory FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update own partners" ON public.partner_directory FOR UPDATE TO authenticated USING (auth.uid() = created_by);
CREATE POLICY "Users can delete own partners" ON public.partner_directory FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- Equipment listings for rental marketplace
CREATE TABLE public.equipment_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  equipment_type TEXT NOT NULL DEFAULT 'tracteur',
  brand TEXT,
  model TEXT,
  year INTEGER,
  daily_rate NUMERIC NOT NULL DEFAULT 0,
  deposit_amount NUMERIC NOT NULL DEFAULT 0,
  location_name TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  images TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'disponible',
  availability_start DATE,
  availability_end DATE,
  avg_rating NUMERIC DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.equipment_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can browse listings" ON public.equipment_listings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create listings" ON public.equipment_listings FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own listings" ON public.equipment_listings FOR UPDATE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete own listings" ON public.equipment_listings FOR DELETE TO authenticated USING (auth.uid() = owner_id);

-- Booking / reservation table
CREATE TYPE public.booking_status AS ENUM ('en_attente', 'confirmee', 'en_cours', 'terminee', 'annulee');

CREATE TABLE public.equipment_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.equipment_listings(id) ON DELETE CASCADE,
  renter_id UUID NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_price NUMERIC NOT NULL DEFAULT 0,
  deposit_amount NUMERIC NOT NULL DEFAULT 0,
  deposit_paid BOOLEAN NOT NULL DEFAULT false,
  payment_status TEXT NOT NULL DEFAULT 'en_attente',
  stripe_payment_id TEXT,
  status booking_status NOT NULL DEFAULT 'en_attente',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.equipment_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Renters can view own bookings" ON public.equipment_bookings FOR SELECT TO authenticated USING (auth.uid() = renter_id);
CREATE POLICY "Owners can view bookings on their listings" ON public.equipment_bookings FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.equipment_listings WHERE id = equipment_bookings.listing_id AND owner_id = auth.uid())
);
CREATE POLICY "Users can create bookings" ON public.equipment_bookings FOR INSERT TO authenticated WITH CHECK (auth.uid() = renter_id);
CREATE POLICY "Renters can update own bookings" ON public.equipment_bookings FOR UPDATE TO authenticated USING (auth.uid() = renter_id);
CREATE POLICY "Owners can update bookings on their listings" ON public.equipment_bookings FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.equipment_listings WHERE id = equipment_bookings.listing_id AND owner_id = auth.uid())
);

-- Reviews
CREATE TABLE public.equipment_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.equipment_bookings(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.equipment_listings(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.equipment_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view reviews" ON public.equipment_reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "Reviewers can create reviews" ON public.equipment_reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY "Reviewers can update own reviews" ON public.equipment_reviews FOR UPDATE TO authenticated USING (auth.uid() = reviewer_id);
CREATE POLICY "Reviewers can delete own reviews" ON public.equipment_reviews FOR DELETE TO authenticated USING (auth.uid() = reviewer_id);

-- Function to update avg_rating on listing after review
CREATE OR REPLACE FUNCTION public.update_listing_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.equipment_listings
  SET avg_rating = (SELECT COALESCE(AVG(rating), 0) FROM public.equipment_reviews WHERE listing_id = COALESCE(NEW.listing_id, OLD.listing_id)),
      review_count = (SELECT COUNT(*) FROM public.equipment_reviews WHERE listing_id = COALESCE(NEW.listing_id, OLD.listing_id))
  WHERE id = COALESCE(NEW.listing_id, OLD.listing_id);
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER update_listing_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.equipment_reviews
FOR EACH ROW EXECUTE FUNCTION public.update_listing_rating();

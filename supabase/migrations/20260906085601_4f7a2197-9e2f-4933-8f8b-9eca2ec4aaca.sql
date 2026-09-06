DROP TRIGGER IF EXISTS trg_enforce_parcel_limit ON public.parcels;
DROP TRIGGER IF EXISTS trg_enforce_animal_limit ON public.animals;
DROP FUNCTION IF EXISTS public.enforce_parcel_limit() CASCADE;
DROP FUNCTION IF EXISTS public.enforce_animal_limit() CASCADE;
DROP FUNCTION IF EXISTS public.enforce_member_limit() CASCADE;
-- Sprint 1.3: geolocation for marketplace agricultural services
ALTER TABLE public.marketplace_services
  ADD COLUMN IF NOT EXISTS latitude double precision,
  ADD COLUMN IF NOT EXISTS longitude double precision;

ALTER TABLE public.marketplace_services
  ADD CONSTRAINT marketplace_services_latitude_check
  CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90);

ALTER TABLE public.marketplace_services
  ADD CONSTRAINT marketplace_services_longitude_check
  CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180);

CREATE INDEX IF NOT EXISTS idx_marketplace_services_geo
  ON public.marketplace_services (latitude, longitude)
  WHERE is_active = true AND latitude IS NOT NULL AND longitude IS NOT NULL;

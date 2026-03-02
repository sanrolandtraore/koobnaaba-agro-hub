
-- Enable PostGIS for real geometry storage
CREATE EXTENSION IF NOT EXISTS postgis SCHEMA extensions;

-- Add geometry column to parcels for GPS polygon
ALTER TABLE public.parcels
ADD COLUMN IF NOT EXISTS geometry jsonb DEFAULT NULL,
ADD COLUMN IF NOT EXISTS calculated_area_ha numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS perimeter_m numeric DEFAULT NULL;

-- Add plant_count to crop_cycles
ALTER TABLE public.crop_cycles
ADD COLUMN IF NOT EXISTS plant_count integer DEFAULT NULL,
ADD COLUMN IF NOT EXISTS climate_coefficient numeric DEFAULT 1.0;

-- Table: calculated input requirements per crop cycle
CREATE TABLE public.crop_cycle_inputs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  crop_cycle_id uuid NOT NULL REFERENCES public.crop_cycles(id) ON DELETE CASCADE,
  input_name text NOT NULL,
  quantity_per_ha numeric NOT NULL DEFAULT 0,
  total_quantity numeric NOT NULL DEFAULT 0,
  unit text NOT NULL DEFAULT 'kg',
  unit_price numeric DEFAULT 0,
  total_cost numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.crop_cycle_inputs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cycle inputs"
ON public.crop_cycle_inputs FOR SELECT
USING (get_farm_owner_from_cycle(crop_cycle_id) = auth.uid());

CREATE POLICY "Users can create cycle inputs"
ON public.crop_cycle_inputs FOR INSERT
WITH CHECK (get_farm_owner_from_cycle(crop_cycle_id) = auth.uid());

CREATE POLICY "Users can update own cycle inputs"
ON public.crop_cycle_inputs FOR UPDATE
USING (get_farm_owner_from_cycle(crop_cycle_id) = auth.uid());

CREATE POLICY "Users can delete own cycle inputs"
ON public.crop_cycle_inputs FOR DELETE
USING (get_farm_owner_from_cycle(crop_cycle_id) = auth.uid());

-- Table: investment plans per crop cycle
CREATE TABLE public.investment_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  crop_cycle_id uuid NOT NULL REFERENCES public.crop_cycles(id) ON DELETE CASCADE,
  total_input_cost numeric NOT NULL DEFAULT 0,
  total_labor_cost numeric NOT NULL DEFAULT 0,
  total_equipment_cost numeric NOT NULL DEFAULT 0,
  total_transport_cost numeric NOT NULL DEFAULT 0,
  total_investment numeric NOT NULL DEFAULT 0,
  expected_revenue numeric NOT NULL DEFAULT 0,
  expected_roi_percent numeric DEFAULT 0,
  break_even_yield_kg numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(crop_cycle_id)
);

ALTER TABLE public.investment_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own investment plans"
ON public.investment_plans FOR SELECT
USING (get_farm_owner_from_cycle(crop_cycle_id) = auth.uid());

CREATE POLICY "Users can create investment plans"
ON public.investment_plans FOR INSERT
WITH CHECK (get_farm_owner_from_cycle(crop_cycle_id) = auth.uid());

CREATE POLICY "Users can update own investment plans"
ON public.investment_plans FOR UPDATE
USING (get_farm_owner_from_cycle(crop_cycle_id) = auth.uid());

CREATE POLICY "Users can delete own investment plans"
ON public.investment_plans FOR DELETE
USING (get_farm_owner_from_cycle(crop_cycle_id) = auth.uid());

-- Trigger for updated_at on investment_plans
CREATE TRIGGER update_investment_plans_updated_at
BEFORE UPDATE ON public.investment_plans
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


-- Workers table
CREATE TABLE public.workers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'ouvrier',
  phone TEXT,
  daily_rate NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own workers" ON public.workers FOR SELECT
  USING (EXISTS (SELECT 1 FROM farms WHERE farms.id = workers.farm_id AND farms.user_id = auth.uid()));
CREATE POLICY "Users can create workers" ON public.workers FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM farms WHERE farms.id = workers.farm_id AND farms.user_id = auth.uid()));
CREATE POLICY "Users can update own workers" ON public.workers FOR UPDATE
  USING (EXISTS (SELECT 1 FROM farms WHERE farms.id = workers.farm_id AND farms.user_id = auth.uid()));
CREATE POLICY "Users can delete own workers" ON public.workers FOR DELETE
  USING (EXISTS (SELECT 1 FROM farms WHERE farms.id = workers.farm_id AND farms.user_id = auth.uid()));

-- Equipment table
CREATE TABLE public.equipment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'outil',
  status TEXT NOT NULL DEFAULT 'disponible',
  purchase_date DATE,
  purchase_cost NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own equipment" ON public.equipment FOR SELECT
  USING (EXISTS (SELECT 1 FROM farms WHERE farms.id = equipment.farm_id AND farms.user_id = auth.uid()));
CREATE POLICY "Users can create equipment" ON public.equipment FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM farms WHERE farms.id = equipment.farm_id AND farms.user_id = auth.uid()));
CREATE POLICY "Users can update own equipment" ON public.equipment FOR UPDATE
  USING (EXISTS (SELECT 1 FROM farms WHERE farms.id = equipment.farm_id AND farms.user_id = auth.uid()));
CREATE POLICY "Users can delete own equipment" ON public.equipment FOR DELETE
  USING (EXISTS (SELECT 1 FROM farms WHERE farms.id = equipment.farm_id AND farms.user_id = auth.uid()));

-- Harvests / lots for traceability
CREATE TABLE public.harvests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  crop_cycle_id UUID NOT NULL REFERENCES public.crop_cycles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  quantity_kg NUMERIC NOT NULL DEFAULT 0,
  quality_grade TEXT DEFAULT 'A',
  lot_number TEXT NOT NULL,
  unit_price_kg NUMERIC,
  buyer TEXT,
  sold BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.harvests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own harvests" ON public.harvests FOR SELECT
  USING (get_farm_owner_from_cycle(crop_cycle_id) = auth.uid());
CREATE POLICY "Users can create harvests" ON public.harvests FOR INSERT
  WITH CHECK (get_farm_owner_from_cycle(crop_cycle_id) = auth.uid());
CREATE POLICY "Users can update own harvests" ON public.harvests FOR UPDATE
  USING (get_farm_owner_from_cycle(crop_cycle_id) = auth.uid());
CREATE POLICY "Users can delete own harvests" ON public.harvests FOR DELETE
  USING (get_farm_owner_from_cycle(crop_cycle_id) = auth.uid());

-- Crop calendar events for planning
CREATE TABLE public.crop_calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  crop_cycle_id UUID NOT NULL REFERENCES public.crop_cycles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'tache',
  planned_date DATE NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.crop_calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own calendar events" ON public.crop_calendar_events FOR SELECT
  USING (get_farm_owner_from_cycle(crop_cycle_id) = auth.uid());
CREATE POLICY "Users can create calendar events" ON public.crop_calendar_events FOR INSERT
  WITH CHECK (get_farm_owner_from_cycle(crop_cycle_id) = auth.uid());
CREATE POLICY "Users can update own calendar events" ON public.crop_calendar_events FOR UPDATE
  USING (get_farm_owner_from_cycle(crop_cycle_id) = auth.uid());
CREATE POLICY "Users can delete own calendar events" ON public.crop_calendar_events FOR DELETE
  USING (get_farm_owner_from_cycle(crop_cycle_id) = auth.uid());


-- Enum for animal species
CREATE TYPE public.animal_species AS ENUM ('bovin', 'caprin', 'porcin', 'volaille', 'pisciculture');

-- Enum for animal sex
CREATE TYPE public.animal_sex AS ENUM ('male', 'femelle', 'inconnu');

-- Core animals table
CREATE TABLE public.animals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  species animal_species NOT NULL,
  name TEXT,
  identification_number TEXT,
  breed TEXT,
  sex animal_sex NOT NULL DEFAULT 'inconnu',
  birth_date DATE,
  acquisition_date DATE DEFAULT CURRENT_DATE,
  acquisition_cost NUMERIC DEFAULT 0,
  weight_kg NUMERIC,
  status TEXT NOT NULL DEFAULT 'actif',
  mother_id UUID REFERENCES public.animals(id),
  father_id UUID REFERENCES public.animals(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.animals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own animals" ON public.animals FOR SELECT
  USING (EXISTS (SELECT 1 FROM farms WHERE farms.id = animals.farm_id AND farms.user_id = auth.uid()));
CREATE POLICY "Users can create animals" ON public.animals FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM farms WHERE farms.id = animals.farm_id AND farms.user_id = auth.uid()));
CREATE POLICY "Users can update own animals" ON public.animals FOR UPDATE
  USING (EXISTS (SELECT 1 FROM farms WHERE farms.id = animals.farm_id AND farms.user_id = auth.uid()));
CREATE POLICY "Users can delete own animals" ON public.animals FOR DELETE
  USING (EXISTS (SELECT 1 FROM farms WHERE farms.id = animals.farm_id AND farms.user_id = auth.uid()));

-- Health events table
CREATE TABLE public.animal_health_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  animal_id UUID NOT NULL REFERENCES public.animals(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL DEFAULT 'traitement',
  event_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT,
  medication TEXT,
  dosage TEXT,
  cost NUMERIC DEFAULT 0,
  vet_name TEXT,
  next_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.animal_health_events ENABLE ROW LEVEL SECURITY;

-- Helper function for animal ownership
CREATE OR REPLACE FUNCTION public.get_farm_owner_from_animal(_animal_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT f.user_id FROM public.farms f
  JOIN public.animals a ON a.farm_id = f.id
  WHERE a.id = _animal_id
$$;

CREATE POLICY "Users can view own health events" ON public.animal_health_events FOR SELECT
  USING (get_farm_owner_from_animal(animal_id) = auth.uid());
CREATE POLICY "Users can create health events" ON public.animal_health_events FOR INSERT
  WITH CHECK (get_farm_owner_from_animal(animal_id) = auth.uid());
CREATE POLICY "Users can update own health events" ON public.animal_health_events FOR UPDATE
  USING (get_farm_owner_from_animal(animal_id) = auth.uid());
CREATE POLICY "Users can delete own health events" ON public.animal_health_events FOR DELETE
  USING (get_farm_owner_from_animal(animal_id) = auth.uid());

-- Reproduction events table
CREATE TABLE public.animal_reproductions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  animal_id UUID NOT NULL REFERENCES public.animals(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL DEFAULT 'saillie',
  event_date DATE NOT NULL DEFAULT CURRENT_DATE,
  partner_id UUID REFERENCES public.animals(id),
  expected_birth_date DATE,
  actual_birth_date DATE,
  offspring_count INTEGER DEFAULT 0,
  offspring_alive INTEGER DEFAULT 0,
  notes TEXT,
  cost NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.animal_reproductions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reproductions" ON public.animal_reproductions FOR SELECT
  USING (get_farm_owner_from_animal(animal_id) = auth.uid());
CREATE POLICY "Users can create reproductions" ON public.animal_reproductions FOR INSERT
  WITH CHECK (get_farm_owner_from_animal(animal_id) = auth.uid());
CREATE POLICY "Users can update own reproductions" ON public.animal_reproductions FOR UPDATE
  USING (get_farm_owner_from_animal(animal_id) = auth.uid());
CREATE POLICY "Users can delete own reproductions" ON public.animal_reproductions FOR DELETE
  USING (get_farm_owner_from_animal(animal_id) = auth.uid());

-- Feeding records table
CREATE TABLE public.animal_feedings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  animal_id UUID REFERENCES public.animals(id) ON DELETE CASCADE,
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  feed_type TEXT NOT NULL,
  quantity_kg NUMERIC NOT NULL DEFAULT 0,
  cost NUMERIC DEFAULT 0,
  feeding_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.animal_feedings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own feedings" ON public.animal_feedings FOR SELECT
  USING (EXISTS (SELECT 1 FROM farms WHERE farms.id = animal_feedings.farm_id AND farms.user_id = auth.uid()));
CREATE POLICY "Users can create feedings" ON public.animal_feedings FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM farms WHERE farms.id = animal_feedings.farm_id AND farms.user_id = auth.uid()));
CREATE POLICY "Users can update own feedings" ON public.animal_feedings FOR UPDATE
  USING (EXISTS (SELECT 1 FROM farms WHERE farms.id = animal_feedings.farm_id AND farms.user_id = auth.uid()));
CREATE POLICY "Users can delete own feedings" ON public.animal_feedings FOR DELETE
  USING (EXISTS (SELECT 1 FROM farms WHERE farms.id = animal_feedings.farm_id AND farms.user_id = auth.uid()));

-- Feed stock inventory
CREATE TABLE public.feed_stocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  feed_name TEXT NOT NULL,
  quantity_kg NUMERIC NOT NULL DEFAULT 0,
  unit_price NUMERIC DEFAULT 0,
  supplier TEXT,
  last_purchase_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.feed_stocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own feed stocks" ON public.feed_stocks FOR SELECT
  USING (EXISTS (SELECT 1 FROM farms WHERE farms.id = feed_stocks.farm_id AND farms.user_id = auth.uid()));
CREATE POLICY "Users can create feed stocks" ON public.feed_stocks FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM farms WHERE farms.id = feed_stocks.farm_id AND farms.user_id = auth.uid()));
CREATE POLICY "Users can update own feed stocks" ON public.feed_stocks FOR UPDATE
  USING (EXISTS (SELECT 1 FROM farms WHERE farms.id = feed_stocks.farm_id AND farms.user_id = auth.uid()));
CREATE POLICY "Users can delete own feed stocks" ON public.feed_stocks FOR DELETE
  USING (EXISTS (SELECT 1 FROM farms WHERE farms.id = feed_stocks.farm_id AND farms.user_id = auth.uid()));

-- Livestock expenses
CREATE TABLE public.livestock_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  animal_id UUID REFERENCES public.animals(id) ON DELETE SET NULL,
  category TEXT NOT NULL DEFAULT 'alimentation',
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.livestock_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own livestock expenses" ON public.livestock_expenses FOR SELECT
  USING (EXISTS (SELECT 1 FROM farms WHERE farms.id = livestock_expenses.farm_id AND farms.user_id = auth.uid()));
CREATE POLICY "Users can create livestock expenses" ON public.livestock_expenses FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM farms WHERE farms.id = livestock_expenses.farm_id AND farms.user_id = auth.uid()));
CREATE POLICY "Users can update own livestock expenses" ON public.livestock_expenses FOR UPDATE
  USING (EXISTS (SELECT 1 FROM farms WHERE farms.id = livestock_expenses.farm_id AND farms.user_id = auth.uid()));
CREATE POLICY "Users can delete own livestock expenses" ON public.livestock_expenses FOR DELETE
  USING (EXISTS (SELECT 1 FROM farms WHERE farms.id = livestock_expenses.farm_id AND farms.user_id = auth.uid()));

-- Livestock sales/revenue
CREATE TABLE public.livestock_sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  animal_id UUID REFERENCES public.animals(id) ON DELETE SET NULL,
  sale_type TEXT NOT NULL DEFAULT 'animal',
  description TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  buyer TEXT,
  sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.livestock_sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own livestock sales" ON public.livestock_sales FOR SELECT
  USING (EXISTS (SELECT 1 FROM farms WHERE farms.id = livestock_sales.farm_id AND farms.user_id = auth.uid()));
CREATE POLICY "Users can create livestock sales" ON public.livestock_sales FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM farms WHERE farms.id = livestock_sales.farm_id AND farms.user_id = auth.uid()));
CREATE POLICY "Users can update own livestock sales" ON public.livestock_sales FOR UPDATE
  USING (EXISTS (SELECT 1 FROM farms WHERE farms.id = livestock_sales.farm_id AND farms.user_id = auth.uid()));
CREATE POLICY "Users can delete own livestock sales" ON public.livestock_sales FOR DELETE
  USING (EXISTS (SELECT 1 FROM farms WHERE farms.id = livestock_sales.farm_id AND farms.user_id = auth.uid()));

-- Triggers for updated_at
CREATE TRIGGER update_animals_updated_at BEFORE UPDATE ON public.animals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_feed_stocks_updated_at BEFORE UPDATE ON public.feed_stocks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

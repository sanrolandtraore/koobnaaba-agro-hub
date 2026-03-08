
-- Table des demandes de services techniques
CREATE TABLE public.service_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  service_type TEXT NOT NULL,
  description TEXT,
  location TEXT,
  farm_id UUID REFERENCES public.farms(id) ON DELETE SET NULL,
  preferred_date DATE,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'en_attente',
  expert_notes TEXT,
  estimated_cost NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

-- Users can create their own requests
CREATE POLICY "Users can create service requests"
  ON public.service_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own requests
CREATE POLICY "Users can view own service requests"
  ON public.service_requests FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Users can update their own requests (e.g. cancel)
CREATE POLICY "Users can update own service requests"
  ON public.service_requests FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Users can delete own requests
CREATE POLICY "Users can delete own service requests"
  ON public.service_requests FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Experts (agent_technique role) can view ALL requests
CREATE POLICY "Experts can view all service requests"
  ON public.service_requests FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'agent_technique'));

-- Experts can update any request (to respond, set status, notes, cost)
CREATE POLICY "Experts can update all service requests"
  ON public.service_requests FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'agent_technique'));

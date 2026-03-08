-- Partners can view all service requests (like agents)
CREATE POLICY "Partners can view all service requests"
ON public.service_requests FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'partenaire'::app_role));

-- Partners can update service requests (to add notes/costs)
CREATE POLICY "Partners can update service requests"
ON public.service_requests FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'partenaire'::app_role));
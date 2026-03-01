
-- Fix permissive audit_log insert policy
DROP POLICY "System can insert audit" ON public.audit_log;
CREATE POLICY "Authenticated users can insert audit" ON public.audit_log FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

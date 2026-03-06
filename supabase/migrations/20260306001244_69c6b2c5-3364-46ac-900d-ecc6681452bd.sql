
-- Add new role values to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'agriculteur';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'eleveur';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'cooperative';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'agent_technique';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'partenaire';

-- Update trigger to read role from user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _role app_role;
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  
  -- Read role from signup metadata, default to 'agriculteur'
  _role := COALESCE(
    (NEW.raw_user_meta_data->>'role')::app_role,
    'agriculteur'
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, _role);
  
  RETURN NEW;
END;
$$;


-- Add optional email column to profiles (non-unique, so same email can be used across accounts)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text DEFAULT NULL;

-- Update handle_new_user to also store phone and email from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _role app_role;
BEGIN
  INSERT INTO public.profiles (user_id, full_name, phone, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', NEW.phone, ''),
    COALESCE(NEW.raw_user_meta_data->>'real_email', '')
  );

  _role := COALESCE(
    (NEW.raw_user_meta_data->>'role')::app_role,
    'agriculteur'
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, _role);

  RETURN NEW;
END;
$$;

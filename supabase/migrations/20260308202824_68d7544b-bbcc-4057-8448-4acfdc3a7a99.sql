
-- Update handle_new_user to handle both phone-based and email-based registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _role app_role;
  _phone text;
  _email text;
BEGIN
  -- Determine phone: from metadata or auth phone field
  _phone := COALESCE(NULLIF(NEW.raw_user_meta_data->>'phone', ''), NEW.phone, '');
  
  -- Determine email: if auth email ends with @koobnaaba.local, use real_email from metadata
  -- Otherwise the auth email IS the real email
  IF NEW.email LIKE '%@koobnaaba.local' THEN
    _email := COALESCE(NEW.raw_user_meta_data->>'real_email', '');
  ELSE
    _email := COALESCE(NEW.email, '');
  END IF;

  INSERT INTO public.profiles (user_id, full_name, phone, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    _phone,
    _email
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

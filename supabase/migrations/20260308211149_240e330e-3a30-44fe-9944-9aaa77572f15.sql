-- Fix handle_new_user: always assign 'agriculteur' role, ignore client-supplied role
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _phone text;
  _email text;
BEGIN
  _phone := COALESCE(NULLIF(NEW.raw_user_meta_data->>'phone', ''), NEW.phone, '');
  
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

  -- Always assign default role. Privileged roles must be assigned by admins.
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'agriculteur');

  RETURN NEW;
END;
$function$;
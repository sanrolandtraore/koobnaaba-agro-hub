-- Allow safe user-facing roles from metadata, block admin/agent_technique
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _phone text;
  _email text;
  _requested_role text;
  _role app_role;
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

  -- Only allow safe self-service roles. Block privileged roles.
  _requested_role := COALESCE(NEW.raw_user_meta_data->>'role', 'agriculteur');
  
  IF _requested_role IN ('agriculteur', 'eleveur', 'cooperative', 'partenaire') THEN
    _role := _requested_role::app_role;
  ELSE
    _role := 'agriculteur';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, _role);

  RETURN NEW;
END;
$function$;
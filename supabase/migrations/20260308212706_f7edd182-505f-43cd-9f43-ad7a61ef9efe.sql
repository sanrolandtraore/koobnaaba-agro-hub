
-- Server-side subscription enforcement function
CREATE OR REPLACE FUNCTION public.check_subscription_limit(_user_id uuid, _resource text)
RETURNS void
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _plan text;
  _status text;
  _expires_at timestamptz;
  _is_premium boolean := false;
  _current_count int;
  _max_limit int;
BEGIN
  -- Check subscription
  SELECT plan, status, expires_at INTO _plan, _status, _expires_at
  FROM public.user_subscriptions
  WHERE user_id = _user_id AND status = 'active'
  ORDER BY created_at DESC LIMIT 1;

  IF _plan = 'premium' AND (_expires_at IS NULL OR _expires_at > now()) THEN
    _is_premium := true;
  END IF;

  -- Premium users have no limits
  IF _is_premium THEN
    RETURN;
  END IF;

  -- Check limits for free plan
  IF _resource = 'parcels' THEN
    SELECT COUNT(*) INTO _current_count
    FROM public.parcels p JOIN public.farms f ON f.id = p.farm_id
    WHERE f.user_id = _user_id;
    _max_limit := 3;
  ELSIF _resource = 'animals' THEN
    SELECT COUNT(*) INTO _current_count
    FROM public.animals a JOIN public.farms f ON f.id = a.farm_id
    WHERE f.user_id = _user_id;
    _max_limit := 10;
  ELSIF _resource = 'members' THEN
    SELECT COUNT(*) INTO _current_count
    FROM public.cooperative_members
    WHERE cooperative_user_id = _user_id;
    _max_limit := 5;
  ELSE
    RETURN;
  END IF;

  IF _current_count >= _max_limit THEN
    RAISE EXCEPTION 'Limite du plan gratuit atteinte: % max %', _resource, _max_limit;
  END IF;
END;
$$;

-- Trigger function for parcels
CREATE OR REPLACE FUNCTION public.enforce_parcel_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _owner_id uuid;
BEGIN
  SELECT f.user_id INTO _owner_id FROM public.farms f WHERE f.id = NEW.farm_id;
  PERFORM public.check_subscription_limit(_owner_id, 'parcels');
  RETURN NEW;
END;
$$;

-- Trigger function for animals
CREATE OR REPLACE FUNCTION public.enforce_animal_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _owner_id uuid;
BEGIN
  SELECT f.user_id INTO _owner_id FROM public.farms f WHERE f.id = NEW.farm_id;
  PERFORM public.check_subscription_limit(_owner_id, 'animals');
  RETURN NEW;
END;
$$;

-- Trigger function for cooperative members
CREATE OR REPLACE FUNCTION public.enforce_member_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM public.check_subscription_limit(NEW.cooperative_user_id, 'members');
  RETURN NEW;
END;
$$;

-- Create triggers
CREATE TRIGGER check_parcel_limit
  BEFORE INSERT ON public.parcels
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_parcel_limit();

CREATE TRIGGER check_animal_limit
  BEFORE INSERT ON public.animals
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_animal_limit();

CREATE TRIGGER check_member_limit
  BEFORE INSERT ON public.cooperative_members
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_member_limit();

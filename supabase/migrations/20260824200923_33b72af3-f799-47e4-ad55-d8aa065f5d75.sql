CREATE OR REPLACE FUNCTION public.get_user_total_costs(_user_id uuid)
RETURNS numeric
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE _total numeric;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> _user_id THEN
    RAISE EXCEPTION 'Accès refusé';
  END IF;
  SELECT COALESCE(SUM(ce.amount), 0) INTO _total
  FROM cost_entries ce
  JOIN crop_cycles cc ON cc.id = ce.crop_cycle_id
  JOIN parcels p ON p.id = cc.parcel_id
  JOIN farms f ON f.id = p.farm_id
  WHERE f.user_id = _user_id;
  RETURN _total;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_cooperative_owner_for_member(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT cooperative_user_id
  FROM public.cooperative_members
  WHERE linked_user_id = _user_id
    AND status = 'actif'
    AND (auth.uid() = _user_id OR auth.role() = 'service_role')
  LIMIT 1
$function$;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_farm_owner_from_parcel(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_farm_owner_from_cycle(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_farm_owner_from_animal(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_cooperative_owner_for_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_cooperative_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_total_costs(uuid) TO authenticated;
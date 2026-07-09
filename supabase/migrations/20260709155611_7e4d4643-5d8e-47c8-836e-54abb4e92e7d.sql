
-- Revoke default public EXECUTE from all public functions, then re-grant only where needed
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_cooperative_admin(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_farm_owner_from_cycle(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_farm_owner_from_parcel(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_farm_owner_from_animal(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_cooperative_owner_for_member(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.check_subscription_limit(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_user_total_costs(uuid) FROM PUBLIC, anon, authenticated;

-- Trigger functions: no client should call these directly
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_member_limit() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_parcel_limit() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_animal_limit() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_listing_rating() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.protect_cooperative_member_role() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.protect_booking_financial_fields() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.validate_escrow_transition() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at() FROM PUBLIC, anon, authenticated;

-- RPCs intentionally callable by signed-in users
REVOKE EXECUTE ON FUNCTION public.generate_cooperative_invite_code() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.generate_cooperative_invite_code() TO authenticated;
REVOKE EXECUTE ON FUNCTION public.join_cooperative_by_code(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.join_cooperative_by_code(text) TO authenticated;

-- Restrict avatar bucket listing: public CDN URLs still work, but clients can only list their own folder
DROP POLICY IF EXISTS "Public read access to avatars" ON storage.objects;
CREATE POLICY "Users can list own avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = (auth.uid())::text);

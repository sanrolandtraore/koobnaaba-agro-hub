
-- Triggers uniquement (les FK existaient déjà)

DROP TRIGGER IF EXISTS trg_enforce_animal_limit ON public.animals;
CREATE TRIGGER trg_enforce_animal_limit
  BEFORE INSERT ON public.animals
  FOR EACH ROW EXECUTE FUNCTION public.enforce_animal_limit();

DROP TRIGGER IF EXISTS trg_enforce_parcel_limit ON public.parcels;
CREATE TRIGGER trg_enforce_parcel_limit
  BEFORE INSERT ON public.parcels
  FOR EACH ROW EXECUTE FUNCTION public.enforce_parcel_limit();

DROP TRIGGER IF EXISTS trg_enforce_member_limit ON public.cooperative_members;
CREATE TRIGGER trg_enforce_member_limit
  BEFORE INSERT ON public.cooperative_members
  FOR EACH ROW EXECUTE FUNCTION public.enforce_member_limit();

DROP TRIGGER IF EXISTS trg_animals_updated_at ON public.animals;
CREATE TRIGGER trg_animals_updated_at
  BEFORE UPDATE ON public.animals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trg_feed_stocks_updated_at ON public.feed_stocks;
CREATE TRIGGER trg_feed_stocks_updated_at
  BEFORE UPDATE ON public.feed_stocks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trg_farms_updated_at ON public.farms;
CREATE TRIGGER trg_farms_updated_at
  BEFORE UPDATE ON public.farms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trg_crop_cycles_updated_at ON public.crop_cycles;
CREATE TRIGGER trg_crop_cycles_updated_at
  BEFORE UPDATE ON public.crop_cycles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trg_cooperative_members_updated_at ON public.cooperative_members;
CREATE TRIGGER trg_cooperative_members_updated_at
  BEFORE UPDATE ON public.cooperative_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trg_cooperative_profiles_updated_at ON public.cooperative_profiles;
CREATE TRIGGER trg_cooperative_profiles_updated_at
  BEFORE UPDATE ON public.cooperative_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trg_protect_booking_financial_fields ON public.equipment_bookings;
CREATE TRIGGER trg_protect_booking_financial_fields
  BEFORE UPDATE ON public.equipment_bookings
  FOR EACH ROW EXECUTE FUNCTION public.protect_booking_financial_fields();

DROP TRIGGER IF EXISTS trg_validate_escrow_transition ON public.equipment_bookings;
CREATE TRIGGER trg_validate_escrow_transition
  BEFORE UPDATE ON public.equipment_bookings
  FOR EACH ROW EXECUTE FUNCTION public.validate_escrow_transition();

DROP TRIGGER IF EXISTS trg_update_listing_rating ON public.equipment_reviews;
CREATE TRIGGER trg_update_listing_rating
  AFTER INSERT OR UPDATE OR DELETE ON public.equipment_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_listing_rating();

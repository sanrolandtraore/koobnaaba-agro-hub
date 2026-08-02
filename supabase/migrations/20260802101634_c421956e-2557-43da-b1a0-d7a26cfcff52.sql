-- 1. Freemium limits
DROP TRIGGER IF EXISTS trg_enforce_parcel_limit ON public.parcels;
CREATE TRIGGER trg_enforce_parcel_limit BEFORE INSERT ON public.parcels
FOR EACH ROW EXECUTE FUNCTION public.enforce_parcel_limit();

DROP TRIGGER IF EXISTS trg_enforce_animal_limit ON public.animals;
CREATE TRIGGER trg_enforce_animal_limit BEFORE INSERT ON public.animals
FOR EACH ROW EXECUTE FUNCTION public.enforce_animal_limit();

DROP TRIGGER IF EXISTS trg_enforce_member_limit ON public.cooperative_members;
CREATE TRIGGER trg_enforce_member_limit BEFORE INSERT ON public.cooperative_members
FOR EACH ROW EXECUTE FUNCTION public.enforce_member_limit();

-- 2. Financial field protection
DROP TRIGGER IF EXISTS trg_protect_booking_financial_fields ON public.equipment_bookings;
CREATE TRIGGER trg_protect_booking_financial_fields BEFORE UPDATE ON public.equipment_bookings
FOR EACH ROW EXECUTE FUNCTION public.protect_booking_financial_fields();

DROP TRIGGER IF EXISTS trg_validate_escrow_transition ON public.marketplace_orders;
CREATE TRIGGER trg_validate_escrow_transition BEFORE UPDATE ON public.marketplace_orders
FOR EACH ROW EXECUTE FUNCTION public.validate_escrow_transition();

-- 2b. Marketplace order amount is immutable for non service_role
CREATE OR REPLACE FUNCTION public.protect_order_amount()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF current_setting('request.jwt.claims', true)::json->>'role' = 'service_role' THEN
    RETURN NEW;
  END IF;
  IF OLD.amount IS DISTINCT FROM NEW.amount THEN
    RAISE EXCEPTION 'Le montant d''une commande ne peut pas être modifié';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.protect_order_amount() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_protect_order_amount ON public.marketplace_orders;
CREATE TRIGGER trg_protect_order_amount BEFORE UPDATE ON public.marketplace_orders
FOR EACH ROW EXECUTE FUNCTION public.protect_order_amount();

-- 2c. Cooperative sales: total is always recomputed server side
CREATE OR REPLACE FUNCTION public.compute_cooperative_sale_total()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  NEW.total_amount := COALESCE(NEW.quantity_kg, 0) * COALESCE(NEW.unit_price, 0);
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.compute_cooperative_sale_total() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_compute_cooperative_sale_total ON public.cooperative_sales;
CREATE TRIGGER trg_compute_cooperative_sale_total BEFORE INSERT OR UPDATE ON public.cooperative_sales
FOR EACH ROW EXECUTE FUNCTION public.compute_cooperative_sale_total();

-- 3. Cooperative admin role protection
DROP TRIGGER IF EXISTS trg_protect_cooperative_member_role ON public.cooperative_members;
CREATE TRIGGER trg_protect_cooperative_member_role BEFORE INSERT OR UPDATE ON public.cooperative_members
FOR EACH ROW EXECUTE FUNCTION public.protect_cooperative_member_role();

-- 4. Listing rating aggregation
DROP TRIGGER IF EXISTS trg_update_listing_rating ON public.equipment_reviews;
CREATE TRIGGER trg_update_listing_rating AFTER INSERT OR UPDATE OR DELETE ON public.equipment_reviews
FOR EACH ROW EXECUTE FUNCTION public.update_listing_rating();

-- 5. updated_at maintenance
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'animals','client_visits','cooperative_members','cooperative_profiles','crop_cycles',
    'crop_technical_sheets','equipment_bookings','equipment_listings','expert_clients',
    'expert_parcels','expert_prescriptions','farms','feed_stocks','field_observations',
    'investment_plans','marketplace_orders','marketplace_services','parcels','partner_directory',
    'partner_entries','profiles','scouting_sessions','service_requests','user_subscriptions'
  ] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_updated_at ON public.%I', t);
    EXECUTE format('CREATE TRIGGER trg_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at()', t);
  END LOOP;
END $$;

-- 6. Helpful indexes for frequent lookups
CREATE INDEX IF NOT EXISTS idx_parcels_farm_id ON public.parcels(farm_id);
CREATE INDEX IF NOT EXISTS idx_animals_farm_id ON public.animals(farm_id);
CREATE INDEX IF NOT EXISTS idx_crop_cycles_parcel_id ON public.crop_cycles(parcel_id);
CREATE INDEX IF NOT EXISTS idx_cost_entries_cycle ON public.cost_entries(crop_cycle_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_cycle ON public.activity_logs(crop_cycle_id);
CREATE INDEX IF NOT EXISTS idx_harvests_cycle ON public.harvests(crop_cycle_id);
CREATE INDEX IF NOT EXISTS idx_farms_user_id ON public.farms(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_coop_members_owner ON public.cooperative_members(cooperative_user_id);
CREATE INDEX IF NOT EXISTS idx_coop_members_linked ON public.cooperative_members(linked_user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_client ON public.marketplace_orders(client_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_provider ON public.marketplace_orders(provider_id);
CREATE INDEX IF NOT EXISTS idx_animal_health_animal ON public.animal_health_events(animal_id);
CREATE INDEX IF NOT EXISTS idx_animal_feedings_farm ON public.animal_feedings(farm_id);
CREATE INDEX IF NOT EXISTS idx_livestock_sales_farm ON public.livestock_sales(farm_id);
CREATE INDEX IF NOT EXISTS idx_livestock_expenses_farm ON public.livestock_expenses(farm_id);
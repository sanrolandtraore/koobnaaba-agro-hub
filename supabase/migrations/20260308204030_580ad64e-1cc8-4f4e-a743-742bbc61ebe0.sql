
-- ═══ PERFORMANCE INDEXES for 10K+ users ═══

-- Core lookup: profiles by user_id
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles (user_id);

-- Core lookup: user_roles by user_id  
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles (user_id);

-- Farms by owner
CREATE INDEX IF NOT EXISTS idx_farms_user_id ON public.farms (user_id);

-- Parcels by farm
CREATE INDEX IF NOT EXISTS idx_parcels_farm_id ON public.parcels (farm_id);

-- Crop cycles by parcel and status
CREATE INDEX IF NOT EXISTS idx_crop_cycles_parcel_id ON public.crop_cycles (parcel_id);
CREATE INDEX IF NOT EXISTS idx_crop_cycles_status ON public.crop_cycles (status);

-- Activity logs by cycle and date
CREATE INDEX IF NOT EXISTS idx_activity_logs_crop_cycle_id ON public.activity_logs (crop_cycle_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_date ON public.activity_logs (date DESC);

-- Cost entries by cycle
CREATE INDEX IF NOT EXISTS idx_cost_entries_crop_cycle_id ON public.cost_entries (crop_cycle_id);

-- Harvests by cycle
CREATE INDEX IF NOT EXISTS idx_harvests_crop_cycle_id ON public.harvests (crop_cycle_id);

-- Animals by farm
CREATE INDEX IF NOT EXISTS idx_animals_farm_id ON public.animals (farm_id);
CREATE INDEX IF NOT EXISTS idx_animals_status ON public.animals (status);

-- Animal sub-tables
CREATE INDEX IF NOT EXISTS idx_animal_health_events_animal_id ON public.animal_health_events (animal_id);
CREATE INDEX IF NOT EXISTS idx_animal_reproductions_animal_id ON public.animal_reproductions (animal_id);
CREATE INDEX IF NOT EXISTS idx_animal_feedings_farm_id ON public.animal_feedings (farm_id);

-- Livestock finance
CREATE INDEX IF NOT EXISTS idx_livestock_expenses_farm_id ON public.livestock_expenses (farm_id);
CREATE INDEX IF NOT EXISTS idx_livestock_sales_farm_id ON public.livestock_sales (farm_id);

-- Cooperative tables by cooperative_user_id
CREATE INDEX IF NOT EXISTS idx_coop_members_user_id ON public.cooperative_members (cooperative_user_id);
CREATE INDEX IF NOT EXISTS idx_coop_collectes_user_id ON public.cooperative_collectes (cooperative_user_id);
CREATE INDEX IF NOT EXISTS idx_coop_sales_user_id ON public.cooperative_sales (cooperative_user_id);
CREATE INDEX IF NOT EXISTS idx_coop_expenses_user_id ON public.cooperative_expenses (cooperative_user_id);
CREATE INDEX IF NOT EXISTS idx_coop_cotisations_user_id ON public.cooperative_cotisations (cooperative_user_id);
CREATE INDEX IF NOT EXISTS idx_coop_distributions_user_id ON public.cooperative_distributions (cooperative_user_id);
CREATE INDEX IF NOT EXISTS idx_coop_parcels_user_id ON public.cooperative_parcels (cooperative_user_id);
CREATE INDEX IF NOT EXISTS idx_coop_equipment_user_id ON public.cooperative_equipment_schedule (cooperative_user_id);
CREATE INDEX IF NOT EXISTS idx_coop_documents_user_id ON public.cooperative_documents (cooperative_user_id);
CREATE INDEX IF NOT EXISTS idx_coop_profiles_user_id ON public.cooperative_profiles (cooperative_user_id);

-- Equipment marketplace
CREATE INDEX IF NOT EXISTS idx_equipment_listings_owner_id ON public.equipment_listings (owner_id);
CREATE INDEX IF NOT EXISTS idx_equipment_listings_status ON public.equipment_listings (status);
CREATE INDEX IF NOT EXISTS idx_equipment_bookings_listing_id ON public.equipment_bookings (listing_id);
CREATE INDEX IF NOT EXISTS idx_equipment_bookings_renter_id ON public.equipment_bookings (renter_id);

-- Service marketplace
CREATE INDEX IF NOT EXISTS idx_marketplace_services_provider_id ON public.marketplace_services (provider_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_services_category ON public.marketplace_services (category);
CREATE INDEX IF NOT EXISTS idx_marketplace_services_is_active ON public.marketplace_services (is_active);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_service_id ON public.marketplace_orders (service_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_client_id ON public.marketplace_orders (client_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_provider_id ON public.marketplace_orders (provider_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_status ON public.marketplace_orders (status);

-- Service requests
CREATE INDEX IF NOT EXISTS idx_service_requests_user_id ON public.service_requests (user_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON public.service_requests (status);

-- Workers & Equipment by farm
CREATE INDEX IF NOT EXISTS idx_workers_farm_id ON public.workers (farm_id);
CREATE INDEX IF NOT EXISTS idx_equipment_farm_id ON public.equipment (farm_id);

-- Feed stocks by farm
CREATE INDEX IF NOT EXISTS idx_feed_stocks_farm_id ON public.feed_stocks (farm_id);

-- Calendar events by cycle
CREATE INDEX IF NOT EXISTS idx_crop_calendar_events_cycle_id ON public.crop_calendar_events (crop_cycle_id);
CREATE INDEX IF NOT EXISTS idx_crop_calendar_events_date ON public.crop_calendar_events (planned_date);

-- Investment plans by cycle
CREATE INDEX IF NOT EXISTS idx_investment_plans_cycle_id ON public.investment_plans (crop_cycle_id);

-- Subscriptions by user
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions (user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions (status);

-- Partner directory
CREATE INDEX IF NOT EXISTS idx_partner_directory_category ON public.partner_directory (category);
CREATE INDEX IF NOT EXISTS idx_partner_directory_created_by ON public.partner_directory (created_by);

-- Audit log
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.audit_log (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log (created_at DESC);

-- ═══ Aggregate function for dashboard costs ═══
CREATE OR REPLACE FUNCTION public.get_user_total_costs(_user_id uuid)
RETURNS numeric
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(SUM(ce.amount), 0)
  FROM cost_entries ce
  JOIN crop_cycles cc ON cc.id = ce.crop_cycle_id
  JOIN parcels p ON p.id = cc.parcel_id
  JOIN farms f ON f.id = p.farm_id
  WHERE f.user_id = _user_id
$$;

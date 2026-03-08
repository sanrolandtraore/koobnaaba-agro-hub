
-- ============================================================
-- FIX 1: Convert ALL RESTRICTIVE RLS policies to PERMISSIVE
-- Drop and recreate every policy as PERMISSIVE (default)
-- ============================================================

-- ---- profiles ----
DROP POLICY IF EXISTS "Users can view own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profiles" ON public.profiles;
CREATE POLICY "Users can view own profiles" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profiles" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profiles" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ---- user_roles ----
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ---- user_subscriptions ----
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Admins can manage subscriptions" ON public.user_subscriptions;
CREATE POLICY "Users can view own subscriptions" ON public.user_subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage subscriptions" ON public.user_subscriptions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ---- farms ----
DROP POLICY IF EXISTS "Users can create farms" ON public.farms;
DROP POLICY IF EXISTS "Users can view own farms" ON public.farms;
DROP POLICY IF EXISTS "Users can update own farms" ON public.farms;
DROP POLICY IF EXISTS "Users can delete own farms" ON public.farms;
CREATE POLICY "Users can create farms" ON public.farms FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own farms" ON public.farms FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own farms" ON public.farms FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own farms" ON public.farms FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ---- parcels ----
DROP POLICY IF EXISTS "Users can create parcels" ON public.parcels;
DROP POLICY IF EXISTS "Users can view own parcels" ON public.parcels;
DROP POLICY IF EXISTS "Users can update own parcels" ON public.parcels;
DROP POLICY IF EXISTS "Users can delete own parcels" ON public.parcels;
CREATE POLICY "Users can create parcels" ON public.parcels FOR INSERT TO authenticated WITH CHECK (public.get_farm_owner_from_parcel(farm_id) = auth.uid());
CREATE POLICY "Users can view own parcels" ON public.parcels FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM farms WHERE farms.id = parcels.farm_id AND farms.user_id = auth.uid()));
CREATE POLICY "Users can update own parcels" ON public.parcels FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM farms WHERE farms.id = parcels.farm_id AND farms.user_id = auth.uid()));
CREATE POLICY "Users can delete own parcels" ON public.parcels FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM farms WHERE farms.id = parcels.farm_id AND farms.user_id = auth.uid()));

-- ---- crop_cycles ----
DROP POLICY IF EXISTS "Users can create cycles" ON public.crop_cycles;
DROP POLICY IF EXISTS "Users can view own cycles" ON public.crop_cycles;
DROP POLICY IF EXISTS "Users can update own cycles" ON public.crop_cycles;
DROP POLICY IF EXISTS "Users can delete own cycles" ON public.crop_cycles;
CREATE POLICY "Users can create cycles" ON public.crop_cycles FOR INSERT TO authenticated WITH CHECK (public.get_farm_owner_from_parcel(parcel_id) = auth.uid());
CREATE POLICY "Users can view own cycles" ON public.crop_cycles FOR SELECT TO authenticated USING (public.get_farm_owner_from_parcel(parcel_id) = auth.uid());
CREATE POLICY "Users can update own cycles" ON public.crop_cycles FOR UPDATE TO authenticated USING (public.get_farm_owner_from_parcel(parcel_id) = auth.uid());
CREATE POLICY "Users can delete own cycles" ON public.crop_cycles FOR DELETE TO authenticated USING (public.get_farm_owner_from_parcel(parcel_id) = auth.uid());

-- ---- activity_logs ----
DROP POLICY IF EXISTS "Users can create activities" ON public.activity_logs;
DROP POLICY IF EXISTS "Users can view own activities" ON public.activity_logs;
DROP POLICY IF EXISTS "Users can update own activities" ON public.activity_logs;
DROP POLICY IF EXISTS "Users can delete own activities" ON public.activity_logs;
CREATE POLICY "Users can create activities" ON public.activity_logs FOR INSERT TO authenticated WITH CHECK (public.get_farm_owner_from_cycle(crop_cycle_id) = auth.uid());
CREATE POLICY "Users can view own activities" ON public.activity_logs FOR SELECT TO authenticated USING (public.get_farm_owner_from_cycle(crop_cycle_id) = auth.uid());
CREATE POLICY "Users can update own activities" ON public.activity_logs FOR UPDATE TO authenticated USING (public.get_farm_owner_from_cycle(crop_cycle_id) = auth.uid());
CREATE POLICY "Users can delete own activities" ON public.activity_logs FOR DELETE TO authenticated USING (public.get_farm_owner_from_cycle(crop_cycle_id) = auth.uid());

-- ---- cost_entries ----
DROP POLICY IF EXISTS "Users can create costs" ON public.cost_entries;
DROP POLICY IF EXISTS "Users can view own costs" ON public.cost_entries;
DROP POLICY IF EXISTS "Users can update own costs" ON public.cost_entries;
DROP POLICY IF EXISTS "Users can delete own costs" ON public.cost_entries;
CREATE POLICY "Users can create costs" ON public.cost_entries FOR INSERT TO authenticated WITH CHECK (public.get_farm_owner_from_cycle(crop_cycle_id) = auth.uid());
CREATE POLICY "Users can view own costs" ON public.cost_entries FOR SELECT TO authenticated USING (public.get_farm_owner_from_cycle(crop_cycle_id) = auth.uid());
CREATE POLICY "Users can update own costs" ON public.cost_entries FOR UPDATE TO authenticated USING (public.get_farm_owner_from_cycle(crop_cycle_id) = auth.uid());
CREATE POLICY "Users can delete own costs" ON public.cost_entries FOR DELETE TO authenticated USING (public.get_farm_owner_from_cycle(crop_cycle_id) = auth.uid());

-- ---- harvests ----
DROP POLICY IF EXISTS "Users can create harvests" ON public.harvests;
DROP POLICY IF EXISTS "Users can view own harvests" ON public.harvests;
DROP POLICY IF EXISTS "Users can update own harvests" ON public.harvests;
DROP POLICY IF EXISTS "Users can delete own harvests" ON public.harvests;
CREATE POLICY "Users can create harvests" ON public.harvests FOR INSERT TO authenticated WITH CHECK (public.get_farm_owner_from_cycle(crop_cycle_id) = auth.uid());
CREATE POLICY "Users can view own harvests" ON public.harvests FOR SELECT TO authenticated USING (public.get_farm_owner_from_cycle(crop_cycle_id) = auth.uid());
CREATE POLICY "Users can update own harvests" ON public.harvests FOR UPDATE TO authenticated USING (public.get_farm_owner_from_cycle(crop_cycle_id) = auth.uid());
CREATE POLICY "Users can delete own harvests" ON public.harvests FOR DELETE TO authenticated USING (public.get_farm_owner_from_cycle(crop_cycle_id) = auth.uid());

-- ---- crop_calendar_events ----
DROP POLICY IF EXISTS "Users can create calendar events" ON public.crop_calendar_events;
DROP POLICY IF EXISTS "Users can view own calendar events" ON public.crop_calendar_events;
DROP POLICY IF EXISTS "Users can update own calendar events" ON public.crop_calendar_events;
DROP POLICY IF EXISTS "Users can delete own calendar events" ON public.crop_calendar_events;
CREATE POLICY "Users can create calendar events" ON public.crop_calendar_events FOR INSERT TO authenticated WITH CHECK (public.get_farm_owner_from_cycle(crop_cycle_id) = auth.uid());
CREATE POLICY "Users can view own calendar events" ON public.crop_calendar_events FOR SELECT TO authenticated USING (public.get_farm_owner_from_cycle(crop_cycle_id) = auth.uid());
CREATE POLICY "Users can update own calendar events" ON public.crop_calendar_events FOR UPDATE TO authenticated USING (public.get_farm_owner_from_cycle(crop_cycle_id) = auth.uid());
CREATE POLICY "Users can delete own calendar events" ON public.crop_calendar_events FOR DELETE TO authenticated USING (public.get_farm_owner_from_cycle(crop_cycle_id) = auth.uid());

-- ---- crop_cycle_inputs ----
DROP POLICY IF EXISTS "Users can create cycle inputs" ON public.crop_cycle_inputs;
DROP POLICY IF EXISTS "Users can view own cycle inputs" ON public.crop_cycle_inputs;
DROP POLICY IF EXISTS "Users can update own cycle inputs" ON public.crop_cycle_inputs;
DROP POLICY IF EXISTS "Users can delete own cycle inputs" ON public.crop_cycle_inputs;
CREATE POLICY "Users can create cycle inputs" ON public.crop_cycle_inputs FOR INSERT TO authenticated WITH CHECK (public.get_farm_owner_from_cycle(crop_cycle_id) = auth.uid());
CREATE POLICY "Users can view own cycle inputs" ON public.crop_cycle_inputs FOR SELECT TO authenticated USING (public.get_farm_owner_from_cycle(crop_cycle_id) = auth.uid());
CREATE POLICY "Users can update own cycle inputs" ON public.crop_cycle_inputs FOR UPDATE TO authenticated USING (public.get_farm_owner_from_cycle(crop_cycle_id) = auth.uid());
CREATE POLICY "Users can delete own cycle inputs" ON public.crop_cycle_inputs FOR DELETE TO authenticated USING (public.get_farm_owner_from_cycle(crop_cycle_id) = auth.uid());

-- ---- investment_plans ----
DROP POLICY IF EXISTS "Users can view own investment plans" ON public.investment_plans;
DROP POLICY IF EXISTS "Users can create investment plans" ON public.investment_plans;
DROP POLICY IF EXISTS "Users can update own investment plans" ON public.investment_plans;
DROP POLICY IF EXISTS "Users can delete own investment plans" ON public.investment_plans;
CREATE POLICY "Users can view own investment plans" ON public.investment_plans FOR SELECT TO authenticated USING (public.get_farm_owner_from_cycle(crop_cycle_id) = auth.uid());
CREATE POLICY "Users can create investment plans" ON public.investment_plans FOR INSERT TO authenticated WITH CHECK (public.get_farm_owner_from_cycle(crop_cycle_id) = auth.uid());
CREATE POLICY "Users can update own investment plans" ON public.investment_plans FOR UPDATE TO authenticated USING (public.get_farm_owner_from_cycle(crop_cycle_id) = auth.uid());
CREATE POLICY "Users can delete own investment plans" ON public.investment_plans FOR DELETE TO authenticated USING (public.get_farm_owner_from_cycle(crop_cycle_id) = auth.uid());

-- ---- animals ----
DROP POLICY IF EXISTS "Users can create animals" ON public.animals;
DROP POLICY IF EXISTS "Users can view own animals" ON public.animals;
DROP POLICY IF EXISTS "Users can update own animals" ON public.animals;
DROP POLICY IF EXISTS "Users can delete own animals" ON public.animals;
CREATE POLICY "Users can create animals" ON public.animals FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM farms WHERE farms.id = animals.farm_id AND farms.user_id = auth.uid()));
CREATE POLICY "Users can view own animals" ON public.animals FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM farms WHERE farms.id = animals.farm_id AND farms.user_id = auth.uid()));
CREATE POLICY "Users can update own animals" ON public.animals FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM farms WHERE farms.id = animals.farm_id AND farms.user_id = auth.uid()));
CREATE POLICY "Users can delete own animals" ON public.animals FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM farms WHERE farms.id = animals.farm_id AND farms.user_id = auth.uid()));

-- ---- animal_feedings ----
DROP POLICY IF EXISTS "Users can create feedings" ON public.animal_feedings;
DROP POLICY IF EXISTS "Users can view own feedings" ON public.animal_feedings;
DROP POLICY IF EXISTS "Users can update own feedings" ON public.animal_feedings;
DROP POLICY IF EXISTS "Users can delete own feedings" ON public.animal_feedings;
CREATE POLICY "Users can create feedings" ON public.animal_feedings FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM farms WHERE farms.id = animal_feedings.farm_id AND farms.user_id = auth.uid()));
CREATE POLICY "Users can view own feedings" ON public.animal_feedings FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM farms WHERE farms.id = animal_feedings.farm_id AND farms.user_id = auth.uid()));
CREATE POLICY "Users can update own feedings" ON public.animal_feedings FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM farms WHERE farms.id = animal_feedings.farm_id AND farms.user_id = auth.uid()));
CREATE POLICY "Users can delete own feedings" ON public.animal_feedings FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM farms WHERE farms.id = animal_feedings.farm_id AND farms.user_id = auth.uid()));

-- ---- animal_health_events ----
DROP POLICY IF EXISTS "Users can create health events" ON public.animal_health_events;
DROP POLICY IF EXISTS "Users can view own health events" ON public.animal_health_events;
DROP POLICY IF EXISTS "Users can update own health events" ON public.animal_health_events;
DROP POLICY IF EXISTS "Users can delete own health events" ON public.animal_health_events;
CREATE POLICY "Users can create health events" ON public.animal_health_events FOR INSERT TO authenticated WITH CHECK (public.get_farm_owner_from_animal(animal_id) = auth.uid());
CREATE POLICY "Users can view own health events" ON public.animal_health_events FOR SELECT TO authenticated USING (public.get_farm_owner_from_animal(animal_id) = auth.uid());
CREATE POLICY "Users can update own health events" ON public.animal_health_events FOR UPDATE TO authenticated USING (public.get_farm_owner_from_animal(animal_id) = auth.uid());
CREATE POLICY "Users can delete own health events" ON public.animal_health_events FOR DELETE TO authenticated USING (public.get_farm_owner_from_animal(animal_id) = auth.uid());

-- ---- animal_reproductions ----
DROP POLICY IF EXISTS "Users can create reproductions" ON public.animal_reproductions;
DROP POLICY IF EXISTS "Users can view own reproductions" ON public.animal_reproductions;
DROP POLICY IF EXISTS "Users can update own reproductions" ON public.animal_reproductions;
DROP POLICY IF EXISTS "Users can delete own reproductions" ON public.animal_reproductions;
CREATE POLICY "Users can create reproductions" ON public.animal_reproductions FOR INSERT TO authenticated WITH CHECK (public.get_farm_owner_from_animal(animal_id) = auth.uid());
CREATE POLICY "Users can view own reproductions" ON public.animal_reproductions FOR SELECT TO authenticated USING (public.get_farm_owner_from_animal(animal_id) = auth.uid());
CREATE POLICY "Users can update own reproductions" ON public.animal_reproductions FOR UPDATE TO authenticated USING (public.get_farm_owner_from_animal(animal_id) = auth.uid());
CREATE POLICY "Users can delete own reproductions" ON public.animal_reproductions FOR DELETE TO authenticated USING (public.get_farm_owner_from_animal(animal_id) = auth.uid());

-- ---- equipment ----
DROP POLICY IF EXISTS "Users can create equipment" ON public.equipment;
DROP POLICY IF EXISTS "Users can view own equipment" ON public.equipment;
DROP POLICY IF EXISTS "Users can update own equipment" ON public.equipment;
DROP POLICY IF EXISTS "Users can delete own equipment" ON public.equipment;
CREATE POLICY "Users can create equipment" ON public.equipment FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM farms WHERE farms.id = equipment.farm_id AND farms.user_id = auth.uid()));
CREATE POLICY "Users can view own equipment" ON public.equipment FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM farms WHERE farms.id = equipment.farm_id AND farms.user_id = auth.uid()));
CREATE POLICY "Users can update own equipment" ON public.equipment FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM farms WHERE farms.id = equipment.farm_id AND farms.user_id = auth.uid()));
CREATE POLICY "Users can delete own equipment" ON public.equipment FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM farms WHERE farms.id = equipment.farm_id AND farms.user_id = auth.uid()));

-- ---- workers ----
DROP POLICY IF EXISTS "Users can create workers" ON public.workers;
DROP POLICY IF EXISTS "Users can view own workers" ON public.workers;
DROP POLICY IF EXISTS "Users can update own workers" ON public.workers;
DROP POLICY IF EXISTS "Users can delete own workers" ON public.workers;
CREATE POLICY "Users can create workers" ON public.workers FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM farms WHERE farms.id = workers.farm_id AND farms.user_id = auth.uid()));
CREATE POLICY "Users can view own workers" ON public.workers FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM farms WHERE farms.id = workers.farm_id AND farms.user_id = auth.uid()));
CREATE POLICY "Users can update own workers" ON public.workers FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM farms WHERE farms.id = workers.farm_id AND farms.user_id = auth.uid()));
CREATE POLICY "Users can delete own workers" ON public.workers FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM farms WHERE farms.id = workers.farm_id AND farms.user_id = auth.uid()));

-- ---- feed_stocks ----
DROP POLICY IF EXISTS "Users can create feed stocks" ON public.feed_stocks;
DROP POLICY IF EXISTS "Users can view own feed stocks" ON public.feed_stocks;
DROP POLICY IF EXISTS "Users can update own feed stocks" ON public.feed_stocks;
DROP POLICY IF EXISTS "Users can delete own feed stocks" ON public.feed_stocks;
CREATE POLICY "Users can create feed stocks" ON public.feed_stocks FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM farms WHERE farms.id = feed_stocks.farm_id AND farms.user_id = auth.uid()));
CREATE POLICY "Users can view own feed stocks" ON public.feed_stocks FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM farms WHERE farms.id = feed_stocks.farm_id AND farms.user_id = auth.uid()));
CREATE POLICY "Users can update own feed stocks" ON public.feed_stocks FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM farms WHERE farms.id = feed_stocks.farm_id AND farms.user_id = auth.uid()));
CREATE POLICY "Users can delete own feed stocks" ON public.feed_stocks FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM farms WHERE farms.id = feed_stocks.farm_id AND farms.user_id = auth.uid()));

-- ---- livestock_expenses ----
DROP POLICY IF EXISTS "Users can create livestock expenses" ON public.livestock_expenses;
DROP POLICY IF EXISTS "Users can view own livestock expenses" ON public.livestock_expenses;
DROP POLICY IF EXISTS "Users can update own livestock expenses" ON public.livestock_expenses;
DROP POLICY IF EXISTS "Users can delete own livestock expenses" ON public.livestock_expenses;
CREATE POLICY "Users can create livestock expenses" ON public.livestock_expenses FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM farms WHERE farms.id = livestock_expenses.farm_id AND farms.user_id = auth.uid()));
CREATE POLICY "Users can view own livestock expenses" ON public.livestock_expenses FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM farms WHERE farms.id = livestock_expenses.farm_id AND farms.user_id = auth.uid()));
CREATE POLICY "Users can update own livestock expenses" ON public.livestock_expenses FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM farms WHERE farms.id = livestock_expenses.farm_id AND farms.user_id = auth.uid()));
CREATE POLICY "Users can delete own livestock expenses" ON public.livestock_expenses FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM farms WHERE farms.id = livestock_expenses.farm_id AND farms.user_id = auth.uid()));

-- ---- livestock_sales ----
DROP POLICY IF EXISTS "Users can create livestock sales" ON public.livestock_sales;
DROP POLICY IF EXISTS "Users can view own livestock sales" ON public.livestock_sales;
DROP POLICY IF EXISTS "Users can update own livestock sales" ON public.livestock_sales;
DROP POLICY IF EXISTS "Users can delete own livestock sales" ON public.livestock_sales;
CREATE POLICY "Users can create livestock sales" ON public.livestock_sales FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM farms WHERE farms.id = livestock_sales.farm_id AND farms.user_id = auth.uid()));
CREATE POLICY "Users can view own livestock sales" ON public.livestock_sales FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM farms WHERE farms.id = livestock_sales.farm_id AND farms.user_id = auth.uid()));
CREATE POLICY "Users can update own livestock sales" ON public.livestock_sales FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM farms WHERE farms.id = livestock_sales.farm_id AND farms.user_id = auth.uid()));
CREATE POLICY "Users can delete own livestock sales" ON public.livestock_sales FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM farms WHERE farms.id = livestock_sales.farm_id AND farms.user_id = auth.uid()));

-- ---- audit_log ----
DROP POLICY IF EXISTS "Authenticated users can insert audit" ON public.audit_log;
DROP POLICY IF EXISTS "Users can view own audit" ON public.audit_log;
CREATE POLICY "Authenticated users can insert audit" ON public.audit_log FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own audit" ON public.audit_log FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- ---- climate_zones ----
DROP POLICY IF EXISTS "Admins can manage climate zones" ON public.climate_zones;
DROP POLICY IF EXISTS "Anyone can read climate zones" ON public.climate_zones;
CREATE POLICY "Anyone can read climate zones" ON public.climate_zones FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage climate zones" ON public.climate_zones FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ---- crop_references ----
DROP POLICY IF EXISTS "Admins can manage crop references" ON public.crop_references;
DROP POLICY IF EXISTS "Anyone can read crop references" ON public.crop_references;
CREATE POLICY "Anyone can read crop references" ON public.crop_references FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage crop references" ON public.crop_references FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ---- plan_limits ----
DROP POLICY IF EXISTS "Anyone can read plan limits" ON public.plan_limits;
DROP POLICY IF EXISTS "Admins can manage plan limits" ON public.plan_limits;
CREATE POLICY "Anyone can read plan limits" ON public.plan_limits FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage plan limits" ON public.plan_limits FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ---- service_requests ----
DROP POLICY IF EXISTS "Users can create service requests" ON public.service_requests;
DROP POLICY IF EXISTS "Users can view own service requests" ON public.service_requests;
DROP POLICY IF EXISTS "Users can update own service requests" ON public.service_requests;
DROP POLICY IF EXISTS "Users can delete own service requests" ON public.service_requests;
DROP POLICY IF EXISTS "Agents can view all service requests" ON public.service_requests;
DROP POLICY IF EXISTS "Agents can update service requests" ON public.service_requests;
CREATE POLICY "Users can create service requests" ON public.service_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own service requests" ON public.service_requests FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'agent_technique'));
CREATE POLICY "Users can update own service requests" ON public.service_requests FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'agent_technique'));
CREATE POLICY "Users can delete own service requests" ON public.service_requests FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ---- cooperative tables ----
-- cooperative_members
DROP POLICY IF EXISTS "Cooperative can insert members" ON public.cooperative_members;
DROP POLICY IF EXISTS "Cooperative can view own members" ON public.cooperative_members;
DROP POLICY IF EXISTS "Cooperative can update own members" ON public.cooperative_members;
DROP POLICY IF EXISTS "Cooperative can delete own members" ON public.cooperative_members;
CREATE POLICY "Cooperative can insert members" ON public.cooperative_members FOR INSERT TO authenticated WITH CHECK (cooperative_user_id = auth.uid() OR (cooperative_user_id = public.get_cooperative_owner_for_member(auth.uid()) AND public.is_cooperative_admin(auth.uid())));
CREATE POLICY "Cooperative can view own members" ON public.cooperative_members FOR SELECT TO authenticated USING (cooperative_user_id = auth.uid() OR cooperative_user_id = public.get_cooperative_owner_for_member(auth.uid()));
CREATE POLICY "Cooperative can update own members" ON public.cooperative_members FOR UPDATE TO authenticated USING (cooperative_user_id = auth.uid() OR (cooperative_user_id = public.get_cooperative_owner_for_member(auth.uid()) AND public.is_cooperative_admin(auth.uid())));
CREATE POLICY "Cooperative can delete own members" ON public.cooperative_members FOR DELETE TO authenticated USING (cooperative_user_id = auth.uid() OR (cooperative_user_id = public.get_cooperative_owner_for_member(auth.uid()) AND public.is_cooperative_admin(auth.uid())));

-- cooperative_collectes
DROP POLICY IF EXISTS "Cooperative can insert collectes" ON public.cooperative_collectes;
DROP POLICY IF EXISTS "Cooperative can view own collectes" ON public.cooperative_collectes;
DROP POLICY IF EXISTS "Cooperative can update own collectes" ON public.cooperative_collectes;
DROP POLICY IF EXISTS "Cooperative can delete own collectes" ON public.cooperative_collectes;
CREATE POLICY "Cooperative can insert collectes" ON public.cooperative_collectes FOR INSERT TO authenticated WITH CHECK (cooperative_user_id = auth.uid() OR (cooperative_user_id = public.get_cooperative_owner_for_member(auth.uid()) AND public.is_cooperative_admin(auth.uid())));
CREATE POLICY "Cooperative can view own collectes" ON public.cooperative_collectes FOR SELECT TO authenticated USING (cooperative_user_id = auth.uid() OR cooperative_user_id = public.get_cooperative_owner_for_member(auth.uid()));
CREATE POLICY "Cooperative can update own collectes" ON public.cooperative_collectes FOR UPDATE TO authenticated USING (cooperative_user_id = auth.uid() OR (cooperative_user_id = public.get_cooperative_owner_for_member(auth.uid()) AND public.is_cooperative_admin(auth.uid())));
CREATE POLICY "Cooperative can delete own collectes" ON public.cooperative_collectes FOR DELETE TO authenticated USING (cooperative_user_id = auth.uid() OR (cooperative_user_id = public.get_cooperative_owner_for_member(auth.uid()) AND public.is_cooperative_admin(auth.uid())));

-- cooperative_cotisations
DROP POLICY IF EXISTS "Cooperative can insert cotisations" ON public.cooperative_cotisations;
DROP POLICY IF EXISTS "Cooperative can view cotisations" ON public.cooperative_cotisations;
DROP POLICY IF EXISTS "Cooperative can update cotisations" ON public.cooperative_cotisations;
DROP POLICY IF EXISTS "Cooperative can delete cotisations" ON public.cooperative_cotisations;
CREATE POLICY "Cooperative can insert cotisations" ON public.cooperative_cotisations FOR INSERT TO authenticated WITH CHECK (cooperative_user_id = auth.uid() OR (cooperative_user_id = public.get_cooperative_owner_for_member(auth.uid()) AND public.is_cooperative_admin(auth.uid())));
CREATE POLICY "Cooperative can view cotisations" ON public.cooperative_cotisations FOR SELECT TO authenticated USING (cooperative_user_id = auth.uid() OR cooperative_user_id = public.get_cooperative_owner_for_member(auth.uid()));
CREATE POLICY "Cooperative can update cotisations" ON public.cooperative_cotisations FOR UPDATE TO authenticated USING (cooperative_user_id = auth.uid() OR (cooperative_user_id = public.get_cooperative_owner_for_member(auth.uid()) AND public.is_cooperative_admin(auth.uid())));
CREATE POLICY "Cooperative can delete cotisations" ON public.cooperative_cotisations FOR DELETE TO authenticated USING (cooperative_user_id = auth.uid() OR (cooperative_user_id = public.get_cooperative_owner_for_member(auth.uid()) AND public.is_cooperative_admin(auth.uid())));

-- cooperative_sales
DROP POLICY IF EXISTS "Cooperative can insert sales" ON public.cooperative_sales;
DROP POLICY IF EXISTS "Cooperative can view own sales" ON public.cooperative_sales;
DROP POLICY IF EXISTS "Cooperative can update own sales" ON public.cooperative_sales;
DROP POLICY IF EXISTS "Cooperative can delete own sales" ON public.cooperative_sales;
CREATE POLICY "Cooperative can insert sales" ON public.cooperative_sales FOR INSERT TO authenticated WITH CHECK (cooperative_user_id = auth.uid() OR (cooperative_user_id = public.get_cooperative_owner_for_member(auth.uid()) AND public.is_cooperative_admin(auth.uid())));
CREATE POLICY "Cooperative can view own sales" ON public.cooperative_sales FOR SELECT TO authenticated USING (cooperative_user_id = auth.uid() OR cooperative_user_id = public.get_cooperative_owner_for_member(auth.uid()));
CREATE POLICY "Cooperative can update own sales" ON public.cooperative_sales FOR UPDATE TO authenticated USING (cooperative_user_id = auth.uid() OR (cooperative_user_id = public.get_cooperative_owner_for_member(auth.uid()) AND public.is_cooperative_admin(auth.uid())));
CREATE POLICY "Cooperative can delete own sales" ON public.cooperative_sales FOR DELETE TO authenticated USING (cooperative_user_id = auth.uid() OR (cooperative_user_id = public.get_cooperative_owner_for_member(auth.uid()) AND public.is_cooperative_admin(auth.uid())));

-- cooperative_distributions
DROP POLICY IF EXISTS "Cooperative can insert distributions" ON public.cooperative_distributions;
DROP POLICY IF EXISTS "Cooperative can view own distributions" ON public.cooperative_distributions;
DROP POLICY IF EXISTS "Cooperative can update own distributions" ON public.cooperative_distributions;
DROP POLICY IF EXISTS "Cooperative can delete own distributions" ON public.cooperative_distributions;
CREATE POLICY "Cooperative can insert distributions" ON public.cooperative_distributions FOR INSERT TO authenticated WITH CHECK (cooperative_user_id = auth.uid() OR (cooperative_user_id = public.get_cooperative_owner_for_member(auth.uid()) AND public.is_cooperative_admin(auth.uid())));
CREATE POLICY "Cooperative can view own distributions" ON public.cooperative_distributions FOR SELECT TO authenticated USING (cooperative_user_id = auth.uid() OR cooperative_user_id = public.get_cooperative_owner_for_member(auth.uid()));
CREATE POLICY "Cooperative can update own distributions" ON public.cooperative_distributions FOR UPDATE TO authenticated USING (cooperative_user_id = auth.uid() OR (cooperative_user_id = public.get_cooperative_owner_for_member(auth.uid()) AND public.is_cooperative_admin(auth.uid())));
CREATE POLICY "Cooperative can delete own distributions" ON public.cooperative_distributions FOR DELETE TO authenticated USING (cooperative_user_id = auth.uid() OR (cooperative_user_id = public.get_cooperative_owner_for_member(auth.uid()) AND public.is_cooperative_admin(auth.uid())));

-- cooperative_profiles
DROP POLICY IF EXISTS "Cooperative can insert own profile" ON public.cooperative_profiles;
DROP POLICY IF EXISTS "Cooperative can view own profile" ON public.cooperative_profiles;
DROP POLICY IF EXISTS "Cooperative can update own profile" ON public.cooperative_profiles;
CREATE POLICY "Cooperative can insert own profile" ON public.cooperative_profiles FOR INSERT TO authenticated WITH CHECK (cooperative_user_id = auth.uid() OR (cooperative_user_id = public.get_cooperative_owner_for_member(auth.uid()) AND public.is_cooperative_admin(auth.uid())));
CREATE POLICY "Cooperative can view own profile" ON public.cooperative_profiles FOR SELECT TO authenticated USING (cooperative_user_id = auth.uid() OR cooperative_user_id = public.get_cooperative_owner_for_member(auth.uid()));
CREATE POLICY "Cooperative can update own profile" ON public.cooperative_profiles FOR UPDATE TO authenticated USING (cooperative_user_id = auth.uid() OR (cooperative_user_id = public.get_cooperative_owner_for_member(auth.uid()) AND public.is_cooperative_admin(auth.uid())));

-- cooperative_parcels
DROP POLICY IF EXISTS "Cooperative can insert parcels" ON public.cooperative_parcels;
DROP POLICY IF EXISTS "Cooperative can view parcels" ON public.cooperative_parcels;
DROP POLICY IF EXISTS "Cooperative can update parcels" ON public.cooperative_parcels;
DROP POLICY IF EXISTS "Cooperative can delete parcels" ON public.cooperative_parcels;
CREATE POLICY "Cooperative can insert parcels" ON public.cooperative_parcels FOR INSERT TO authenticated WITH CHECK (cooperative_user_id = auth.uid() OR (cooperative_user_id = public.get_cooperative_owner_for_member(auth.uid()) AND public.is_cooperative_admin(auth.uid())));
CREATE POLICY "Cooperative can view parcels" ON public.cooperative_parcels FOR SELECT TO authenticated USING (cooperative_user_id = auth.uid() OR cooperative_user_id = public.get_cooperative_owner_for_member(auth.uid()));
CREATE POLICY "Cooperative can update parcels" ON public.cooperative_parcels FOR UPDATE TO authenticated USING (cooperative_user_id = auth.uid() OR (cooperative_user_id = public.get_cooperative_owner_for_member(auth.uid()) AND public.is_cooperative_admin(auth.uid())));
CREATE POLICY "Cooperative can delete parcels" ON public.cooperative_parcels FOR DELETE TO authenticated USING (cooperative_user_id = auth.uid() OR (cooperative_user_id = public.get_cooperative_owner_for_member(auth.uid()) AND public.is_cooperative_admin(auth.uid())));

-- cooperative_equipment_schedule
DROP POLICY IF EXISTS "Cooperative can insert schedule" ON public.cooperative_equipment_schedule;
DROP POLICY IF EXISTS "Cooperative can view schedule" ON public.cooperative_equipment_schedule;
DROP POLICY IF EXISTS "Cooperative can update schedule" ON public.cooperative_equipment_schedule;
DROP POLICY IF EXISTS "Cooperative can delete schedule" ON public.cooperative_equipment_schedule;
CREATE POLICY "Cooperative can insert schedule" ON public.cooperative_equipment_schedule FOR INSERT TO authenticated WITH CHECK (cooperative_user_id = auth.uid() OR (cooperative_user_id = public.get_cooperative_owner_for_member(auth.uid()) AND public.is_cooperative_admin(auth.uid())));
CREATE POLICY "Cooperative can view schedule" ON public.cooperative_equipment_schedule FOR SELECT TO authenticated USING (cooperative_user_id = auth.uid() OR cooperative_user_id = public.get_cooperative_owner_for_member(auth.uid()));
CREATE POLICY "Cooperative can update schedule" ON public.cooperative_equipment_schedule FOR UPDATE TO authenticated USING (cooperative_user_id = auth.uid() OR (cooperative_user_id = public.get_cooperative_owner_for_member(auth.uid()) AND public.is_cooperative_admin(auth.uid())));
CREATE POLICY "Cooperative can delete schedule" ON public.cooperative_equipment_schedule FOR DELETE TO authenticated USING (cooperative_user_id = auth.uid() OR (cooperative_user_id = public.get_cooperative_owner_for_member(auth.uid()) AND public.is_cooperative_admin(auth.uid())));

-- cooperative_expenses
DROP POLICY IF EXISTS "Cooperative can insert expenses" ON public.cooperative_expenses;
DROP POLICY IF EXISTS "Cooperative can view expenses" ON public.cooperative_expenses;
DROP POLICY IF EXISTS "Cooperative can update expenses" ON public.cooperative_expenses;
DROP POLICY IF EXISTS "Cooperative can delete expenses" ON public.cooperative_expenses;
CREATE POLICY "Cooperative can insert expenses" ON public.cooperative_expenses FOR INSERT TO authenticated WITH CHECK (cooperative_user_id = auth.uid() OR (cooperative_user_id = public.get_cooperative_owner_for_member(auth.uid()) AND public.is_cooperative_admin(auth.uid())));
CREATE POLICY "Cooperative can view expenses" ON public.cooperative_expenses FOR SELECT TO authenticated USING (cooperative_user_id = auth.uid() OR cooperative_user_id = public.get_cooperative_owner_for_member(auth.uid()));
CREATE POLICY "Cooperative can update expenses" ON public.cooperative_expenses FOR UPDATE TO authenticated USING (cooperative_user_id = auth.uid() OR (cooperative_user_id = public.get_cooperative_owner_for_member(auth.uid()) AND public.is_cooperative_admin(auth.uid())));
CREATE POLICY "Cooperative can delete expenses" ON public.cooperative_expenses FOR DELETE TO authenticated USING (cooperative_user_id = auth.uid() OR (cooperative_user_id = public.get_cooperative_owner_for_member(auth.uid()) AND public.is_cooperative_admin(auth.uid())));

-- cooperative_documents
DROP POLICY IF EXISTS "Cooperative can insert documents" ON public.cooperative_documents;
DROP POLICY IF EXISTS "Cooperative can view documents" ON public.cooperative_documents;
DROP POLICY IF EXISTS "Cooperative can delete documents" ON public.cooperative_documents;
CREATE POLICY "Cooperative can insert documents" ON public.cooperative_documents FOR INSERT TO authenticated WITH CHECK (cooperative_user_id = auth.uid() OR (cooperative_user_id = public.get_cooperative_owner_for_member(auth.uid()) AND public.is_cooperative_admin(auth.uid())));
CREATE POLICY "Cooperative can view documents" ON public.cooperative_documents FOR SELECT TO authenticated USING (cooperative_user_id = auth.uid() OR cooperative_user_id = public.get_cooperative_owner_for_member(auth.uid()));
CREATE POLICY "Cooperative can delete documents" ON public.cooperative_documents FOR DELETE TO authenticated USING (cooperative_user_id = auth.uid() OR (cooperative_user_id = public.get_cooperative_owner_for_member(auth.uid()) AND public.is_cooperative_admin(auth.uid())));

-- ---- marketplace_services ----
DROP POLICY IF EXISTS "Anyone authenticated can browse active services" ON public.marketplace_services;
DROP POLICY IF EXISTS "Providers can create services" ON public.marketplace_services;
DROP POLICY IF EXISTS "Providers can update own services" ON public.marketplace_services;
DROP POLICY IF EXISTS "Providers can delete own services" ON public.marketplace_services;
CREATE POLICY "Anyone authenticated can browse active services" ON public.marketplace_services FOR SELECT TO authenticated USING (is_active = true OR provider_id = auth.uid());
CREATE POLICY "Providers can create services" ON public.marketplace_services FOR INSERT TO authenticated WITH CHECK (auth.uid() = provider_id);
CREATE POLICY "Providers can update own services" ON public.marketplace_services FOR UPDATE TO authenticated USING (auth.uid() = provider_id);
CREATE POLICY "Providers can delete own services" ON public.marketplace_services FOR DELETE TO authenticated USING (auth.uid() = provider_id);

-- ---- marketplace_orders ----
DROP POLICY IF EXISTS "Clients can create orders" ON public.marketplace_orders;
DROP POLICY IF EXISTS "Users can view own orders" ON public.marketplace_orders;
DROP POLICY IF EXISTS "Users can update own orders" ON public.marketplace_orders;
CREATE POLICY "Clients can create orders" ON public.marketplace_orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Users can view own orders" ON public.marketplace_orders FOR SELECT TO authenticated USING (auth.uid() = client_id OR auth.uid() = provider_id);
CREATE POLICY "Users can update own orders" ON public.marketplace_orders FOR UPDATE TO authenticated USING (auth.uid() = client_id OR auth.uid() = provider_id);

-- ---- partner_directory ----
DROP POLICY IF EXISTS "Anyone authenticated can view partners" ON public.partner_directory;
DROP POLICY IF EXISTS "Partners can create entries" ON public.partner_directory;
DROP POLICY IF EXISTS "Partners can update own entries" ON public.partner_directory;
DROP POLICY IF EXISTS "Partners can delete own entries" ON public.partner_directory;
CREATE POLICY "Authenticated can view partners" ON public.partner_directory FOR SELECT TO authenticated USING (true);
CREATE POLICY "Partners can create entries" ON public.partner_directory FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Partners can update own entries" ON public.partner_directory FOR UPDATE TO authenticated USING (auth.uid() = created_by);
CREATE POLICY "Partners can delete own entries" ON public.partner_directory FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- ---- equipment_listings ----
DROP POLICY IF EXISTS "Anyone authenticated can browse listings" ON public.equipment_listings;
DROP POLICY IF EXISTS "Users can create listings" ON public.equipment_listings;
DROP POLICY IF EXISTS "Users can update own listings" ON public.equipment_listings;
DROP POLICY IF EXISTS "Users can delete own listings" ON public.equipment_listings;
CREATE POLICY "Anyone authenticated can browse listings" ON public.equipment_listings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create listings" ON public.equipment_listings FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own listings" ON public.equipment_listings FOR UPDATE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete own listings" ON public.equipment_listings FOR DELETE TO authenticated USING (auth.uid() = owner_id);

-- ---- equipment_bookings ----
DROP POLICY IF EXISTS "Users can create bookings" ON public.equipment_bookings;
DROP POLICY IF EXISTS "Renters can view own bookings" ON public.equipment_bookings;
DROP POLICY IF EXISTS "Renters can update own bookings" ON public.equipment_bookings;
DROP POLICY IF EXISTS "Owners can view bookings on their listings" ON public.equipment_bookings;
DROP POLICY IF EXISTS "Owners can update bookings on their listings" ON public.equipment_bookings;
CREATE POLICY "Users can create bookings" ON public.equipment_bookings FOR INSERT TO authenticated WITH CHECK (auth.uid() = renter_id);
CREATE POLICY "Renters can view own bookings" ON public.equipment_bookings FOR SELECT TO authenticated USING (auth.uid() = renter_id);
CREATE POLICY "Owners can view bookings on their listings" ON public.equipment_bookings FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM equipment_listings WHERE equipment_listings.id = equipment_bookings.listing_id AND equipment_listings.owner_id = auth.uid()));
CREATE POLICY "Renters can update own bookings" ON public.equipment_bookings FOR UPDATE TO authenticated USING (auth.uid() = renter_id);
CREATE POLICY "Owners can update bookings on their listings" ON public.equipment_bookings FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM equipment_listings WHERE equipment_listings.id = equipment_bookings.listing_id AND equipment_listings.owner_id = auth.uid()));

-- ---- equipment_reviews ----
DROP POLICY IF EXISTS "Anyone authenticated can view reviews" ON public.equipment_reviews;
DROP POLICY IF EXISTS "Reviewers can create reviews" ON public.equipment_reviews;
DROP POLICY IF EXISTS "Reviewers can update own reviews" ON public.equipment_reviews;
DROP POLICY IF EXISTS "Reviewers can delete own reviews" ON public.equipment_reviews;
CREATE POLICY "Anyone authenticated can view reviews" ON public.equipment_reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "Reviewers can create reviews" ON public.equipment_reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY "Reviewers can update own reviews" ON public.equipment_reviews FOR UPDATE TO authenticated USING (auth.uid() = reviewer_id);
CREATE POLICY "Reviewers can delete own reviews" ON public.equipment_reviews FOR DELETE TO authenticated USING (auth.uid() = reviewer_id);

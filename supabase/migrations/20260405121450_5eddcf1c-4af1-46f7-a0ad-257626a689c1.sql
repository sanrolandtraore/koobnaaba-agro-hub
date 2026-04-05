
-- FIX 1: CRITICAL - parcels INSERT policy uses get_farm_owner_from_parcel which JOINs parcels→farms
-- but on INSERT the parcel doesn't exist yet, so it ALWAYS returns null → INSERT always fails!
DROP POLICY IF EXISTS "Users can create parcels" ON public.parcels;

CREATE POLICY "Users can create parcels"
ON public.parcels
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.farms
    WHERE farms.id = parcels.farm_id
    AND farms.user_id = auth.uid()
  )
);

-- FIX 2: service_requests missing DELETE policy
DROP POLICY IF EXISTS "Users can delete own service requests" ON public.service_requests;

CREATE POLICY "Users can delete own service requests"
ON public.service_requests
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- FIX 3: service_requests missing UPDATE policy  
DROP POLICY IF EXISTS "Users can update own service requests" ON public.service_requests;

CREATE POLICY "Users can update own service requests"
ON public.service_requests
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

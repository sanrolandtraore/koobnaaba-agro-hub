import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://koobnaaba-agro-hub.vercel.app",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Vary": "Origin",
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface GeoJSONPolygon {
  type: "Polygon";
  coordinates: number[][][];
}

// Haversine-based area for a polygon in hectares
function computePolygonArea(coords: number[][]): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  let area = 0;
  const n = coords.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const lat1 = toRad(coords[i][1]);
    const lat2 = toRad(coords[j][1]);
    const dLng = toRad(coords[j][0] - coords[i][0]);
    area += dLng * (2 + Math.sin(lat1) + Math.sin(lat2));
  }
  area = Math.abs((area * R * R) / 2);
  return area / 10000;
}

function computePerimeter(coords: number[][]): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  let perimeter = 0;
  for (let i = 0; i < coords.length; i++) {
    const j = (i + 1) % coords.length;
    const dLat = toRad(coords[j][1] - coords[i][1]);
    const dLng = toRad(coords[j][0] - coords[i][0]);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(coords[i][1])) * Math.cos(toRad(coords[j][1])) * Math.sin(dLng / 2) ** 2;
    perimeter += 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
  return perimeter;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ===== Authenticate the user =====
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Non authentifié" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Non authentifié" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = user.id;

    // Service role client for data operations
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let body: any;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Corps de requête invalide" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { crop_cycle_id, parcel_id, geometry } = body;

    // ===== Ownership verification =====
    if (parcel_id) {
      if (typeof parcel_id !== "string") {
        return new Response(JSON.stringify({ error: "parcel_id invalide" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data: ownerData } = await supabase.rpc("get_farm_owner_from_parcel", { _parcel_id: parcel_id });
      if (ownerData !== userId) {
        return new Response(JSON.stringify({ error: "Accès interdit" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (crop_cycle_id) {
      if (typeof crop_cycle_id !== "string") {
        return new Response(JSON.stringify({ error: "crop_cycle_id invalide" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data: ownerData } = await supabase.rpc("get_farm_owner_from_cycle", { _cycle_id: crop_cycle_id });
      if (ownerData !== userId) {
        return new Response(JSON.stringify({ error: "Accès interdit" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // ===== 1. If geometry provided, update parcel =====
    if (parcel_id && geometry) {
      const geo = geometry as GeoJSONPolygon;
      if (geo.type === "Polygon" && geo.coordinates?.[0]?.length >= 4) {
        const coords = geo.coordinates[0];
        const calculated_area_ha = computePolygonArea(coords);
        const perimeter_m = computePerimeter(coords);

        await supabase
          .from("parcels")
          .update({
            geometry: geo,
            calculated_area_ha: Math.round(calculated_area_ha * 1000) / 1000,
            perimeter_m: Math.round(perimeter_m * 100) / 100,
            area_ha: Math.round(calculated_area_ha * 1000) / 1000,
          })
          .eq("id", parcel_id);
      }
    }

    if (!crop_cycle_id) {
      return new Response(
        JSON.stringify({ success: true, message: "Geometry updated" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ===== 2. Fetch crop cycle with related data =====
    const { data: cycle, error: cycleErr } = await supabase
      .from("crop_cycles")
      .select(
        "*, parcels(area_ha, calculated_area_ha, farms(climate_zone_id, climate_zones(climate_coefficient))), crop_references(*)"
      )
      .eq("id", crop_cycle_id)
      .single();

    if (cycleErr || !cycle) {
      return new Response(JSON.stringify({ error: "Cycle non trouvé" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parcel = cycle.parcels as any;
    const crop = cycle.crop_references as any;
    const area = parcel?.calculated_area_ha || parcel?.area_ha || 0;
    const climateCoeff =
      parcel?.farms?.climate_zones?.climate_coefficient || 1.0;

    // ===== 3. Calculate plant count =====
    let plant_count: number | null = null;
    if (crop?.plants_per_ha && area > 0) {
      plant_count = Math.round(crop.plants_per_ha * area);
    }

    // ===== 4. Yield projection with climate coefficient =====
    // Ne jamais écraser les vraies valeurs saisies par l'utilisateur :
    // on ne calcule que si le cycle n'a pas encore de rendement/revenu renseigné.
    let expected_yield_kg: number | null = cycle.expected_yield_kg ?? null;
    let expected_revenue: number | null = cycle.expected_revenue ?? null;
    if (expected_yield_kg === null && crop?.avg_yield_per_ha && area > 0) {
      expected_yield_kg = Math.round(crop.avg_yield_per_ha * area * climateCoeff);
    }
    if (expected_revenue === null && expected_yield_kg !== null && crop?.avg_price_per_kg) {
      expected_revenue = Math.round(expected_yield_kg * crop.avg_price_per_kg);
    }

    // ===== 5. Update crop cycle =====
    await supabase
      .from("crop_cycles")
      .update({
        plant_count,
        expected_yield_kg,
        expected_revenue,
        climate_coefficient: climateCoeff,
      })
      .eq("id", crop_cycle_id);

    // ===== 6. Calculate input requirements =====
    const inputReqs = crop?.input_requirements as any;
    let totalInputCost = 0;
    const inputRows: any[] = [];

    if (inputReqs && typeof inputReqs === "object") {
      const inputs = Array.isArray(inputReqs) ? inputReqs : Object.entries(inputReqs).map(([name, v]: [string, any]) => ({
        input_name: name,
        quantity_per_ha: v.qty_per_ha || v.quantity_per_ha || 0,
        unit: v.unit || "kg",
        unit_price: v.unit_price || 0,
      }));

      await supabase.from("crop_cycle_inputs").delete().eq("crop_cycle_id", crop_cycle_id);

      for (const inp of inputs) {
        const total_quantity = Math.round((inp.quantity_per_ha || 0) * area * 100) / 100;
        const total_cost = Math.round(total_quantity * (inp.unit_price || 0));
        totalInputCost += total_cost;
        inputRows.push({
          crop_cycle_id,
          input_name: inp.input_name || inp.name,
          quantity_per_ha: inp.quantity_per_ha,
          total_quantity,
          unit: inp.unit || "kg",
          unit_price: inp.unit_price || 0,
          total_cost,
        });
      }

      if (inputRows.length > 0) {
        await supabase.from("crop_cycle_inputs").insert(inputRows);
      }
    }

    // ===== 7. Build investment plan =====
    const { data: costEntries } = await supabase
      .from("cost_entries")
      .select("category, amount")
      .eq("crop_cycle_id", crop_cycle_id);

    let totalLabor = 0, totalEquipment = 0, totalTransport = 0;
    for (const ce of costEntries || []) {
      if (ce.category === "main_oeuvre") totalLabor += ce.amount;
      else if (ce.category === "equipement") totalEquipment += ce.amount;
      else if (ce.category === "transport") totalTransport += ce.amount;
      else if (ce.category === "intrant") totalInputCost += ce.amount;
    }

    const total_investment = totalInputCost + totalLabor + totalEquipment + totalTransport;
    const roi = total_investment > 0 && expected_revenue
      ? Math.round(((expected_revenue - total_investment) / total_investment) * 10000) / 100
      : 0;
    const break_even_yield_kg =
      crop?.avg_price_per_kg && crop.avg_price_per_kg > 0
        ? Math.round(total_investment / crop.avg_price_per_kg)
        : 0;

    await supabase
      .from("investment_plans")
      .upsert(
        {
          crop_cycle_id,
          total_input_cost: totalInputCost,
          total_labor_cost: totalLabor,
          total_equipment_cost: totalEquipment,
          total_transport_cost: totalTransport,
          total_investment,
          expected_revenue: expected_revenue || 0,
          expected_roi_percent: roi,
          break_even_yield_kg,
        },
        { onConflict: "crop_cycle_id" }
      );

    const result = {
      success: true,
      calculations: {
        area_ha: area,
        plant_count,
        expected_yield_kg,
        expected_revenue,
        climate_coefficient: climateCoeff,
        inputs: inputRows,
        investment: {
          total_input_cost: totalInputCost,
          total_labor_cost: totalLabor,
          total_equipment_cost: totalEquipment,
          total_transport_cost: totalTransport,
          total_investment,
          expected_roi_percent: roi,
          break_even_yield_kg,
        },
      },
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("calculate-crop-cycle error:", err);
    return new Response(JSON.stringify({ error: "Erreur serveur" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

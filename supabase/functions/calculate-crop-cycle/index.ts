import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const allowedOrigins = new Set([
  "https://koobnaaba-agro-hub.vercel.app",
  "https://koobnaaba-agro-hub.lovable.app",
]);

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin") ?? "";
  return {
    "Access-Control-Allow-Origin": allowedOrigins.has(origin) ? origin : "null",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
    "Vary": "Origin",
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  try {
    // ===== Authenticate the user =====
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Non authentifié" }), {
        status: 401,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
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
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const userId = user.id;

    // Service role client for data operations
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Méthode non autorisée" }), {
        status: 405,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json", "Allow": "POST, OPTIONS" },
      });
    }

    const contentLength = Number(req.headers.get("content-length") ?? "0");
    if (Number.isFinite(contentLength) && contentLength > 64 * 1024) {
      return new Response(JSON.stringify({ error: "Requête trop volumineuse" }), {
        status: 413,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Corps de requête invalide" }), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return new Response(JSON.stringify({ error: "Corps de requête invalide" }), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const { crop_cycle_id, parcel_id, geometry } = body as {
      crop_cycle_id?: unknown;
      parcel_id?: unknown;
      geometry?: unknown;
    };

    if (crop_cycle_id === undefined && parcel_id === undefined) {
      return new Response(JSON.stringify({ error: "crop_cycle_id ou parcel_id requis" }), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    // ===== Ownership verification =====
    if (parcel_id) {
      if (typeof parcel_id !== "string") {
        return new Response(JSON.stringify({ error: "parcel_id invalide" }), {
          status: 400,
          headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        });
      }
      const { data: ownerData } = await supabase.rpc("get_farm_owner_from_parcel", { _parcel_id: parcel_id });
      if (ownerData !== userId) {
        return new Response(JSON.stringify({ error: "Accès interdit" }), {
          status: 403,
          headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        });
      }
    }

    if (crop_cycle_id) {
      if (typeof crop_cycle_id !== "string") {
        return new Response(JSON.stringify({ error: "crop_cycle_id invalide" }), {
          status: 400,
          headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        });
      }
      const { data: ownerData } = await supabase.rpc("get_farm_owner_from_cycle", { _cycle_id: crop_cycle_id });
      if (ownerData !== userId) {
        return new Response(JSON.stringify({ error: "Accès interdit" }), {
          status: 403,
          headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        });
      }
    }

    // ===== 1. If geometry provided, update parcel =====
    if (parcel_id && geometry) {
      const geo = geometry as GeoJSONPolygon;
      if (
        geo.type === "Polygon" &&
        Array.isArray(geo.coordinates) &&
        Array.isArray(geo.coordinates[0]) &&
        geo.coordinates[0].length >= 4 &&
        geo.coordinates[0].every((point: unknown) =>
          Array.isArray(point) &&
          point.length >= 2 &&
          Number.isFinite(Number(point[0])) &&
          Number.isFinite(Number(point[1]))
        )
      ) {
        const coords = geo.coordinates[0];
        const calculated_area_ha = computePolygonArea(coords);
        const perimeter_m = computePerimeter(coords);

        const { error: parcelUpdateError } = await supabase
          .from("parcels")
          .update({
            geometry: geo,
            calculated_area_ha: Math.round(calculated_area_ha * 1000) / 1000,
            perimeter_m: Math.round(perimeter_m * 100) / 100,
            area_ha: Math.round(calculated_area_ha * 1000) / 1000,
          })
          .eq("id", parcel_id);

        if (parcelUpdateError) {
          console.error("parcel update failed:", parcelUpdateError.message);
          throw new Error("Impossible de mettre à jour la parcelle");
        }
      } else {
        return new Response(JSON.stringify({ error: "Géométrie Polygon invalide" }), {
          status: 400,
          headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        });
      }
    }

    if (!crop_cycle_id) {
      return new Response(
        JSON.stringify({ success: true, message: "Geometry updated" }),
        { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
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
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
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
    const { error: cycleUpdateError } = await supabase
      .from("crop_cycles")
      .update({
        plant_count,
        expected_yield_kg,
        expected_revenue,
        climate_coefficient: climateCoeff,
      })
      .eq("id", crop_cycle_id);

    if (cycleUpdateError) {
      console.error("crop cycle update failed:", cycleUpdateError.message);
      throw new Error("Impossible de mettre à jour le cycle cultural");
    }

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

      const { error: inputDeleteError } = await supabase
        .from("crop_cycle_inputs")
        .delete()
        .eq("crop_cycle_id", crop_cycle_id);
      if (inputDeleteError) {
        console.error("crop cycle inputs cleanup failed:", inputDeleteError.message);
        throw new Error("Impossible de recalculer les intrants");
      }

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
        const { error: inputInsertError } = await supabase
          .from("crop_cycle_inputs")
          .insert(inputRows);
        if (inputInsertError) {
          console.error("crop cycle inputs insert failed:", inputInsertError.message);
          throw new Error("Impossible d'enregistrer les intrants");
        }
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

    const { error: investmentError } = await supabase
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

    if (investmentError) {
      console.error("investment plan upsert failed:", investmentError.message);
      throw new Error("Impossible d'enregistrer le plan d'investissement");
    }

    const result = {
      success: true,
      calculations: {
        area_ha: area,
        plant_count,
        expected_yield_kg,
        expected_revenue,
        climate_coefficient: climateCoeff,
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
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("calculate-crop-cycle error:", err);
    return new Response(JSON.stringify({ error: "Erreur serveur" }), {
      status: 500,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});

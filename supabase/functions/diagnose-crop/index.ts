import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin") || "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

Deno.serve(async (req) => {
  const cors = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  try {
    const auth = req.headers.get("Authorization") ?? "";
    if (!auth.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: auth } } });
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const body = await req.json();
    const { imageBase64, mimeType, cropKey, symptoms } = body ?? {};

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.warn("LOVABLE_API_KEY non configurée, retour signal fallback");
      return new Response(JSON.stringify({
        error: "AI_GATEWAY_NOT_CONFIGURED",
        fallback_required: true,
      }), {
        status: 200,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `Tu es un expert agronome senior de référence pour l'INERA (Institut de l'Environnement et de Recherches Agricoles du Burkina Faso) et le Comité Sahélien des Pesticides (CSP-CILSS). Tu analyses avec haute précision les cultures d'Afrique de l'Ouest (mil, sorgho, maïs, niébé, arachide, riz de bas-fond et pluvial, coton, sésame, manioc, igname, oignon, tomate, mangue, agrumes).
À partir d'une photo et/ou des symptômes décrits, identifie la cause exacte (maladie fongique/bactérienne/virale, ravageur entomologique, carence N-P-K ou stress abiotique).
Propose :
1. Un protocole biologique traditionnel ou agro-écologique validé INERA (ex: extrait de neem Azadirachta indica 50g/L, cendre tamisée, Tithonia diversifolia, savon noir, rotation culturale, zaï).
2. Un protocole chimique homologué CSP/CEDEAO avec matières actives autorisées au Sahel, dosages et Délais Avant Récolte (DAR).
3. Les mesures préventives et variétés certifiées INERA résistantes.
Réponds exclusivement en français.`;

    const userContent: any[] = [
      { type: "text", text: `Culture: ${cropKey ?? "non précisée"}\nSymptômes décrits: ${symptoms ?? "voir image"}\n\nDonne ton diagnostic agronomique complet.` },
    ];
    if (imageBase64) {
      userContent.push({ type: "image_url", image_url: { url: `data:${mimeType ?? "image/jpeg"};base64,${imageBase64}` } });
    }

    const tools = [{
      type: "function",
      function: {
        name: "submit_diagnosis",
        description: "Retourne un diagnostic agronomique structuré conforme aux normes INERA et CSP.",
        parameters: {
          type: "object",
          properties: {
            diagnosis_summary: { type: "string", description: "Diagnostic principal en 1-2 phrases" },
            cause_type: { type: "string", enum: ["maladie", "ravageur", "carence", "stress_hydrique", "stress_thermique", "autre"] },
            cause_name: { type: "string" },
            confidence: { type: "number", minimum: 0, maximum: 1 },
            severity: { type: "string", enum: ["faible", "moyen", "forte"] },
            treatment_bio: { type: "string", description: "Protocole biologique avec dosage" },
            treatment_chemical: { type: "string", description: "Protocole chimique homologué CSP avec dosage et délai avant récolte (DAR)" },
            preventive_actions: { type: "array", items: { type: "string" } },
          },
          required: ["diagnosis_summary", "cause_type", "cause_name", "confidence", "severity", "treatment_bio", "treatment_chemical", "preventive_actions"],
          additionalProperties: false,
        },
      },
    }];

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        tools,
        tool_choice: { type: "function", function: { name: "submit_diagnosis" } },
      }),
    });

    if (!aiResp.ok) {
      const txt = await aiResp.text();
      console.error("AI gateway error", aiResp.status, txt);
      return new Response(JSON.stringify({
        error: "AI_GATEWAY_ERROR",
        status: aiResp.status,
        fallback_required: true,
      }), {
        status: 200,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const aiJson = await aiResp.json();
    const toolCall = aiJson.choices?.[0]?.message?.tool_calls?.[0];
    const args = toolCall?.function?.arguments ? JSON.parse(toolCall.function.arguments) : null;
    if (!args) {
      return new Response(JSON.stringify({ fallback_required: true }), {
        status: 200,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, diagnosis: args }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("diagnose-crop error", e);
    return new Response(JSON.stringify({ fallback_required: true, error: (e as Error).message }), {
      status: 200,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});

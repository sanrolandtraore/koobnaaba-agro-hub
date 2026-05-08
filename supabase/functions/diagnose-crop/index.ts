import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization") ?? "";
    if (!auth.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: auth } } });
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const body = await req.json();
    const { imageBase64, mimeType, cropKey, symptoms } = body ?? {};

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `Tu es un expert agronome spécialisé dans les cultures d'Afrique de l'Ouest (mil, sorgho, maïs, niébé, arachide, riz, coton, sésame, manioc, igname, oignon, tomate). À partir d'une photo de plante et/ou de symptômes décrits, tu identifies la cause la plus probable (maladie, ravageur, ou carence nutritionnelle) et proposes un traitement bio ET un traitement chimique adapté au contexte ouest-africain (produits homologués CEDEAO si possible). Réponds en français.`;

    const userContent: any[] = [
      { type: "text", text: `Culture: ${cropKey ?? "non précisée"}\nSymptômes décrits: ${symptoms ?? "voir image"}\n\nDonne ton diagnostic.` },
    ];
    if (imageBase64) {
      userContent.push({ type: "image_url", image_url: { url: `data:${mimeType ?? "image/jpeg"};base64,${imageBase64}` } });
    }

    const tools = [{
      type: "function",
      function: {
        name: "submit_diagnosis",
        description: "Retourne un diagnostic agronomique structuré.",
        parameters: {
          type: "object",
          properties: {
            diagnosis_summary: { type: "string", description: "Diagnostic principal en 1-2 phrases" },
            cause_type: { type: "string", enum: ["maladie", "ravageur", "carence", "stress_hydrique", "stress_thermique", "autre"] },
            cause_name: { type: "string" },
            confidence: { type: "number", minimum: 0, maximum: 1 },
            severity: { type: "string", enum: ["faible", "moyenne", "forte"] },
            treatment_bio: { type: "string", description: "Traitement biologique avec dosage" },
            treatment_chemical: { type: "string", description: "Traitement chimique homologué avec dosage et délai avant récolte" },
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
      if (aiResp.status === 429) return new Response(JSON.stringify({ error: "Limite de requêtes atteinte, réessayez dans un instant." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (aiResp.status === 402) return new Response(JSON.stringify({ error: "Crédits IA épuisés. Veuillez recharger votre espace." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error("AI gateway failure");
    }

    const aiJson = await aiResp.json();
    const toolCall = aiJson.choices?.[0]?.message?.tool_calls?.[0];
    const args = toolCall?.function?.arguments ? JSON.parse(toolCall.function.arguments) : null;
    if (!args) throw new Error("Réponse IA invalide");

    return new Response(JSON.stringify({ success: true, diagnosis: args }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("diagnose-crop error", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

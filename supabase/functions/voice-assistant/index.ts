import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transcript, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `Tu es un assistant vocal agricole pour la plateforme KoobNaaba. Tu aides les agriculteurs et éleveurs à utiliser la plateforme par la voix.

Tu dois analyser le message vocal transcrit de l'utilisateur et déterminer son intention parmi:
1. "service_request" - Demande de service technique (diagnostic sol, maladie, irrigation, formation, etc.)
2. "equipment_rental" - Location de matériel agricole (tracteur, motoculteur, etc.)
3. "general_help" - Question générale ou aide à la navigation

Pour chaque intention, extrais les informations pertinentes.

Types de services disponibles:
- diagnostic_sol: Diagnostic sol et aménagement
- diagnostic_maladie: Diagnostic maladie et traitement
- irrigation: Installation système d'irrigation
- ferme_agricole: Mise en place ferme agricole
- etang_piscicole: Mise en place d'étangs piscicoles
- ferme_volaille: Mise en place ferme volaille
- suivi_exploitation: Planification et suivi d'exploitation
- cartographie_gps: Mesure et cartographie GPS
- formation: Formations et conseils

Types d'équipement pour location:
- tracteur, motoculteur, semoir, pulvérisateur, moissonneuse, remorque, charrue, décortiqueuse

Contexte actuel de l'utilisateur: ${context || "page principale"}

Réponds TOUJOURS en français simple et accessible. Sois chaleureux et patient.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: transcript },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "process_voice_intent",
              description: "Process user voice intent and extract structured data",
              parameters: {
                type: "object",
                properties: {
                  intent: {
                    type: "string",
                    enum: ["service_request", "equipment_rental", "general_help"],
                    description: "The detected user intent",
                  },
                  response_message: {
                    type: "string",
                    description: "Friendly response message to read back to user in simple French",
                  },
                  service_data: {
                    type: "object",
                    description: "Data for service request (if intent is service_request)",
                    properties: {
                      service_type: { type: "string" },
                      description: { type: "string" },
                      location: { type: "string" },
                      preferred_date: { type: "string" },
                      phone: { type: "string" },
                    },
                  },
                  equipment_data: {
                    type: "object",
                    description: "Data for equipment rental (if intent is equipment_rental)",
                    properties: {
                      equipment_type: { type: "string" },
                      search_query: { type: "string" },
                      start_date: { type: "string" },
                      end_date: { type: "string" },
                      location: { type: "string" },
                    },
                  },
                  navigation: {
                    type: "string",
                    description: "Suggested page to navigate to, if applicable",
                    enum: ["services", "equipment", "dashboard", "farms", "parcels", "animals", "none"],
                  },
                },
                required: ["intent", "response_message"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "process_voice_intent" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Trop de requêtes, réessayez dans un moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crédit épuisé." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erreur du service IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      return new Response(JSON.stringify({
        intent: "general_help",
        response_message: "Je n'ai pas bien compris. Pouvez-vous répéter s'il vous plaît ?",
        navigation: "none",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("voice-assistant error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erreur inconnue" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { identifier, new_password, full_name } = await req.json();

    if (!identifier || !new_password || !full_name) {
      return new Response(
        JSON.stringify({ error: "Identifiant, nom complet et nouveau mot de passe requis" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (new_password.length < 6) {
      return new Response(
        JSON.stringify({ error: "Le mot de passe doit contenir au moins 6 caractères" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Determine if identifier is phone or email
    const isEmail = identifier.includes("@");

    let userId: string | null = null;

    if (isEmail) {
      // Look up by real email in profiles
      const { data: profiles } = await supabaseAdmin
        .from("profiles")
        .select("user_id, full_name")
        .eq("email", identifier.trim());

      if (profiles && profiles.length > 0) {
        // Match by full_name for security
        const match = profiles.find(
          (p) => p.full_name.toLowerCase().trim() === full_name.toLowerCase().trim()
        );
        if (match) userId = match.user_id;
      }
    } else {
      // Look up by phone in profiles
      const cleaned = identifier.replace(/[^0-9+]/g, "");
      const { data: profiles } = await supabaseAdmin
        .from("profiles")
        .select("user_id, full_name")
        .eq("phone", cleaned);

      if (profiles && profiles.length > 0) {
        const match = profiles.find(
          (p) => p.full_name.toLowerCase().trim() === full_name.toLowerCase().trim()
        );
        if (match) userId = match.user_id;
      }
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Aucun compte trouvé avec ces informations. Vérifiez votre identifiant et votre nom complet." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update password via admin API
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: new_password,
    });

    if (error) {
      return new Response(
        JSON.stringify({ error: "Erreur lors de la réinitialisation: " + error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ message: "Mot de passe réinitialisé avec succès" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Erreur serveur" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

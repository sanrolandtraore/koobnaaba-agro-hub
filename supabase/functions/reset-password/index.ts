import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// In-memory rate limiter (per edge function instance)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 3; // max 3 attempts per hour
const RATE_WINDOW_MS = 60 * 60 * 1000;

function isRateLimited(identifier: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Corps de requête invalide" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { identifier, new_password, full_name } = body;

    if (!identifier || typeof identifier !== "string" ||
        !new_password || typeof new_password !== "string" ||
        !full_name || typeof full_name !== "string") {
      return new Response(
        JSON.stringify({ error: "Identifiant, nom complet et nouveau mot de passe requis" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Rate limiting by IP + identifier
    const clientIp = req.headers.get("x-forwarded-for") || "unknown";
    const rateLimitKey = `${clientIp}:${identifier.trim().toLowerCase()}`;
    if (isRateLimited(rateLimitKey)) {
      return new Response(
        JSON.stringify({ error: "Trop de tentatives. Réessayez dans une heure." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (new_password.length < 8) {
      return new Response(
        JSON.stringify({ error: "Le mot de passe doit contenir au moins 8 caractères" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Basic password strength check
    const hasLetter = /[a-zA-Z]/.test(new_password);
    const hasNumber = /[0-9]/.test(new_password);
    if (!hasLetter || !hasNumber) {
      return new Response(
        JSON.stringify({ error: "Le mot de passe doit contenir des lettres et des chiffres" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Phone-only identifier
    const cleaned = identifier.replace(/[^0-9+]/g, "");
    if (cleaned.length < 8) {
      return new Response(
        JSON.stringify({ error: "Numéro de téléphone invalide" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    let userId: string | null = null;
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("user_id, full_name")
      .eq("phone", cleaned)
      .limit(5);

    if (profiles && profiles.length > 0) {
      const match = profiles.find(
        (p: any) => p.full_name.toLowerCase().trim() === full_name.toLowerCase().trim()
      );
      if (match) userId = match.user_id;
    }

    // Audit log (always, regardless of outcome)
    await supabaseAdmin.from("audit_log").insert({
      action: "password_reset_attempt",
      table_name: "auth.users",
      record_id: userId || null,
      new_data: {
        identifier_type: isEmail ? "email" : "phone",
        identifier_hint: isEmail ? identifier.slice(0, 3) + "***" : "***" + identifier.slice(-4),
        success: !!userId,
      },
    });

    // Add artificial delay to prevent timing attacks
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Aucun compte trouvé avec ces informations. Vérifiez votre identifiant et votre nom complet." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: new_password,
    });

    if (error) {
      console.error("Password reset error:", error.message);
      return new Response(
        JSON.stringify({ error: "Erreur lors de la réinitialisation du mot de passe." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ message: "Mot de passe réinitialisé avec succès" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("reset-password error:", err);
    return new Response(
      JSON.stringify({ error: "Erreur serveur" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

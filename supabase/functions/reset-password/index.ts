import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return json({ error: "Corps de requête invalide" }, 400);
    }

    const { step, identifier, new_password, code, role } = body;
    const action = step === "verify" ? "verify" : "request";

    if (!identifier || typeof identifier !== "string") {
      return json({ error: "Numéro de téléphone requis" }, 400);
    }

    const cleaned = identifier.replace(/[^0-9+]/g, "");
    if (cleaned.length < 8) {
      return json({ error: "Numéro de téléphone invalide" }, 400);
    }

    const clientIp = req.headers.get("x-forwarded-for") || "unknown";
    if (isRateLimited(`${clientIp}:${cleaned}`)) {
      return json({ error: "Trop de tentatives. Réessayez dans une heure." }, 429);
    }

    const ALLOWED = ["agriculteur", "eleveur", "partenaire", "agent_technique", "formation"];
    const scopedRole = typeof role === "string" && ALLOWED.includes(role) ? role : null;

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Resolve the account tied to this phone number (never disclosed to the caller)
    let userId: string | null = null;
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("user_id")
      .eq("phone", cleaned)
      .limit(20);

    if (profiles && profiles.length > 0) {
      const ids = profiles.map((p: any) => p.user_id);
      if (scopedRole) {
        const { data: roleRows } = await supabaseAdmin
          .from("user_roles")
          .select("user_id")
          .in("user_id", ids)
          .eq("role", scopedRole)
          .limit(1);
        if (roleRows && roleRows.length > 0) userId = roleRows[0].user_id;
      } else if (ids.length === 1) {
        userId = ids[0];
      }
    }

    // Constant-ish response delay
    const delay = () => new Promise((r) => setTimeout(r, 400 + Math.random() * 600));

    if (action === "request") {
      if (userId) {
        const otpBytes = new Uint32Array(1);
        crypto.getRandomValues(otpBytes);
        const otp = String(100000 + (otpBytes[0] % 900000));
        const codeHash = await sha256(`${cleaned}:${otp}`);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

        // Invalidate previous pending codes
        await supabaseAdmin
          .from("password_reset_codes")
          .update({ consumed_at: new Date().toISOString() })
          .eq("phone", cleaned)
          .is("consumed_at", null);

        await supabaseAdmin.from("password_reset_codes").insert({
          phone: cleaned,
          user_id: userId,
          code_hash: codeHash,
          expires_at: expiresAt,
        });

        const sent = await sendSms(cleaned, `KoobNaaba : votre code de vérification est ${otp}. Valable 10 minutes.`);

        await supabaseAdmin.from("audit_log").insert({
          action: "password_reset_code_requested",
          table_name: "auth.users",
          record_id: userId,
          new_data: { identifier_hint: "***" + cleaned.slice(-4), delivered: sent },
        });

        if (!sent) {
          console.error("No SMS provider configured; reset code could not be delivered");
          return json({ error: "L'envoi du code de vérification est indisponible. Contactez le support." }, 503);
        }
      }

      await delay();
      // Same answer whether or not the account exists
      return json({ message: "Si un compte existe pour ce numéro, un code de vérification a été envoyé par SMS." });
    }

    // === verify step ===
    if (!code || typeof code !== "string" || !/^\d{6}$/.test(code.trim())) {
      return json({ error: "Code de vérification invalide" }, 400);
    }
    if (!new_password || typeof new_password !== "string" || new_password.length < 8) {
      return json({ error: "Le mot de passe doit contenir au moins 8 caractères" }, 400);
    }
    if (!/[a-zA-Z]/.test(new_password) || !/[0-9]/.test(new_password)) {
      return json({ error: "Le mot de passe doit contenir des lettres et des chiffres" }, 400);
    }

    const codeHash = await sha256(`${cleaned}:${code.trim()}`);
    const { data: rows } = await supabaseAdmin
      .from("password_reset_codes")
      .select("id, user_id, attempts, expires_at")
      .eq("phone", cleaned)
      .is("consumed_at", null)
      .order("created_at", { ascending: false })
      .limit(1);

    const pending = rows && rows.length > 0 ? rows[0] : null;
    if (!pending || !userId || pending.user_id !== userId) {
      await delay();
      return json({ error: "Code de vérification invalide ou expiré" }, 400);
    }
    if (new Date(pending.expires_at).getTime() < Date.now() || pending.attempts >= 5) {
      await supabaseAdmin
        .from("password_reset_codes")
        .update({ consumed_at: new Date().toISOString() })
        .eq("id", pending.id);
      await delay();
      return json({ error: "Code de vérification invalide ou expiré" }, 400);
    }

    const { data: match } = await supabaseAdmin
      .from("password_reset_codes")
      .select("id")
      .eq("id", pending.id)
      .eq("code_hash", codeHash)
      .maybeSingle();

    if (!match) {
      await supabaseAdmin
        .from("password_reset_codes")
        .update({ attempts: pending.attempts + 1 })
        .eq("id", pending.id);
      await delay();
      return json({ error: "Code de vérification invalide ou expiré" }, 400);
    }

    await supabaseAdmin
      .from("password_reset_codes")
      .update({ consumed_at: new Date().toISOString() })
      .eq("id", pending.id);

    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: new_password,
    });

    await supabaseAdmin.from("audit_log").insert({
      action: "password_reset_completed",
      table_name: "auth.users",
      record_id: userId,
      new_data: { identifier_hint: "***" + cleaned.slice(-4), success: !error },
    });

    if (error) {
      console.error("Password reset error:", error.message);
      return json({ error: "Erreur lors de la réinitialisation du mot de passe." }, 500);
    }

    return json({ message: "Mot de passe réinitialisé avec succès" });
  } catch (err) {
    console.error("reset-password error:", err);
    return json({ error: "Erreur serveur" }, 500);
  }
});

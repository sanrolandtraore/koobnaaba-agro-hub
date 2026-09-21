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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Méthode non autorisée' }), {
      status: 405,
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json', 'Allow': 'POST, OPTIONS' },
    });
  }

  const contentLength = Number(req.headers.get('content-length') ?? '0');
  if (Number.isFinite(contentLength) && contentLength > 8 * 1024) {
    return new Response(JSON.stringify({ error: 'Requête trop volumineuse' }), {
      status: 413,
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Non autorisé' }), {
        status: 401,
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Non autorisé' }), {
        status: 401,
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      });
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // All database deletes execute inside one PostgreSQL transaction.
    // The RPC is executable only by service_role and receives the authenticated user's id.
    const { error: cleanupError } = await adminClient.rpc('delete_user_account_data', {
      target_user_id: user.id,
    });
    if (cleanupError) {
      console.error("account data cleanup failed:", cleanupError.message);
      throw new Error("Impossible de supprimer les données du compte");
    }

    // Delete avatar from storage. Database cleanup has already committed atomically.
    const { data: avatarFiles, error: avatarListError } = await adminClient.storage.from('avatars').list(user.id);
    if (avatarListError) {
      console.error("avatar listing failed:", avatarListError.message);
    } else if (avatarFiles?.length) {
      const { error: avatarRemoveError } = await adminClient.storage
        .from('avatars')
        .remove(avatarFiles.map(f => user.id + '/' + f.name));
      if (avatarRemoveError) {
        console.error("avatar cleanup failed:", avatarRemoveError.message);
      }
    }

    // Finally delete the auth user
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);
    if (deleteError) throw deleteError;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error("delete-account error:", error);
    return new Response(
      JSON.stringify({ error: "Erreur lors de la suppression du compte" }),
      { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing authorization header');

    // Create client with user's token to verify identity
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) throw new Error('Unauthorized');

    // Use service role to delete user data and auth account
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Delete user's data from all tables (cascading via foreign keys handles most)
    await adminClient.from('user_subscriptions').delete().eq('user_id', user.id);
    await adminClient.from('user_roles').delete().eq('user_id', user.id);
    await adminClient.from('profiles').delete().eq('user_id', user.id);

    // Delete farms and all related data (cascading)
    const { data: farms } = await adminClient.from('farms').select('id').eq('user_id', user.id);
    if (farms?.length) {
      for (const farm of farms) {
        await adminClient.from('animals').delete().eq('farm_id', farm.id);
        await adminClient.from('animal_feedings').delete().eq('farm_id', farm.id);
        await adminClient.from('livestock_expenses').delete().eq('farm_id', farm.id);
        await adminClient.from('livestock_sales').delete().eq('farm_id', farm.id);
        await adminClient.from('feed_stocks').delete().eq('farm_id', farm.id);
        await adminClient.from('equipment').delete().eq('farm_id', farm.id);
        await adminClient.from('workers').delete().eq('farm_id', farm.id);
        await adminClient.from('parcels').delete().eq('farm_id', farm.id);
      }
      await adminClient.from('farms').delete().eq('user_id', user.id);
    }

    // Delete cooperative data
    await adminClient.from('cooperative_collectes').delete().eq('cooperative_user_id', user.id);
    await adminClient.from('cooperative_distributions').delete().eq('cooperative_user_id', user.id);
    await adminClient.from('cooperative_sales').delete().eq('cooperative_user_id', user.id);
    await adminClient.from('cooperative_members').delete().eq('cooperative_user_id', user.id);
    await adminClient.from('cooperative_cotisations').delete().eq('cooperative_user_id', user.id);
    await adminClient.from('cooperative_parcels').delete().eq('cooperative_user_id', user.id);
    await adminClient.from('cooperative_equipment_schedule').delete().eq('cooperative_user_id', user.id);
    await adminClient.from('cooperative_expenses').delete().eq('cooperative_user_id', user.id);
    await adminClient.from('cooperative_documents').delete().eq('cooperative_user_id', user.id);
    await adminClient.from('cooperative_profiles').delete().eq('cooperative_user_id', user.id);

    // Delete service requests
    await adminClient.from('service_requests').delete().eq('user_id', user.id);

    // Delete avatar from storage
    const { data: avatarFiles } = await adminClient.storage.from('avatars').list(user.id);
    if (avatarFiles?.length) {
      await adminClient.storage.from('avatars').remove(avatarFiles.map(f => `${user.id}/${f.name}`));
    }

    // Finally delete the auth user
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);
    if (deleteError) throw deleteError;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

import 'https://deno.land/x/xhr@0.1.0/mod.ts'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { logAuditEvent } from '../_shared/audit.ts'

async function getSupabaseAdminClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
}

// Helper to check for admin privileges on a team
const isTeamAdmin = async (supabase: SupabaseClient, team_id: string, user_id: string): Promise<boolean> => {
    const { data, error } = await supabase.rpc('is_team_admin', { _team_id: team_id, _user_id: user_id });
    if (error) {
        console.error('Error in is_team_admin:', error);
        return false;
    }
    return data;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabaseAdmin = await getSupabaseAdminClient();
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  const { team_id, email, user_id, role } = await req.json();

  if (!await isTeamAdmin(supabase, team_id, user.id)) {
    return new Response(JSON.stringify({ error: 'Forbidden: Not a team admin.' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  try {
    if (req.method === 'POST') { // Add new member
      const { data: invitedUser, error: userError } = await supabaseAdmin.from('users').select('id').eq('email', email).single();
      if (userError || !invitedUser) {
        return new Response(JSON.stringify({ error: 'User not found.' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      
      const { data, error } = await supabaseAdmin.from('team_members').insert({ team_id, user_id: invitedUser.id, role }).select();
      if (error) throw error;
      
      await logAuditEvent(
        supabaseAdmin,
        req,
        'team_member_add',
        { team_id: team_id, user_id: invitedUser.id },
        { added_user_email: email, role: role }
      );

      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (req.method === 'PATCH') { // Update member role
      const { data, error } = await supabaseAdmin.from('team_members').update({ role }).match({ team_id, user_id }).select();
      if (error) throw error;

      await logAuditEvent(
        supabaseAdmin,
        req,
        'team_member_update_role',
        { team_id: team_id, user_id: user_id },
        { new_role: role }
      );

      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    
    if (req.method === 'DELETE') { // Remove member
      const { error } = await supabaseAdmin.from('team_members').delete().match({ team_id, user_id });
      if (error) throw error;

      await logAuditEvent(
        supabaseAdmin,
        req,
        'team_member_remove',
        { team_id: team_id, user_id: user_id }
      );

      return new Response(null, { status: 204, headers: corsHeaders });
    }
    
    if (req.method === 'GET') { // List members
        const { data: teamMembers, error } = await supabaseAdmin
          .from('team_members')
          .select('*, user_profile:users(email, raw_user_meta_data->full_name)')
          .eq('team_id', team_id);

        if (error) throw error;
        
        // This is a workaround because Supabase returns profiles as an array.
        // We'll flatten it.
        const formattedMembers = teamMembers.map(m => ({
            ...m,
            user_profile: {
                // @ts-ignore
                email: m.user_profile.email,
                // @ts-ignore
                full_name: m.user_profile.raw_user_meta_data.full_name,
            }
        }))
        
        return new Response(JSON.stringify(formattedMembers), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error in manage-team-members:', error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

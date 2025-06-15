import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { logAuditEvent } from '../_shared/audit.ts'

// This admin client is required to look up users by email.
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // All methods will read from the request body.
    const body = await req.json();

    switch (req.method) {
      case 'GET': {
        const { project_id } = body;
        if (!project_id) {
          throw new Error('project_id is required in the request body.');
        }

        const { data: members, error: membersError } = await supabaseClient
          .from('project_members')
          .select('id, project_id, user_id, role, created_at')
          .eq('project_id', project_id);

        if (membersError) throw membersError;

        const userIds = members.map(m => m.user_id);
        const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
        if(usersError) throw usersError;

        const userMap = new Map(users.map(u => [u.id, { email: u.email, full_name: u.user_metadata?.full_name }]));
        
        const responseData = members.map(member => ({
          ...member,
          user_profile: userMap.get(member.user_id) || { email: 'Unknown User', full_name: 'Unknown User' }
        }));
        
        return new Response(JSON.stringify(responseData), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }
      
      case 'POST': {
        const { project_id, email, role } = body;
        if (!project_id || !email || !role) {
          throw new Error('project_id, email, and role are required.');
        }

        // NOTE: This is inefficient. A better solution would be a dedicated profiles table or RPC.
        const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers();
        if (userError) throw userError;

        const targetUser = users.find(u => u.email === email);
        if (!targetUser) {
          return new Response(JSON.stringify({ error: `User with email ${email} not found.` }), {
            status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        const { data, error } = await supabaseClient
          .from('project_members')
          .insert({ project_id, user_id: targetUser.id, role })
          .select().single();
          
        if (error) {
          if (error.code === '23505') {
            return new Response(JSON.stringify({ error: 'User is already a member.' }), { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
          }
          throw error;
        }

        await logAuditEvent(
          supabaseAdmin,
          req,
          'project_member_add',
          { project_id: project_id, user_id: targetUser.id },
          { added_user_email: email, role: role }
        );

        return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 201 });
      }

      case 'PATCH': {
         const { project_id, user_id, role } = body;
         if (!project_id || !user_id || !role) {
           throw new Error('project_id, user_id, and role are required.');
         }
         
         const { data, error } = await supabaseClient.from('project_members').update({ role }).eq('project_id', project_id).eq('user_id', user_id).select().single();
         if (error) throw error;

         await logAuditEvent(
            supabaseAdmin,
            req,
            'project_member_update_role',
            { project_id: project_id, user_id: user_id },
            { new_role: role }
         );

         return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
      }

      case 'DELETE': {
        const { project_id, user_id } = body;
        if (!project_id || !user_id) {
          throw new Error('project_id and user_id are required.');
        }
        
        const { error } = await supabaseClient.from('project_members').delete().eq('project_id', project_id).eq('user_id', user_id);
        if (error) throw error;

        await logAuditEvent(
          supabaseAdmin,
          req,
          'project_member_remove',
          { project_id: project_id, user_id: user_id }
        );
        
        return new Response(JSON.stringify({ message: 'Member removed' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
      }

      default:
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});

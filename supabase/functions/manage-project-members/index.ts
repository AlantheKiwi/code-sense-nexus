
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the user's authorization
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Check if the user is authenticated
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Route request based on HTTP method
    switch (req.method) {
      case 'GET': { // List members
        const url = new URL(req.url);
        const project_id = url.searchParams.get('project_id');
        if (!project_id) {
          throw new Error('project_id is required as a query parameter.');
        }
        
        const { data, error } = await supabaseClient
          .from('project_members')
          .select('*, user_profile:profiles(email, full_name)') // Assuming you have a profiles table
          .eq('project_id', project_id);
       
        if (error) throw error;
       
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }
      
      case 'POST': { // Add member
        const { project_id, user_id, role } = await req.json();
        if (!project_id || !user_id || !role) {
          throw new Error('project_id, user_id, and role are required.');
        }
        
        const { data, error } = await supabaseClient
          .from('project_members')
          .insert({ project_id, user_id, role })
          .select()
          .single();
          
        if (error) throw error;
        
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 201,
        });
      }

      case 'PATCH': { // Update member role
         const { project_id, user_id, role } = await req.json();
         if (!project_id || !user_id || !role) {
           throw new Error('project_id, user_id, and role are required.');
         }
         
         const { data, error } = await supabaseClient
          .from('project_members')
          .update({ role })
          .eq('project_id', project_id)
          .eq('user_id', user_id)
          .select()
          .single();
          
         if (error) throw error;
         
         return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }

      case 'DELETE': { // Remove member
        const { project_id, user_id } = await req.json();
        if (!project_id || !user_id) {
          throw new Error('project_id and user_id are required.');
        }
        
        const { error } = await supabaseClient
          .from('project_members')
          .delete()
          .eq('project_id', project_id)
          .eq('user_id', user_id);
        
        if (error) throw error;
        
        return new Response(JSON.stringify({ message: 'Member removed successfully' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});

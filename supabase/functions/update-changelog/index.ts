
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { partner_id, version, changes } = await req.json();
    console.log(`Received request to update changelog for partner ${partner_id} with version ${version}`);

    // Placeholder: This would connect to Supabase and create a new entry
    // in the api_changelog table.
    
    return new Response(JSON.stringify({ 
      message: `Changelog version ${version} has been updated for partner ${partner_id}.`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 201, // Created
    });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

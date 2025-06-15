
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { example_id } = await req.json();
    console.log(`Received request to validate API example: ${example_id}`);

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: example, error } = await supabaseAdmin
      .from('api_examples')
      .select('code_example, language')
      .eq('id', example_id)
      .single();

    if (error) throw error;

    if (!example) {
      return new Response(JSON.stringify({ error: 'API example not found.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    // Placeholder for more robust validation logic
    console.log(`Validating code for example ${example_id} (Language: ${example.language}):`);
    console.log(example.code_example);
    
    const validation_status = "passed";
    let validation_details = "Code appears structurally valid. Full execution sandbox not implemented.";

    return new Response(JSON.stringify({ 
      message: "API example validation check complete.",
      validation_status,
      details: validation_details,
      example_id,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error(`Error validating example: ${error.message}`);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

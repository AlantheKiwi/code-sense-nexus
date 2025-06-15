
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { model_type } = await req.json();
    console.log(`Received training request for model: ${model_type}`);

    // Placeholder: This would trigger a long-running training job,
    // possibly in a separate, more powerful compute environment.
    
    return new Response(JSON.stringify({ 
      message: `Training job for model '${model_type}' has been queued.`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 202, // Accepted
    });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

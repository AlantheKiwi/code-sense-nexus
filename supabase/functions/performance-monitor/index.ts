
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error("Missing Authorization header.");

    const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: authHeader } } }
    )
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("User not found");

    const { data: partnerData, error: rpcError } = await supabase.rpc('get_my_partner_id')
    if (rpcError || !partnerData) throw new Error(`Could not get partner_id for user ${user.id}: ${rpcError?.message || 'No partner found'}`);
    const partner_id = partnerData;

    const { endpoint, statusCode, responseTimeMs } = await req.json();
    if (!endpoint || !statusCode || !responseTimeMs) {
        throw new Error("Missing required fields: endpoint, statusCode, responseTimeMs");
    }
    
    const ipAddress = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim()

    const { error } = await supabaseAdmin.from('api_usage_logs').insert({
        partner_id,
        user_id: user.id,
        endpoint,
        status_code: statusCode,
        response_time_ms: responseTimeMs,
        ip_address: ipAddress,
    });

    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (e) {
    console.error('Error in performance-monitor function:', e.message);
    return new Response(JSON.stringify({ error: e.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

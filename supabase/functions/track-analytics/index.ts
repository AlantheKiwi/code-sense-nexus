
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { type User } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function handleCodeExecuted(supabaseAdmin: SupabaseClient, userId: string, payload: any) {
  const { toolName, success, sessionId } = payload;

  if (!toolName || success === undefined || !sessionId) {
    throw new Error('Invalid payload for code_executed event');
  }

  // 1. Get partner_id for the user
  // This assumes the user is a partner owner. A more robust solution might be needed for team members.
  const { data: partnerData, error: partnerError } = await supabaseAdmin
    .from('partners')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (partnerError || !partnerData) {
    throw new Error(`Could not find partner for user ${userId}`);
  }
  const partnerId = partnerData.id;

  // 2. Get or create tool_id
  const { data: toolData, error: toolError } = await supabaseAdmin
    .from('tools')
    .upsert({ name: toolName, category: 'debugging' }, { onConflict: 'name' })
    .select('id')
    .single();

  if (toolError || !toolData) {
    throw new Error(`Could not find or create tool ${toolName}: ${toolError?.message}`);
  }
  const toolId = toolData.id;

  // 3. Upsert tool_usage_stats
  const { data: currentStats, error: statsError } = await supabaseAdmin
    .from('tool_usage_stats')
    .select('usage_count, success_rate')
    .eq('tool_id', toolId)
    .eq('user_id', userId)
    .eq('partner_id', partnerId)
    .maybeSingle();

  if (statsError) throw new Error(`Error fetching current tool stats: ${statsError.message}`);
  
  const usageCount = Number(currentStats?.usage_count ?? 0);
  const successRate = parseFloat(currentStats?.success_rate ?? '0');

  const newUsageCount = usageCount + 1;
  const newSuccessCount = (usageCount * (successRate / 100)) + (success ? 1 : 0);
  const newSuccessRate = (newSuccessCount / newUsageCount) * 100;
  
  const { error: upsertStatsError } = await supabaseAdmin
    .from('tool_usage_stats')
    .upsert({
      tool_id: toolId,
      user_id: userId,
      partner_id: partnerId,
      usage_count: newUsageCount,
      last_used: new Date().toISOString(),
      success_rate: newSuccessRate.toFixed(2),
    }, { onConflict: 'tool_id,user_id,partner_id' });

  if (upsertStatsError) throw new Error(`Error upserting tool usage stats: ${upsertStatsError.message}`);

  // 4. Update debug_metrics
  await supabaseAdmin.from('debug_metrics').upsert({ session_id: sessionId }, { onConflict: 'session_id', ignoreDuplicates: true });
  
  const { data: metrics, error: fetchMetricsError } = await supabaseAdmin.from('debug_metrics').select('tools_used').eq('session_id', sessionId).single();

  if (fetchMetricsError) throw new Error(`Could not fetch debug metrics for session ${sessionId}: ${fetchMetricsError.message}`);

  const newToolEntry = { tool: toolName, timestamp: new Date().toISOString(), success };
  const updatedToolsUsed = [...((metrics.tools_used as any[]) || []), newToolEntry];

  const { error: updateMetricsError } = await supabaseAdmin.from('debug_metrics').update({ tools_used: updatedToolsUsed }).eq('session_id', sessionId);

  if (updateMetricsError) throw new Error(`Could not update debug metrics for session ${sessionId}: ${updateMetricsError.message}`);
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing Authorization header');

    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''));
    if (userError || !user) throw new Error('Unauthorized');

    const { eventName, payload } = await req.json();

    switch (eventName) {
      case 'code_executed':
        await handleCodeExecuted(supabaseAdmin, user.id, payload);
        break;
      default:
        console.warn(`Unknown analytics event: ${eventName}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Analytics tracking error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})


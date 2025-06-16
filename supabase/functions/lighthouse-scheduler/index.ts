import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

console.log('Lighthouse scheduler function started');

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// This function is designed to be called by a cron job every hour
serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    console.log('Processing scheduled Lighthouse monitoring runs');

    // Call the autonomous monitor to process scheduled runs
    const { data, error } = await supabase.functions.invoke('lighthouse-autonomous-monitor', {
      body: {
        action: 'process_scheduled_runs'
      }
    });

    if (error) {
      console.error('Error processing scheduled runs:', error);
      return new Response(JSON.stringify({ 
        error: 'Failed to process scheduled runs',
        details: error.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Scheduled runs processed successfully:', data);

    // Clean up old runs and alerts (keep last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Delete old monitoring runs
    await supabase
      .from('lighthouse_monitoring_runs')
      .delete()
      .lt('created_at', thirtyDaysAgo.toISOString());

    // Delete old resolved alerts
    await supabase
      .from('lighthouse_threshold_alerts')
      .delete()
      .not('resolved_at', 'is', null)
      .lt('created_at', thirtyDaysAgo.toISOString());

    return new Response(JSON.stringify({
      success: true,
      message: 'Scheduled monitoring runs processed successfully',
      processedRuns: data?.processedRuns || 0
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in scheduler function:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

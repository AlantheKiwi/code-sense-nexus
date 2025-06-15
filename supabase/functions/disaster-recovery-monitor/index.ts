
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (_req) => {
  if (_req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log("Running disaster recovery health check...");

    // 1. Check for recent failed backups in the last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data: failedBackups, error: failedBackupsError } = await supabaseAdmin
      .from('backup_history')
      .select('id, partner_id, created_at, status, logs')
      .eq('status', 'failed')
      .gte('created_at', twentyFourHoursAgo);

    if (failedBackupsError) {
      throw new Error(`Failed to check backup history: ${failedBackupsError.message}`);
    }

    // 2. Check for schedules that haven't run as expected
    const { data: overdueSchedules, error: overdueSchedulesError } = await supabaseAdmin
      .from('backup_schedules')
      .select('id, partner_id, frequency, next_run_at')
      .eq('is_active', true)
      .lt('next_run_at', new Date().toISOString());

    if (overdueSchedulesError) {
        throw new Error(`Failed to check backup schedules: ${overdueSchedulesError.message}`);
    }

    const healthStatus = (failedBackups.length === 0 && overdueSchedules.length === 0) ? "OK" : "DEGRADED";
    let message = "System health check complete.";
    if (healthStatus === "DEGRADED") {
        message = "System health degraded. Found issues with backup system."
    }

    return new Response(JSON.stringify({
      message,
      system_health: healthStatus,
      details: {
        failed_backups_last_24h: failedBackups.length,
        overdue_backup_schedules: overdueSchedules.length,
        failed_backups: failedBackups,
        overdue_schedules: overdueSchedules,
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error(`Disaster recovery monitor error: ${error.message}`);
    return new Response(JSON.stringify({
      message: "Disaster recovery monitor failed.",
      system_health: "ERROR",
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

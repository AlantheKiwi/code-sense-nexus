
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

console.log('Lighthouse autonomous monitor function started');

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface MonitoringRequest {
  action: 'trigger_manual_run' | 'process_scheduled_runs' | 'deployment_hook';
  configId?: string;
  deploymentContext?: any;
}

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
    const request: MonitoringRequest = await req.json();
    
    switch (request.action) {
      case 'trigger_manual_run':
        return await handleManualRun(request.configId!);
      case 'process_scheduled_runs':
        return await processScheduledRuns();
      case 'deployment_hook':
        return await handleDeploymentHook(request.configId!, request.deploymentContext);
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error: any) {
    console.error('Error in autonomous monitor function:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleManualRun(configId: string) {
  console.log(`Triggering manual run for config: ${configId}`);
  
  // Fetch the monitoring configuration
  const { data: config, error: configError } = await supabase
    .from('lighthouse_monitoring_configs')
    .select('*')
    .eq('id', configId)
    .single();

  if (configError || !config) {
    return new Response(JSON.stringify({ error: 'Configuration not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Create monitoring run record
  const { data: run, error: runError } = await supabase
    .from('lighthouse_monitoring_runs')
    .insert({
      config_id: configId,
      trigger_type: 'manual',
      status: 'pending',
      total_urls: config.urls.length,
    })
    .select()
    .single();

  if (runError || !run) {
    return new Response(JSON.stringify({ error: 'Failed to create monitoring run' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Process the run asynchronously
  processMonitoringRun(run.id, config);

  return new Response(JSON.stringify({
    success: true,
    runId: run.id,
    message: 'Manual monitoring run triggered'
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function processScheduledRuns() {
  console.log('Processing scheduled monitoring runs');
  
  // Find configurations that are due for execution
  const { data: configs, error } = await supabase
    .from('lighthouse_monitoring_configs')
    .select('*')
    .eq('is_active', true)
    .lte('next_run_at', new Date().toISOString());

  if (error) {
    console.error('Error fetching scheduled configs:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch scheduled configs' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const processedRuns = [];

  for (const config of configs || []) {
    // Check if we haven't exceeded daily audit limits
    const today = new Date().toISOString().split('T')[0];
    const { count } = await supabase
      .from('lighthouse_monitoring_runs')
      .select('*', { count: 'exact', head: true })
      .eq('config_id', config.id)
      .gte('created_at', `${today}T00:00:00Z`)
      .lt('created_at', `${today}T23:59:59Z`);

    if ((count || 0) >= config.max_audits_per_day) {
      console.log(`Skipping config ${config.id} - daily limit reached`);
      continue;
    }

    // Check if it's peak hours and we should avoid them
    if (config.avoid_peak_hours && isInPeakHours(config.peak_hours_start, config.peak_hours_end)) {
      console.log(`Skipping config ${config.id} - peak hours`);
      continue;
    }

    // Create monitoring run
    const { data: run } = await supabase
      .from('lighthouse_monitoring_runs')
      .insert({
        config_id: config.id,
        trigger_type: 'scheduled',
        status: 'pending',
        total_urls: config.urls.length,
      })
      .select()
      .single();

    if (run) {
      processedRuns.push(run.id);
      // Process asynchronously
      processMonitoringRun(run.id, config);
    }

    // Update last_run_at and calculate next_run_at
    await supabase
      .from('lighthouse_monitoring_configs')
      .update({
        last_run_at: new Date().toISOString(),
      })
      .eq('id', config.id);
  }

  return new Response(JSON.stringify({
    success: true,
    processedRuns: processedRuns.length,
    runIds: processedRuns
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleDeploymentHook(configId: string, deploymentContext: any) {
  console.log(`Processing deployment hook for config: ${configId}`);
  
  const { data: config } = await supabase
    .from('lighthouse_monitoring_configs')
    .select('*')
    .eq('id', configId)
    .single();

  if (!config) {
    return new Response(JSON.stringify({ error: 'Configuration not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { data: run } = await supabase
    .from('lighthouse_monitoring_runs')
    .insert({
      config_id: configId,
      trigger_type: 'deployment',
      status: 'pending',
      total_urls: config.urls.length,
      deployment_context: deploymentContext,
    })
    .select()
    .single();

  if (run) {
    processMonitoringRun(run.id, config);
  }

  return new Response(JSON.stringify({
    success: true,
    runId: run?.id,
    message: 'Deployment monitoring run triggered'
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function processMonitoringRun(runId: string, config: any) {
  console.log(`Processing monitoring run: ${runId}`);
  
  // Update run status to running
  await supabase
    .from('lighthouse_monitoring_runs')
    .update({
      status: 'running',
      started_at: new Date().toISOString(),
    })
    .eq('id', runId);

  const results = [];
  let completedUrls = 0;
  let failedUrls = 0;

  // Fetch configuration details
  const { data: lighthouseConfig } = await supabase
    .from('lighthouse_configurations')
    .select('*')
    .eq('id', config.configuration_id)
    .single();

  for (const url of config.urls) {
    try {
      console.log(`Auditing URL: ${url}`);
      
      // Trigger lighthouse audit
      const auditResponse = await supabase.functions.invoke('lighthouse-audit', {
        body: {
          url,
          device: (lighthouseConfig?.settings as any)?.device || 'mobile',
          categories: lighthouseConfig?.audit_categories || ['performance', 'accessibility', 'best-practices', 'seo', 'pwa'],
          projectId: config.project_id,
        }
      });

      if (auditResponse.error) {
        console.error(`Audit failed for ${url}:`, auditResponse.error);
        failedUrls++;
        continue;
      }

      const auditData = auditResponse.data;
      if (auditData?.audit?.scores) {
        results.push({
          url,
          scores: auditData.audit.scores,
          metrics: auditData.audit.metrics,
        });

        // Check thresholds and create alerts
        await checkThresholds(runId, url, auditData.audit.scores, config.performance_thresholds);
        completedUrls++;
      } else {
        failedUrls++;
      }

      // Add delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`Error auditing ${url}:`, error);
      failedUrls++;
    }
  }

  // Calculate average scores
  const averageScores = calculateAverageScores(results);

  // Update run with completion status
  await supabase
    .from('lighthouse_monitoring_runs')
    .update({
      status: completedUrls > 0 ? 'completed' : 'failed',
      completed_at: new Date().toISOString(),
      completed_urls: completedUrls,
      failed_urls: failedUrls,
      average_scores: averageScores,
    })
    .eq('id', runId);

  console.log(`Monitoring run ${runId} completed: ${completedUrls} successful, ${failedUrls} failed`);
}

async function checkThresholds(runId: string, url: string, scores: any, thresholds: any) {
  const alerts = [];

  for (const [metric, score] of Object.entries(scores)) {
    const threshold = thresholds[metric];
    if (threshold && typeof score === 'number' && score < threshold) {
      const severity = getSeverity(score, threshold);
      
      alerts.push({
        monitoring_run_id: runId,
        url,
        metric_type: metric,
        current_score: score,
        threshold_score: threshold,
        severity,
      });
    }
  }

  if (alerts.length > 0) {
    await supabase
      .from('lighthouse_threshold_alerts')
      .insert(alerts);
    
    console.log(`Created ${alerts.length} threshold alerts for ${url}`);
  }
}

function getSeverity(score: number, threshold: number): string {
  const difference = threshold - score;
  if (difference > 30) return 'critical';
  if (difference > 20) return 'high';
  if (difference > 10) return 'medium';
  return 'low';
}

function calculateAverageScores(results: any[]): any {
  if (results.length === 0) return null;

  const averages: any = {};
  const metrics = ['performance', 'accessibility', 'bestPractices', 'seo', 'pwa'];

  for (const metric of metrics) {
    const scores = results.map(r => r.scores[metric]).filter(s => typeof s === 'number');
    if (scores.length > 0) {
      averages[metric] = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    }
  }

  return averages;
}

function isInPeakHours(peakStart: string, peakEnd: string): boolean {
  const now = new Date();
  const currentHour = now.getUTCHours();
  const currentMinute = now.getUTCMinutes();
  const currentTime = currentHour * 60 + currentMinute;
  
  const [startHour, startMin] = peakStart.split(':').map(Number);
  const [endHour, endMin] = peakEnd.split(':').map(Number);
  const startTime = startHour * 60 + startMin;
  const endTime = endHour * 60 + endMin;
  
  return currentTime >= startTime && currentTime <= endTime;
}

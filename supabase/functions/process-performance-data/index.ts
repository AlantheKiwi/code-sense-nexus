
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Type definitions for the incoming request payload
interface PerformanceMetric {
  metric_type: string;
  value: number;
  metadata?: Record<string, any>;
}

interface RequestPayload {
  project_id: string;
  metrics: PerformanceMetric[];
}

// List of metric types that belong to the resource_usage table
const RESOURCE_METRIC_TYPES = ['cpu_usage', 'memory_usage', 'disk_io', 'network_io'];

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // --- Initialize Supabase Admin Client ---
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing environment variables for Supabase client.');
    return new Response(JSON.stringify({ error: 'Internal server configuration error.' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
  
  try {
    const payload: RequestPayload = await req.json();
    const { project_id, metrics } = payload;

    // --- Validate Payload ---
    if (!project_id || !Array.isArray(metrics) || metrics.length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid payload. project_id and a non-empty metrics array are required.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const performanceMetricsToInsert: any[] = [];
    const resourceUsageMetrics: Record<string, any> = { project_id };
    let hasResourceMetrics = false;

    // --- Separate metrics for their respective tables ---
    for (const metric of metrics) {
      if (RESOURCE_METRIC_TYPES.includes(metric.metric_type)) {
        resourceUsageMetrics[metric.metric_type] = metric.value;
        hasResourceMetrics = true;
      } else {
        performanceMetricsToInsert.push({
          project_id,
          metric_type: metric.metric_type,
          value: metric.value,
          metadata: metric.metadata,
        });
      }
    }

    // --- Insert data into database tables in parallel ---
    const insertPromises = [];

    if (performanceMetricsToInsert.length > 0) {
      console.log(`Inserting ${performanceMetricsToInsert.length} performance metrics.`);
      const performancePromise = supabaseAdmin.from('performance_metrics').insert(performanceMetricsToInsert);
      insertPromises.push(performancePromise);
    }

    if (hasResourceMetrics) {
      console.log('Inserting resource usage metrics.');
      const resourcePromise = supabaseAdmin.from('resource_usage').insert([resourceUsageMetrics]);
      insertPromises.push(resourcePromise);
    }
    
    const results = await Promise.all(insertPromises);

    // Check for errors in any of the insert operations
    for (const result of results) {
        if (result.error) {
            throw result.error;
        }
    }

    return new Response(JSON.stringify({ message: 'Metrics processed successfully.' }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (e) {
    console.error('Error processing performance data:', e.message);
    return new Response(JSON.stringify({ error: 'Failed to process request.', details: e.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

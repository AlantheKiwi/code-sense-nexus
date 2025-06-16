
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

console.log('Lighthouse queue function booting up');

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface QueueRequest {
  urls: string[];
  device?: 'mobile' | 'desktop';
  projectId?: string;
  priority?: 'low' | 'normal' | 'high';
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method === 'POST') {
    return await handleQueueRequest(req);
  } else if (req.method === 'GET') {
    return await handleQueueStatus(req);
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});

async function handleQueueRequest(req: Request) {
  try {
    const queueRequest: QueueRequest = await req.json();
    
    if (!queueRequest.urls || !Array.isArray(queueRequest.urls) || queueRequest.urls.length === 0) {
      return new Response(JSON.stringify({ error: 'URLs array is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate URLs
    for (const url of queueRequest.urls) {
      try {
        new URL(url);
      } catch {
        return new Response(JSON.stringify({ error: `Invalid URL: ${url}` }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Check current queue size for rate limiting
    const { count } = await supabase
      .from('lighthouse_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    const MAX_QUEUE_SIZE = 100; // Configurable rate limit
    if ((count || 0) + queueRequest.urls.length > MAX_QUEUE_SIZE) {
      return new Response(JSON.stringify({ 
        error: 'Queue is full. Please try again later.',
        queueSize: count,
        maxSize: MAX_QUEUE_SIZE 
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Add URLs to queue
    const queueItems = queueRequest.urls.map(url => ({
      url,
      device: queueRequest.device || 'mobile',
      project_id: queueRequest.projectId,
      priority: queueRequest.priority || 'normal',
      status: 'pending',
      created_at: new Date().toISOString(),
    }));

    const { data: queuedItems, error } = await supabase
      .from('lighthouse_queue')
      .insert(queueItems)
      .select();

    if (error) {
      console.error('Error adding items to queue:', error);
      return new Response(JSON.stringify({ error: 'Failed to queue audits' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Queued ${queuedItems?.length} audits`);

    // Process queue (background task)
    processQueue();

    return new Response(JSON.stringify({ 
      success: true,
      queuedItems: queuedItems?.length,
      estimatedWaitTime: Math.ceil((count || 0) / 2) // Rough estimate: 2 audits per minute
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in queue request:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function handleQueueStatus(req: Request) {
  try {
    const url = new URL(req.url);
    const projectId = url.searchParams.get('projectId');

    let query = supabase
      .from('lighthouse_queue')
      .select('*')
      .order('created_at', { ascending: false });

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data: queueItems } = await query.limit(50);

    const { count: pendingCount } = await supabase
      .from('lighthouse_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    const { count: processingCount } = await supabase
      .from('lighthouse_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'processing');

    return new Response(JSON.stringify({
      queueItems: queueItems || [],
      stats: {
        pending: pendingCount || 0,
        processing: processingCount || 0,
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error getting queue status:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function processQueue() {
  try {
    // Get next item from queue (highest priority first)
    const { data: nextItems } = await supabase
      .from('lighthouse_queue')
      .select('*')
      .eq('status', 'pending')
      .order('priority', { ascending: false }) // high > normal > low
      .order('created_at', { ascending: true })
      .limit(1);

    if (!nextItems || nextItems.length === 0) {
      console.log('No items in queue to process');
      return;
    }

    const item = nextItems[0];
    console.log(`Processing queue item: ${item.url}`);

    // Mark as processing
    await supabase
      .from('lighthouse_queue')
      .update({ status: 'processing', started_at: new Date().toISOString() })
      .eq('id', item.id);

    try {
      // Call lighthouse audit
      const auditResponse = await supabase.functions.invoke('lighthouse-audit', {
        body: {
          url: item.url,
          device: item.device,
          projectId: item.project_id,
        }
      });

      if (auditResponse.error) {
        throw new Error(auditResponse.error.message);
      }

      const auditData = auditResponse.data;

      // Store audit result
      const { error: insertError } = await supabase
        .from('lighthouse_audits')
        .insert({
          url: item.url,
          device: item.device,
          project_id: item.project_id,
          scores: auditData.audit.scores,
          metrics: auditData.audit.metrics,
          opportunities: auditData.audit.opportunities,
          diagnostics: auditData.audit.diagnostics,
          full_report: auditData.audit.fullReport,
          audit_id: auditData.auditId,
        });

      if (insertError) {
        throw insertError;
      }

      // Mark as completed
      await supabase
        .from('lighthouse_queue')
        .update({ 
          status: 'completed', 
          completed_at: new Date().toISOString(),
          result: auditData.audit.scores 
        })
        .eq('id', item.id);

      console.log(`Successfully processed audit for: ${item.url}`);

    } catch (processingError: any) {
      console.error(`Error processing audit for ${item.url}:`, processingError);

      // Mark as failed
      await supabase
        .from('lighthouse_queue')
        .update({ 
          status: 'failed', 
          completed_at: new Date().toISOString(),
          error_message: processingError.message 
        })
        .eq('id', item.id);
    }

    // Continue processing next item after a delay
    setTimeout(() => processQueue(), 2000); // 2 second delay between audits

  } catch (error: any) {
    console.error('Error in processQueue:', error);
  }
}

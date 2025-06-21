
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

console.log('Lighthouse recommendation engine function started');

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface LighthouseRequest {
  action: 'schedule' | 'status' | 'cancel';
  project_id?: string;
  job_id?: string;
  url?: string;
  trigger_type?: 'manual' | 'scheduled' | 'webhook';
  trigger_data?: any;
  priority?: number;
}

serve(async (req: Request) => {
  console.log(`Lighthouse Engine: ${req.method} request received`);
  console.log(`Lighthouse Engine: URL: ${req.url}`);

  if (req.method === 'OPTIONS') {
    console.log('Lighthouse Engine: OPTIONS request received');
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      console.error('Lighthouse Engine: Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Lighthouse Engine: Authenticated user ${user.id}`);

    const request: LighthouseRequest = await req.json();
    console.log('Lighthouse Engine: Request body:', JSON.stringify(request));

    switch (request.action) {
      case 'schedule':
        return await scheduleAnalysis(request, user.id);
      case 'status':
        return await getJobStatus(request.job_id!);
      case 'cancel':
        return await cancelJob(request.job_id!, user.id);
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error: any) {
    console.error('Lighthouse Engine: Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function scheduleAnalysis(request: LighthouseRequest, userId: string) {
  console.log(`Lighthouse Core: Starting analysis scheduling for user: ${userId}`);
  console.log(`Lighthouse Core: Request data:`, JSON.stringify(request));

  if (!request.project_id) {
    return new Response(JSON.stringify({ error: 'Project ID is required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Check project access
  console.log(`Lighthouse Core: Checking project access for project: ${request.project_id}`);
  const { data: projectAccess, error: accessError } = await supabase
    .from('project_members')
    .select('role')
    .eq('project_id', request.project_id)
    .eq('user_id', userId)
    .single();

  if (accessError || !projectAccess) {
    console.error('Lighthouse Core: Project access error:', accessError);
    return new Response(JSON.stringify({ error: 'Project not found or access denied' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Check active jobs limit
  console.log('Lighthouse Core: Checking active jobs limit');
  const { count: activeJobs } = await supabase
    .from('lighthouse_audits')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', request.project_id)
    .in('status', ['queued', 'running']);

  if (activeJobs && activeJobs >= 5) {
    return new Response(JSON.stringify({ error: 'Too many active jobs for this project' }), {
      status: 429,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Create the job
  const jobData = {
    project_id: request.project_id,
    url: request.url || 'https://example.com',
    status: 'queued',
    priority: request.priority || 1,
    trigger_type: request.trigger_type || 'manual',
    trigger_data: request.trigger_data || {},
    created_by: userId,
    scheduled_at: new Date().toISOString(),
    progress: 0
  };

  console.log(`Lighthouse Core: Creating job:`, JSON.stringify(jobData));

  const { data: job, error: jobError } = await supabase
    .from('lighthouse_audits')
    .insert(jobData)
    .select()
    .single();

  if (jobError) {
    console.error('Lighthouse Core: Job creation error:', jobError);
    return new Response(JSON.stringify({ error: 'Failed to create job' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  console.log(`Lighthouse Core: Job created successfully: ${job.id}`);

  // Send job update notification
  console.log(`Lighthouse Core: Sending job update notification for job: ${job.id}`);
  try {
    await supabase
      .from('lighthouse_audits')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', job.id);
    
    console.log('Lighthouse Core: Job update notification sent successfully');
  } catch (notificationError) {
    console.error('Lighthouse Core: Failed to send notification:', notificationError);
  }

  return new Response(JSON.stringify({
    success: true,
    job: {
      id: job.id,
      status: job.status,
      priority: job.priority,
      scheduled_at: job.scheduled_at,
      progress: job.progress
    },
    message: 'Lighthouse analysis job created successfully'
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function getJobStatus(jobId: string) {
  console.log(`Lighthouse Core: Getting status for job: ${jobId}`);

  const { data: job, error } = await supabase
    .from('lighthouse_audits')
    .select('id, status, progress, scores, full_report, error_message, completed_at')
    .eq('id', jobId)
    .single();

  if (error || !job) {
    return new Response(JSON.stringify({ error: 'Job not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({
    success: true,
    job
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function cancelJob(jobId: string, userId: string) {
  console.log(`Lighthouse Core: Canceling job: ${jobId} for user: ${userId}`);

  const { data: job, error } = await supabase
    .from('lighthouse_audits')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', jobId)
    .eq('created_by', userId)
    .select()
    .single();

  if (error || !job) {
    return new Response(JSON.stringify({ error: 'Job not found or access denied' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({
    success: true,
    message: 'Job cancelled successfully'
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

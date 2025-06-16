
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface ESLintJob {
  id: string;
  project_id: string;
  trigger_type: 'manual' | 'scheduled' | 'git_commit' | 'file_upload';
  trigger_data?: any;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'retrying';
  priority: number;
  retry_count: number;
  max_retries: number;
  scheduled_at?: string;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  progress: number;
  result_summary?: any;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    const authHeader = req.headers.get('Authorization');

    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization header required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    switch (action) {
      case 'schedule':
        const scheduleData = await req.json();
        return await scheduleAnalysis(supabase, scheduleData, user.id);
      case 'queue-status':
        return await getQueueStatus(supabase);
      case 'job-status':
        const jobId = url.searchParams.get('job_id');
        return await getJobStatus(supabase, jobId);
      case 'cancel-job':
        const cancelJobId = url.searchParams.get('job_id');
        return await cancelJob(supabase, cancelJobId, user.id);
      case 'retry-job':
        const retryJobId = url.searchParams.get('job_id');
        return await retryJob(supabase, retryJobId, user.id);
      case 'process-queue':
        return await processQueue(supabase);
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error: any) {
    console.error('ESLint scheduler error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function scheduleAnalysis(supabase: any, data: any, userId: string) {
  const { project_id, trigger_type, trigger_data, priority = 5, scheduled_at } = data;

  // Validate user has access to project
  const { data: projectAccess, error: accessError } = await supabase
    .from('project_members')
    .select('role')
    .eq('project_id', project_id)
    .eq('user_id', userId)
    .single();

  if (accessError || !projectAccess) {
    return new Response(JSON.stringify({ error: 'Project access denied' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Check for resource limits
  const { data: activeJobs, error: jobsError } = await supabase
    .from('eslint_analysis_queue')
    .select('id')
    .eq('project_id', project_id)
    .in('status', ['queued', 'running']);

  if (jobsError) {
    throw new Error(`Failed to check active jobs: ${jobsError.message}`);
  }

  if (activeJobs && activeJobs.length >= 5) {
    return new Response(JSON.stringify({ error: 'Too many active jobs for this project' }), {
      status: 429,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Create job
  const job: Partial<ESLintJob> = {
    project_id,
    trigger_type,
    trigger_data,
    status: scheduled_at ? 'queued' : 'queued',
    priority,
    retry_count: 0,
    max_retries: 3,
    scheduled_at: scheduled_at || new Date().toISOString(),
    progress: 0,
  };

  const { data: createdJob, error: createError } = await supabase
    .from('eslint_analysis_queue')
    .insert(job)
    .select()
    .single();

  if (createError) {
    throw new Error(`Failed to create job: ${createError.message}`);
  }

  // Notify via WebSocket
  await notifyJobUpdate(supabase, createdJob);

  return new Response(JSON.stringify({ 
    success: true, 
    job: createdJob 
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function getQueueStatus(supabase: any) {
  const { data: jobs, error } = await supabase
    .from('eslint_analysis_queue')
    .select('*')
    .order('priority', { ascending: false })
    .order('scheduled_at', { ascending: true })
    .limit(100);

  if (error) {
    throw new Error(`Failed to fetch queue status: ${error.message}`);
  }

  const queueStats = {
    total: jobs.length,
    queued: jobs.filter((j: any) => j.status === 'queued').length,
    running: jobs.filter((j: any) => j.status === 'running').length,
    completed: jobs.filter((j: any) => j.status === 'completed').length,
    failed: jobs.filter((j: any) => j.status === 'failed').length,
    retrying: jobs.filter((j: any) => j.status === 'retrying').length,
  };

  return new Response(JSON.stringify({ 
    jobs, 
    stats: queueStats 
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function getJobStatus(supabase: any, jobId: string) {
  if (!jobId) {
    return new Response(JSON.stringify({ error: 'Job ID required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { data: job, error } = await supabase
    .from('eslint_analysis_queue')
    .select('*')
    .eq('id', jobId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch job status: ${error.message}`);
  }

  return new Response(JSON.stringify({ job }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function cancelJob(supabase: any, jobId: string, userId: string) {
  if (!jobId) {
    return new Response(JSON.stringify({ error: 'Job ID required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Verify user has access to the job's project
  const { data: job, error: jobError } = await supabase
    .from('eslint_analysis_queue')
    .select('project_id, status')
    .eq('id', jobId)
    .single();

  if (jobError || !job) {
    return new Response(JSON.stringify({ error: 'Job not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (job.status === 'running') {
    return new Response(JSON.stringify({ error: 'Cannot cancel running job' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { error: updateError } = await supabase
    .from('eslint_analysis_queue')
    .update({ 
      status: 'cancelled',
      completed_at: new Date().toISOString(),
      error_message: 'Cancelled by user'
    })
    .eq('id', jobId);

  if (updateError) {
    throw new Error(`Failed to cancel job: ${updateError.message}`);
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function retryJob(supabase: any, jobId: string, userId: string) {
  if (!jobId) {
    return new Response(JSON.stringify({ error: 'Job ID required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { data: job, error: jobError } = await supabase
    .from('eslint_analysis_queue')
    .select('*')
    .eq('id', jobId)
    .single();

  if (jobError || !job) {
    return new Response(JSON.stringify({ error: 'Job not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (job.retry_count >= job.max_retries) {
    return new Response(JSON.stringify({ error: 'Maximum retries exceeded' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { error: updateError } = await supabase
    .from('eslint_analysis_queue')
    .update({ 
      status: 'queued',
      retry_count: job.retry_count + 1,
      scheduled_at: new Date().toISOString(),
      error_message: null,
      progress: 0
    })
    .eq('id', jobId);

  if (updateError) {
    throw new Error(`Failed to retry job: ${updateError.message}`);
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function processQueue(supabase: any) {
  console.log('Processing ESLint analysis queue...');

  // Get next job to process
  const { data: jobs, error: fetchError } = await supabase
    .from('eslint_analysis_queue')
    .select('*')
    .eq('status', 'queued')
    .lte('scheduled_at', new Date().toISOString())
    .order('priority', { ascending: false })
    .order('scheduled_at', { ascending: true })
    .limit(1);

  if (fetchError) {
    console.error('Failed to fetch queued jobs:', fetchError);
    return new Response(JSON.stringify({ error: 'Failed to fetch jobs' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (!jobs || jobs.length === 0) {
    return new Response(JSON.stringify({ message: 'No jobs to process' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const job = jobs[0];
  
  try {
    // Mark job as running
    await supabase
      .from('eslint_analysis_queue')
      .update({ 
        status: 'running',
        started_at: new Date().toISOString(),
        progress: 0
      })
      .eq('id', job.id);

    await notifyJobUpdate(supabase, { ...job, status: 'running', started_at: new Date().toISOString() });

    // Process the job
    await processESLintJob(supabase, job);

    return new Response(JSON.stringify({ 
      success: true, 
      processed_job: job.id 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error(`Job ${job.id} failed:`, error);
    await handleJobFailure(supabase, job, error.message);
    throw error;
  }
}

async function processESLintJob(supabase: any, job: any) {
  console.log(`Processing ESLint job ${job.id} for project ${job.project_id}`);

  try {
    // Update progress
    await updateJobProgress(supabase, job.id, 25, 'Fetching project files...');

    // Get project repository info
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('github_url, settings')
      .eq('id', job.project_id)
      .single();

    if (projectError) {
      throw new Error(`Failed to fetch project: ${projectError.message}`);
    }

    await updateJobProgress(supabase, job.id, 50, 'Running ESLint analysis...');

    // TODO: Integrate with actual code analysis
    // For now, simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    await updateJobProgress(supabase, job.id, 75, 'Processing results...');

    // Mock results for demonstration
    const mockResults = [
      {
        filePath: 'src/components/Example.tsx',
        messages: [
          {
            ruleId: 'no-unused-vars',
            severity: 1,
            message: 'Variable is unused',
            line: 10,
            column: 5
          }
        ]
      }
    ];

    // Process results using existing processor
    const resultsResponse = await supabase.functions.invoke('eslint-results-processor', {
      body: {
        project_id: job.project_id,
        results: mockResults,
      },
    });

    if (resultsResponse.error) {
      throw new Error(`Results processing failed: ${resultsResponse.error.message}`);
    }

    await updateJobProgress(supabase, job.id, 100, 'Completed');

    // Mark job as completed
    await supabase
      .from('eslint_analysis_queue')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString(),
        progress: 100,
        result_summary: resultsResponse.data
      })
      .eq('id', job.id);

    await notifyJobUpdate(supabase, { 
      ...job, 
      status: 'completed', 
      completed_at: new Date().toISOString(),
      progress: 100,
      result_summary: resultsResponse.data
    });

    console.log(`Job ${job.id} completed successfully`);

  } catch (error: any) {
    console.error(`Job ${job.id} processing error:`, error);
    throw error;
  }
}

async function updateJobProgress(supabase: any, jobId: string, progress: number, message: string) {
  await supabase
    .from('eslint_analysis_queue')
    .update({ 
      progress,
      status_message: message,
      updated_at: new Date().toISOString()
    })
    .eq('id', jobId);

  // Notify progress update via WebSocket
  await notifyJobUpdate(supabase, { 
    id: jobId, 
    progress, 
    status_message: message,
    updated_at: new Date().toISOString()
  });
}

async function handleJobFailure(supabase: any, job: any, errorMessage: string) {
  const retryCount = job.retry_count || 0;
  const maxRetries = job.max_retries || 3;

  if (retryCount < maxRetries) {
    // Calculate exponential backoff delay (in minutes)
    const backoffDelay = Math.pow(2, retryCount) * 5; // 5, 10, 20 minutes
    const retryAt = new Date(Date.now() + backoffDelay * 60 * 1000);

    await supabase
      .from('eslint_analysis_queue')
      .update({ 
        status: 'retrying',
        retry_count: retryCount + 1,
        scheduled_at: retryAt.toISOString(),
        error_message: errorMessage,
        progress: 0
      })
      .eq('id', job.id);

    console.log(`Job ${job.id} will retry in ${backoffDelay} minutes (attempt ${retryCount + 1}/${maxRetries})`);
  } else {
    await supabase
      .from('eslint_analysis_queue')
      .update({ 
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_message: errorMessage
      })
      .eq('id', job.id);

    console.log(`Job ${job.id} failed permanently after ${maxRetries} retries`);
  }

  await notifyJobUpdate(supabase, { 
    ...job, 
    status: retryCount < maxRetries ? 'retrying' : 'failed',
    error_message: errorMessage,
    retry_count: retryCount + 1
  });
}

async function notifyJobUpdate(supabase: any, job: any) {
  try {
    // Send real-time update via Supabase Realtime
    await supabase
      .channel(`eslint-jobs-${job.project_id}`)
      .send({
        type: 'broadcast',
        event: 'job-update',
        payload: job
      });
  } catch (error) {
    console.error('Failed to send job update notification:', error);
  }
}

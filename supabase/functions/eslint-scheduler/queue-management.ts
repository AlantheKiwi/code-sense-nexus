
export async function getQueueStatus(supabase: any) {
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

  return { jobs, stats: queueStats };
}

export async function processQueue(supabase: any) {
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
    throw new Error('Failed to fetch jobs');
  }

  if (!jobs || jobs.length === 0) {
    return { message: 'No jobs to process' };
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

    // Process the job
    await processESLintJob(supabase, job);

    return { success: true, processed_job: job.id };

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
}

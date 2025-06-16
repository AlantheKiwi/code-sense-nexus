
export async function scheduleAnalysis(supabase: any, data: any, userId: string) {
  const { project_id, trigger_type, trigger_data, priority = 5, scheduled_at } = data;

  // Validate user has access to project
  const { data: projectAccess, error: accessError } = await supabase
    .from('project_members')
    .select('role')
    .eq('project_id', project_id)
    .eq('user_id', userId)
    .single();

  if (accessError || !projectAccess) {
    throw new Error('Project access denied');
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
    throw new Error('Too many active jobs for this project');
  }

  // Create job
  const job = {
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

  return createdJob;
}

export async function notifyJobUpdate(supabase: any, job: any) {
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

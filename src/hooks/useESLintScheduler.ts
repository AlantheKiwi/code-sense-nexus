
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ESLintJob {
  id: string;
  project_id: string;
  trigger_type: 'manual' | 'scheduled' | 'git_commit' | 'file_upload';
  trigger_data?: any;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'retrying' | 'cancelled';
  priority: number;
  retry_count: number;
  max_retries: number;
  scheduled_at?: string;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  progress: number;
  status_message?: string;
  result_summary?: any;
  created_at: string;
  updated_at: string;
}

export interface QueueStats {
  total: number;
  queued: number;
  running: number;
  completed: number;
  failed: number;
  retrying: number;
}

export function useESLintScheduler() {
  const [jobs, setJobs] = useState<ESLintJob[]>([]);
  const [queueStats, setQueueStats] = useState<QueueStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [realtimeChannel, setRealtimeChannel] = useState<any>(null);

  // Subscribe to real-time job updates
  const subscribeToJobUpdates = (projectId: string) => {
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel);
    }

    const channel = su pabase
      .channel(`eslint-jobs-${projectId}`)
      .on('broadcast', { event: 'job-update' }, (payload) => {
        const updatedJob = payload.payload;
        setJobs(prev => prev.map(job => 
          job.id === updatedJob.id ? { ...job, ...updatedJob } : job
        ));
      })
      .subscribe();

    setRealtimeChannel(channel);
  };

  const unsubscribeFromJobUpdates = () => {
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel);
      setRealtimeChannel(null);
    }
  };

  const scheduleAnalysis = async (
    projectId: string, 
    triggerType: ESLintJob['trigger_type'] = 'manual',
    triggerData?: any,
    priority: number = 5,
    scheduledAt?: Date
  ) => {
    try {
      setIsLoading(true);
      const response = await supabase.functions.invoke('eslint-scheduler', {
        body: {
          project_id: projectId,
          trigger_type: triggerType,
          trigger_data: triggerData,
          priority,
          scheduled_at: scheduledAt?.toISOString(),
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast.success('ESLint analysis scheduled successfully');
      await fetchQueueStatus(); // Refresh queue
      return response.data.job;
    } catch (error: any) {
      console.error('Error scheduling ESLint analysis:', error);
      toast.error('Failed to schedule ESLint analysis');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchQueueStatus = async () => {
    try {
      setIsLoading(true);
      const response = await supabase.functions.invoke('eslint-scheduler', {
        method: 'GET',
        body: null,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setJobs(response.data.jobs);
      setQueueStats(response.data.stats);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching queue status:', error);
      toast.error('Failed to fetch queue status');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getJobStatus = async (jobId: string) => {
    try {
      const response = await supabase.functions.invoke('eslint-scheduler', {
        method: 'GET',
        body: null,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data.job;
    } catch (error: any) {
      console.error('Error fetching job status:', error);
      toast.error('Failed to fetch job status');
      throw error;
    }
  };

  const cancelJob = async (jobId: string) => {
    try {
      const response = await supabase.functions.invoke('eslint-scheduler', {
        method: 'POST',
        body: null,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast.success('Job cancelled successfully');
      await fetchQueueStatus(); // Refresh queue
      return response.data;
    } catch (error: any) {
      console.error('Error cancelling job:', error);
      toast.error('Failed to cancel job');
      throw error;
    }
  };

  const retryJob = async (jobId: string) => {
    try {
      const response = await supabase.functions.invoke('eslint-scheduler', {
        method: 'POST',
        body: null,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast.success('Job retry scheduled successfully');
      await fetchQueueStatus(); // Refresh queue
      return response.data;
    } catch (error: any) {
      console.error('Error retrying job:', error);
      toast.error('Failed to retry job');
      throw error;
    }
  };

  const processQueue = async () => {
    try {
      const response = await supabase.functions.invoke('eslint-scheduler', {
        method: 'POST',
        body: null,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data;
    } catch (error: any) {
      console.error('Error processing queue:', error);
      throw error;
    }
  };

  // Auto-refresh queue status
  useEffect(() => {
    const interval = setInterval(() => {
      fetchQueueStatus();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Cleanup realtime subscription on unmount
  useEffect(() => {
    return () => {
      unsubscribeFromJobUpdates();
    };
  }, []);

  return {
    jobs,
    queueStats,
    isLoading,
    scheduleAnalysis,
    fetchQueueStatus,
    getJobStatus,
    cancelJob,
    retryJob,
    processQueue,
    subscribeToJobUpdates,
    unsubscribeFromJobUpdates,
  };
}

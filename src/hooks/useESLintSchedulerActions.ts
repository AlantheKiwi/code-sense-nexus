
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useESLintSchedulerActions() {
  const [isLoading, setIsLoading] = useState(false);

  const getJobStatus = async (jobId: string) => {
    try {
      const response = await supabase.functions.invoke('eslint-scheduler', {
        body: { action: 'job-status', job_id: jobId },
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
        body: { action: 'cancel-job', job_id: jobId },
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast.success('Job cancelled successfully');
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
        body: { action: 'retry-job', job_id: jobId },
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast.success('Job retry scheduled successfully');
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
        body: { action: 'process-queue' },
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

  return {
    isLoading,
    getJobStatus,
    cancelJob,
    retryJob,
    processQueue,
  };
}

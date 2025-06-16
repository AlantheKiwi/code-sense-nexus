
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
          action: 'schedule',
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
      await fetchQueueStatus();
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
      
      // Use the direct Supabase URL constants
      const url = new URL(`https://dtwgnqzuskdfuypigaor.supabase.co/functions/v1/eslint-scheduler`);
      url.searchParams.append('action', 'queue-status');

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0d2ducXp1c2tkZnV5cGlnYW9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNzY3NDcsImV4cCI6MjA2NDc1Mjc0N30.D_Ms-plmjx82XAw4MdCYQMh03X6nzFnAajVMKIJLCVQ',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setJobs(data.jobs || []);
      setQueueStats(data.stats || null);
      return data;
    } catch (error: any) {
      console.error('Error fetching queue status:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-refresh queue status
  useEffect(() => {
    fetchQueueStatus().catch(console.error);
    
    const interval = setInterval(() => {
      fetchQueueStatus().catch(console.error);
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return {
    jobs,
    queueStats,
    isLoading,
    scheduleAnalysis,
    fetchQueueStatus,
  };
}

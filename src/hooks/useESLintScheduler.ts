
import { useState, useEffect, useRef, useCallback } from 'react';
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
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);
  const isRequestingRef = useRef(false);

  const scheduleAnalysis = async (
    projectId: string, 
    triggerType: ESLintJob['trigger_type'] = 'manual',
    triggerData?: any,
    priority: number = 5,
    scheduledAt?: Date
  ) => {
    // DISABLED: Auto-scheduling during system rebuild
    console.log('ESLint auto-scheduling disabled during system rebuild');
    toast.error('Auto-fix scheduling temporarily disabled during system rebuild');
    throw new Error('Auto-fix scheduling disabled during system rebuild');
  };

  const fetchQueueStatus = useCallback(async () => {
    // DISABLED: Queue status fetching during rebuild
    console.log('Queue status fetching disabled during system rebuild');
    
    if (mountedRef.current) {
      setJobs([]);
      setQueueStats({
        total: 0,
        queued: 0,
        running: 0,
        completed: 0,
        failed: 0,
        retrying: 0
      });
      setIsLoading(false);
    }
    
    return { jobs: [], stats: null };
  }, []);

  // DISABLED: Auto-refresh during rebuild
  useEffect(() => {
    mountedRef.current = true;
    
    console.log('ESLint scheduler auto-refresh disabled during system rebuild');
    
    return () => {
      mountedRef.current = false;
      
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, []);

  return {
    jobs,
    queueStats,
    isLoading,
    scheduleAnalysis,
    fetchQueueStatus,
  };
}

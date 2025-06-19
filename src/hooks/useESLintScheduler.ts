
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
    try {
      setIsLoading(true);
      
      console.log('Scheduling ESLint analysis for project:', projectId);
      
      const response = await supabase.functions.invoke('eslint-scheduler', {
        body: {
          action: 'schedule',
          project_id: projectId,
          trigger_type: triggerType,
          trigger_data: triggerData,
          priority,
          scheduled_at: scheduledAt?.toISOString(),
        },
      });

      console.log('Schedule analysis response:', response);

      if (response.error) {
        console.error('Schedule analysis error:', response.error);
        
        // Handle specific error cases
        if (response.error.message?.includes('multiple rows')) {
          throw new Error('Database integrity issue detected. Please contact support.');
        } else if (response.error.message?.includes('Too many active jobs')) {
          throw new Error('Too many active analysis jobs. Please wait for some to complete.');
        } else {
          throw new Error(response.error.message || 'Failed to schedule analysis');
        }
      }

      toast.success('ESLint analysis scheduled successfully');
      await fetchQueueStatus();
      return response.data?.job;
    } catch (error: any) {
      console.error('Error scheduling ESLint analysis:', error);
      toast.error(`Failed to schedule ESLint analysis: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchQueueStatus = useCallback(async () => {
    // Prevent concurrent requests
    if (isRequestingRef.current) {
      console.log('Request already in progress, skipping');
      return;
    }

    try {
      isRequestingRef.current = true;
      setIsLoading(true);
      
      console.log('Fetching queue status...');
      
      const response = await supabase.functions.invoke('eslint-scheduler', {
        body: { action: 'queue-status' }
      });

      console.log('Queue status response:', response);

      if (response.error) {
        console.error('Queue status error:', response.error);
        
        // Handle specific error cases
        if (response.error.message?.includes('multiple rows')) {
          console.warn('Multiple rows detected in queue status, using first result');
          // Continue processing if we have data despite the error
          if (response.data) {
            const data = response.data;
            if (mountedRef.current) {
              setJobs(Array.isArray(data.jobs) ? data.jobs : []);
              setQueueStats(data.stats || null);
            }
            return data;
          }
        }
        
        throw new Error(response.error.message || 'Failed to fetch queue status');
      }

      const data = response.data;
      console.log('Queue status data:', data);

      if (mountedRef.current && data) {
        setJobs(Array.isArray(data.jobs) ? data.jobs : []);
        setQueueStats(data.stats || null);
      }
      
      return data;
    } catch (error: any) {
      console.error('Error fetching queue status:', error);
      
      // Only show user-facing errors for actual issues, not abort errors
      if (!error.message.includes('aborted') && !error.message.includes('cancelled')) {
        if (error.message.includes('multiple rows')) {
          toast.error('Database integrity issue detected. Some data may be duplicated.');
        } else {
          toast.error(`Unable to fetch queue status: ${error.message}`);
        }
      }
      
      throw error;
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
      isRequestingRef.current = false;
    }
  }, []);

  // Auto-refresh with proper cleanup
  useEffect(() => {
    mountedRef.current = true;
    
    // Initial fetch with error handling
    console.log('Starting initial queue status fetch...');
    fetchQueueStatus().catch(error => {
      console.log('Initial queue status fetch failed:', error.message);
      // Don't show error toast on initial load failure
    });
    
    // Set up auto-refresh
    refreshIntervalRef.current = setInterval(() => {
      if (mountedRef.current && !isRequestingRef.current) {
        console.log('Auto-refresh queue status...');
        fetchQueueStatus().catch(error => {
          console.log('Auto-refresh failed:', error.message);
        });
      }
    }, 30000); // 30 seconds

    return () => {
      mountedRef.current = false;
      
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, []); // Empty dependency array to prevent re-initialization

  return {
    jobs,
    queueStats,
    isLoading,
    scheduleAnalysis,
    fetchQueueStatus,
  };
}

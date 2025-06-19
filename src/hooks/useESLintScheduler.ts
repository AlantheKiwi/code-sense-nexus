
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

// Global request deduplication
const activeRequests = new Map<string, Promise<any>>();
const requestCooldowns = new Map<string, number>();

export function useESLintScheduler() {
  const [jobs, setJobs] = useState<ESLintJob[]>([]);
  const [queueStats, setQueueStats] = useState<QueueStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

  const fetchQueueStatus = useCallback(async () => {
    const requestKey = 'queue-status';
    
    // Check cooldown period (minimum 2 seconds between requests)
    const now = Date.now();
    const lastRequest = requestCooldowns.get(requestKey);
    if (lastRequest && now - lastRequest < 2000) {
      console.log('Request throttled, waiting for cooldown');
      return;
    }

    // Check if there's already an active request
    if (activeRequests.has(requestKey)) {
      console.log('Request already in progress, waiting for completion');
      return activeRequests.get(requestKey);
    }

    // Abort any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    const requestPromise = (async () => {
      try {
        setIsLoading(true);
        requestCooldowns.set(requestKey, now);

        const response = await supabase.functions.invoke('eslint-scheduler', {
          body: { action: 'queue-status' },
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.error) {
          throw new Error(response.error.message);
        }

        if (!response.data) {
          throw new Error('No data received from queue status');
        }

        setJobs(response.data.jobs || []);
        setQueueStats(response.data.stats || null);
        setRetryCount(0); // Reset retry count on success
        
        return response.data;
      } catch (error: any) {
        console.error('Error fetching queue status:', error);
        
        // Implement exponential backoff for retries
        if (retryCount < 3) {
          const backoffDelay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
          console.log(`Retrying queue status fetch in ${backoffDelay}ms (attempt ${retryCount + 1})`);
          
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
            fetchQueueStatus();
          }, backoffDelay);
        } else {
          console.log('Max retries reached for queue status fetch');
          setRetryCount(0);
        }
        
        throw error;
      } finally {
        setIsLoading(false);
        activeRequests.delete(requestKey);
      }
    })();

    activeRequests.set(requestKey, requestPromise);
    return requestPromise;
  }, [retryCount]);

  // Auto-refresh with proper cleanup and rate limiting
  useEffect(() => {
    // Initial fetch
    fetchQueueStatus().catch(error => {
      console.log('Initial queue status fetch failed:', error.message);
    });
    
    // Set up auto-refresh with longer interval to reduce load
    refreshIntervalRef.current = setInterval(() => {
      fetchQueueStatus().catch(error => {
        console.log('Auto-refresh queue status fetch failed:', error.message);
      });
    }, 30000); // 30 seconds interval

    return () => {
      // Cleanup on unmount
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
      
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }

      // Clear active requests for this hook instance
      activeRequests.clear();
      requestCooldowns.clear();
    };
  }, []); // Empty dependency array to run only once

  return {
    jobs,
    queueStats,
    isLoading,
    scheduleAnalysis,
    fetchQueueStatus,
  };
}


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

// Simplified global request management
const requestCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5000; // 5 seconds cache

export function useESLintScheduler() {
  const [jobs, setJobs] = useState<ESLintJob[]>([]);
  const [queueStats, setQueueStats] = useState<QueueStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

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
    const cacheKey = 'queue-status';
    const now = Date.now();
    
    // Check cache first
    const cached = requestCache.get(cacheKey);
    if (cached && now - cached.timestamp < CACHE_TTL) {
      console.log('Using cached queue status');
      return cached.data;
    }

    try {
      setIsLoading(true);
      
      // Use GET request with query parameter - matching what the edge function expects
      const url = new URL(supabase.supabaseUrl + '/functions/v1/eslint-scheduler');
      url.searchParams.set('action', 'queue-status');
      
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error('No valid session found');
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseText = await response.text();
      let data;
      
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parse error. Response text:', responseText);
        throw new Error('Invalid JSON response from server');
      }

      // Cache the successful response
      requestCache.set(cacheKey, { data, timestamp: now });

      if (mountedRef.current) {
        setJobs(data.jobs || []);
        setQueueStats(data.stats || null);
      }
      
      return data;
    } catch (error: any) {
      console.error('Error fetching queue status:', error);
      
      // Only show user-facing errors for actual network/server issues
      if (error.message.includes('Failed to fetch') || error.message.includes('HTTP 50')) {
        toast.error('Unable to connect to analysis service. Please try again.');
      }
      
      throw error;
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  // Auto-refresh with cleanup
  useEffect(() => {
    mountedRef.current = true;
    
    // Initial fetch
    fetchQueueStatus().catch(error => {
      console.log('Initial queue status fetch failed:', error.message);
    });
    
    // Set up auto-refresh with longer interval
    refreshIntervalRef.current = setInterval(() => {
      if (mountedRef.current) {
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
  }, []); // No dependencies to prevent re-initialization

  return {
    jobs,
    queueStats,
    isLoading,
    scheduleAnalysis,
    fetchQueueStatus,
  };
}

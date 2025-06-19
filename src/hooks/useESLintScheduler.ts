
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

// Simple request cache to prevent duplicate requests
const requestCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 3000; // 3 seconds cache

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
      
      console.log('Scheduling analysis with supabase.functions.invoke...');
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
        throw new Error(response.error.message || 'Failed to schedule analysis');
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
    const cacheKey = 'queue-status';
    const now = Date.now();
    
    // Check cache first
    const cached = requestCache.get(cacheKey);
    if (cached && now - cached.timestamp < CACHE_TTL) {
      console.log('Using cached queue status');
      setJobs(cached.data.jobs || []);
      setQueueStats(cached.data.stats || null);
      return cached.data;
    }

    try {
      setIsLoading(true);
      
      console.log('Fetching queue status with supabase.functions.invoke...');
      
      // Try different approaches to see which works
      let response;
      try {
        // First try: Use GET approach (no body)
        response = await supabase.functions.invoke('eslint-scheduler');
        console.log('GET response:', response);
      } catch (getError) {
        console.log('GET failed, trying POST with body:', getError);
        
        // Second try: Use POST with body
        response = await supabase.functions.invoke('eslint-scheduler', {
          body: { action: 'queue-status' }
        });
        console.log('POST response:', response);
      }

      if (response.error) {
        console.error('Queue status error:', response.error);
        throw new Error(response.error.message || 'Failed to fetch queue status');
      }

      const data = response.data;
      console.log('Queue status data:', data);

      // Cache the successful response
      requestCache.set(cacheKey, { data, timestamp: now });

      if (mountedRef.current) {
        setJobs(data.jobs || []);
        setQueueStats(data.stats || null);
      }
      
      return data;
    } catch (error: any) {
      console.error('Error fetching queue status:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      // Only show user-facing errors for actual issues, not abort errors
      if (!error.message.includes('aborted') && !error.message.includes('cancelled')) {
        toast.error(`Unable to fetch queue status: ${error.message}`);
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
    
    // Initial fetch with detailed error logging
    console.log('Starting initial queue status fetch...');
    fetchQueueStatus().catch(error => {
      console.log('Initial queue status fetch failed:', error.message);
    });
    
    // Set up auto-refresh with longer interval
    refreshIntervalRef.current = setInterval(() => {
      if (mountedRef.current) {
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
  }, []); // No dependencies to prevent re-initialization

  return {
    jobs,
    queueStats,
    isLoading,
    scheduleAnalysis,
    fetchQueueStatus,
  };
}

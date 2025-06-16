
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface LighthouseMonitoringConfig {
  id: string;
  project_id: string;
  configuration_id: string;
  urls: string[];
  schedule_interval: 'hourly' | 'daily' | 'weekly';
  schedule_time: string;
  is_active: boolean;
  performance_thresholds: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
    pwa: number;
  };
  alert_channels: string[];
  avoid_peak_hours: boolean;
  peak_hours_start: string;
  peak_hours_end: string;
  max_audits_per_day: number;
  retry_failed_audits: boolean;
  created_at: string;
  updated_at: string;
  last_run_at?: string;
  next_run_at?: string;
}

export interface LighthouseMonitoringRun {
  id: string;
  config_id: string;
  trigger_type: 'scheduled' | 'deployment' | 'manual' | 'threshold_breach';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  started_at?: string;
  completed_at?: string;
  total_urls: number;
  completed_urls: number;
  failed_urls: number;
  average_scores?: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
    pwa: number;
  };
  threshold_breaches: Array<{
    url: string;
    metric: string;
    current: number;
    threshold: number;
    severity: string;
  }>;
  deployment_context?: any;
  error_message?: string;
  created_at: string;
}

export interface LighthouseThresholdAlert {
  id: string;
  monitoring_run_id: string;
  url: string;
  metric_type: string;
  current_score: number;
  threshold_score: number;
  previous_score?: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  is_acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: string;
  resolved_at?: string;
  created_at: string;
}

export function useLighthouseMonitoring(projectId?: string) {
  const [configs, setConfigs] = useState<LighthouseMonitoringConfig[]>([]);
  const [runs, setRuns] = useState<LighthouseMonitoringRun[]>([]);
  const [alerts, setAlerts] = useState<LighthouseThresholdAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMonitoringConfigs = async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('lighthouse_monitoring_configs')
        .select('*')
        .order('created_at', { ascending: false });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      const transformedData: LighthouseMonitoringConfig[] = (data || []).map(item => ({
        id: item.id,
        project_id: item.project_id,
        configuration_id: item.configuration_id,
        urls: item.urls as string[],
        schedule_interval: item.schedule_interval as 'hourly' | 'daily' | 'weekly',
        schedule_time: item.schedule_time,
        is_active: item.is_active,
        performance_thresholds: item.performance_thresholds as any,
        alert_channels: item.alert_channels as string[],
        avoid_peak_hours: item.avoid_peak_hours,
        peak_hours_start: item.peak_hours_start,
        peak_hours_end: item.peak_hours_end,
        max_audits_per_day: item.max_audits_per_day,
        retry_failed_audits: item.retry_failed_audits,
        created_at: item.created_at,
        updated_at: item.updated_at,
        last_run_at: item.last_run_at,
        next_run_at: item.next_run_at,
      }));

      setConfigs(transformedData);
    } catch (error: any) {
      console.error('Error fetching monitoring configs:', error);
      toast.error('Failed to fetch monitoring configs');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMonitoringRuns = async () => {
    try {
      let query = supabase
        .from('lighthouse_monitoring_runs')
        .select(`
          *,
          lighthouse_monitoring_configs!inner(project_id)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (projectId) {
        query = query.eq('lighthouse_monitoring_configs.project_id', projectId);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      const transformedData: LighthouseMonitoringRun[] = (data || []).map(item => ({
        id: item.id,
        config_id: item.config_id,
        trigger_type: item.trigger_type as any,
        status: item.status as any,
        started_at: item.started_at,
        completed_at: item.completed_at,
        total_urls: item.total_urls,
        completed_urls: item.completed_urls,
        failed_urls: item.failed_urls,
        average_scores: item.average_scores as any,
        threshold_breaches: item.threshold_breaches as any,
        deployment_context: item.deployment_context,
        error_message: item.error_message,
        created_at: item.created_at,
      }));

      setRuns(transformedData);
    } catch (error: any) {
      console.error('Error fetching monitoring runs:', error);
      toast.error('Failed to fetch monitoring runs');
    }
  };

  const fetchThresholdAlerts = async () => {
    try {
      let query = supabase
        .from('lighthouse_threshold_alerts')
        .select(`
          *,
          lighthouse_monitoring_runs!inner(
            lighthouse_monitoring_configs!inner(project_id)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (projectId) {
        query = query.eq('lighthouse_monitoring_runs.lighthouse_monitoring_configs.project_id', projectId);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      const transformedData: LighthouseThresholdAlert[] = (data || []).map(item => ({
        id: item.id,
        monitoring_run_id: item.monitoring_run_id,
        url: item.url,
        metric_type: item.metric_type,
        current_score: item.current_score,
        threshold_score: item.threshold_score,
        previous_score: item.previous_score,
        severity: item.severity as any,
        is_acknowledged: item.is_acknowledged,
        acknowledged_by: item.acknowledged_by,
        acknowledged_at: item.acknowledged_at,
        resolved_at: item.resolved_at,
        created_at: item.created_at,
      }));

      setAlerts(transformedData);
    } catch (error: any) {
      console.error('Error fetching threshold alerts:', error);
      toast.error('Failed to fetch threshold alerts');
    }
  };

  useEffect(() => {
    fetchMonitoringConfigs();
    fetchMonitoringRuns();
    fetchThresholdAlerts();
  }, [projectId]);

  return {
    configs,
    runs,
    alerts,
    isLoading,
    refreshData: () => {
      fetchMonitoringConfigs();
      fetchMonitoringRuns();
      fetchThresholdAlerts();
    },
  };
}

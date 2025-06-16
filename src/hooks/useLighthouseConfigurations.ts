
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface LighthouseConfiguration {
  id: string;
  name: string;
  settings: {
    device: 'mobile' | 'desktop' | 'tablet';
    networkThrottling: '4G' | '3G' | '2G' | 'broadband' | 'offline';
    cpuThrottling: number;
    viewport: { width: number; height: number };
    performanceBudget?: {
      performance?: number;
      accessibility?: number;
      bestPractices?: number;
      seo?: number;
      pwa?: number;
    };
    customThresholds?: {
      firstContentfulPaint?: number;
      largestContentfulPaint?: number;
      firstInputDelay?: number;
      cumulativeLayoutShift?: number;
      speedIndex?: number;
      totalBlockingTime?: number;
    };
    authentication?: {
      enabled: boolean;
      headers?: Record<string, string>;
      cookies?: Array<{ name: string; value: string; domain?: string }>;
    };
  };
  audit_categories: string[];
  organization_id?: string;
  project_id?: string;
  is_default: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface LighthouseSchedule {
  id: string;
  configuration_id: string;
  project_id: string;
  urls: string[];
  frequency: 'manual' | 'daily' | 'weekly' | 'monthly';
  schedule_time?: string;
  is_active: boolean;
  last_run_at?: string;
  next_run_at?: string;
  created_at: string;
  updated_at: string;
}

export function useLighthouseConfigurations(projectId?: string, organizationId?: string) {
  const [configurations, setConfigurations] = useState<LighthouseConfiguration[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchConfigurations = async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('lighthouse_configurations')
        .select('*')
        .order('created_at', { ascending: false });

      if (projectId) {
        query = query.eq('project_id', projectId);
      } else if (organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      const transformedData: LighthouseConfiguration[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        settings: item.settings as LighthouseConfiguration['settings'],
        audit_categories: item.audit_categories as string[],
        organization_id: item.organization_id,
        project_id: item.project_id,
        is_default: item.is_default,
        created_by: item.created_by,
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));

      setConfigurations(transformedData);
    } catch (error: any) {
      console.error('Error fetching Lighthouse configurations:', error);
      toast.error('Failed to fetch Lighthouse configurations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigurations();
  }, [projectId, organizationId]);

  return {
    configurations,
    isLoading,
    refreshConfigurations: fetchConfigurations,
  };
}

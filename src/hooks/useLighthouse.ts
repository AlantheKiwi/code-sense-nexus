
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface LighthouseAuditRequest {
  url: string;
  device?: 'mobile' | 'desktop';
  projectId?: string;
  priority?: 'low' | 'normal' | 'high';
  configurationId?: string; // Add configuration support
}

interface LighthouseAudit {
  id: string;
  url: string;
  device: string;
  project_id: string | null;
  scores: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
    pwa: number;
  };
  metrics: {
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    firstInputDelay: number;
    cumulativeLayoutShift: number;
    speedIndex: number;
    totalBlockingTime: number;
  };
  opportunities: Array<{
    id: string;
    title: string;
    description: string;
    savings: number;
    displayValue: string;
  }>;
  diagnostics: Array<{
    id: string;
    title: string;
    description: string;
    score: number;
    displayValue: string;
  }>;
  created_at: string;
}

interface QueueItem {
  id: string;
  url: string;
  device: string;
  project_id: string | null;
  priority: 'low' | 'normal' | 'high';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
  result: any;
}

const startLighthouseAudit = async (request: LighthouseAuditRequest) => {
  const { data, error } = await supabase.functions.invoke('lighthouse-analysis', {
    body: request
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const startLighthouseAuditWithConfig = async (request: LighthouseAuditRequest & { configurationId: string }) => {
  // Fetch configuration first
  const { data: config, error: configError } = await supabase
    .from('lighthouse_configurations')
    .select('*')
    .eq('id', request.configurationId)
    .single();

  if (configError || !config) {
    throw new Error('Configuration not found');
  }

  // Combine request with configuration settings
  const auditRequest = {
    ...request,
    device: (config.settings as any).device,
    configuration: config.settings,
    auditCategories: config.audit_categories,
  };

  const { data, error } = await supabase.functions.invoke('lighthouse-analysis', {
    body: auditRequest
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const fetchLighthouseAudits = async (projectId?: string): Promise<LighthouseAudit[]> => {
  let query = supabase
    .from('lighthouse_audits')
    .select('*')
    .order('created_at', { ascending: false });

  if (projectId) {
    query = query.eq('project_id', projectId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  // Transform the database data to match our interface with proper type casting
  return (data || []).map(item => ({
    id: item.id,
    url: item.url,
    device: item.device as string,
    project_id: item.project_id,
    scores: item.scores as {
      performance: number;
      accessibility: number;
      bestPractices: number;
      seo: number;
      pwa: number;
    },
    metrics: item.metrics as {
      firstContentfulPaint: number;
      largestContentfulPaint: number;
      firstInputDelay: number;
      cumulativeLayoutShift: number;
      speedIndex: number;
      totalBlockingTime: number;
    },
    opportunities: (item.opportunities as any[]) || [],
    diagnostics: (item.diagnostics as any[]) || [],
    created_at: item.created_at,
  }));
};

const fetchQueueStatus = async (projectId?: string) => {
  const { data, error } = await supabase.functions.invoke('lighthouse-queue', {
    method: 'GET',
    body: projectId ? { projectId } : {}
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const useLighthouseAudit = () => {
  return useMutation({
    mutationFn: startLighthouseAudit,
  });
};

export const useLighthouseAuditWithConfig = () => {
  return useMutation({
    mutationFn: startLighthouseAuditWithConfig,
  });
};

export const useLighthouseAudits = (projectId?: string) => {
  return useQuery({
    queryKey: ['lighthouse-audits', projectId],
    queryFn: () => fetchLighthouseAudits(projectId),
  });
};

export const useLighthouseQueue = (projectId?: string) => {
  return useQuery({
    queryKey: ['lighthouse-queue', projectId],
    queryFn: () => fetchQueueStatus(projectId),
    refetchInterval: 5000, // Poll every 5 seconds
  });
};

export type { LighthouseAuditRequest, LighthouseAudit, QueueItem };


import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface LighthouseRecommendationTemplate {
  id: string;
  name: string;
  project_type: string;
  audit_rule: string;
  category: 'performance' | 'accessibility' | 'best-practices' | 'seo' | 'pwa';
  title: string;
  description: string;
  fix_template: string;
  implementation_difficulty: 'easy' | 'medium' | 'hard';
  estimated_time_hours: number;
  tools_integration: string[];
  prerequisites: string[];
  expected_impact: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LighthouseRecommendation {
  id: string;
  audit_id: string;
  project_id: string;
  template_id?: string;
  url: string;
  audit_rule: string;
  category: 'performance' | 'accessibility' | 'best-practices' | 'seo' | 'pwa';
  title: string;
  description: string;
  fix_suggestion: string;
  implementation_code?: string;
  priority_score: number;
  difficulty_level: 'easy' | 'medium' | 'hard';
  estimated_time_hours: number;
  estimated_savings_ms: number;
  cost_benefit_score: number;
  current_value?: number;
  target_value?: number;
  tool_integrations: string[];
  is_automated: boolean;
  status: 'pending' | 'in_progress' | 'completed' | 'dismissed' | 'not_applicable';
  implemented_at?: string;
  dismissed_at?: string;
  dismissed_reason?: string;
  verification_audit_id?: string;
  created_at: string;
  updated_at: string;
}

export interface LighthouseRecommendationProgress {
  id: string;
  recommendation_id: string;
  project_id: string;
  status_changed_by?: string;
  old_status?: string;
  new_status: string;
  notes?: string;
  time_spent_hours: number;
  before_metrics?: Record<string, any>;
  after_metrics?: Record<string, any>;
  tools_used: string[];
  created_at: string;
}

export interface LighthouseRecommendationBatch {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  audit_ids: string[];
  total_recommendations: number;
  completed_recommendations: number;
  estimated_total_hours: number;
  actual_total_hours: number;
  expected_savings_ms: number;
  actual_savings_ms: number;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  created_by?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface LighthouseToolIntegration {
  id: string;
  project_id: string;
  tool_name: string;
  tool_category: string;
  configuration: Record<string, any>;
  api_credentials?: Record<string, any>;
  is_active: boolean;
  last_used_at?: string;
  success_rate: number;
  created_at: string;
  updated_at: string;
}

// Helper function to safely cast database types to our interfaces
const castRecommendation = (data: any): LighthouseRecommendation => ({
  ...data,
  category: data.category as LighthouseRecommendation['category'],
  difficulty_level: data.difficulty_level as LighthouseRecommendation['difficulty_level'],
  status: data.status as LighthouseRecommendation['status'],
  tool_integrations: Array.isArray(data.tool_integrations) ? data.tool_integrations : [],
});

const castTemplate = (data: any): LighthouseRecommendationTemplate => ({
  ...data,
  category: data.category as LighthouseRecommendationTemplate['category'],
  implementation_difficulty: data.implementation_difficulty as LighthouseRecommendationTemplate['implementation_difficulty'],
  tools_integration: Array.isArray(data.tools_integration) ? data.tools_integration : [],
  prerequisites: Array.isArray(data.prerequisites) ? data.prerequisites : [],
  expected_impact: typeof data.expected_impact === 'object' && data.expected_impact !== null ? data.expected_impact : {},
});

const castBatch = (data: any): LighthouseRecommendationBatch => ({
  ...data,
  status: data.status as LighthouseRecommendationBatch['status'],
  audit_ids: Array.isArray(data.audit_ids) ? data.audit_ids : [],
});

const castToolIntegration = (data: any): LighthouseToolIntegration => ({
  ...data,
  configuration: typeof data.configuration === 'object' && data.configuration !== null ? data.configuration : {},
  api_credentials: typeof data.api_credentials === 'object' && data.api_credentials !== null ? data.api_credentials : undefined,
});

export function useLighthouseRecommendations(projectId?: string) {
  const [recommendations, setRecommendations] = useState<LighthouseRecommendation[]>([]);
  const [templates, setTemplates] = useState<LighthouseRecommendationTemplate[]>([]);
  const [batches, setBatches] = useState<LighthouseRecommendationBatch[]>([]);
  const [toolIntegrations, setToolIntegrations] = useState<LighthouseToolIntegration[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRecommendations = async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('lighthouse_recommendations')
        .select('*')
        .order('priority_score', { ascending: false });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      setRecommendations((data || []).map(castRecommendation));
    } catch (error: any) {
      console.error('Error fetching recommendations:', error);
      toast.error('Failed to fetch recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('lighthouse_recommendation_templates')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      setTemplates((data || []).map(castTemplate));
    } catch (error: any) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to fetch recommendation templates');
    }
  };

  const fetchBatches = async () => {
    try {
      if (!projectId) return;

      const { data, error } = await supabase
        .from('lighthouse_recommendation_batches')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      setBatches((data || []).map(castBatch));
    } catch (error: any) {
      console.error('Error fetching batches:', error);
      toast.error('Failed to fetch recommendation batches');
    }
  };

  const fetchToolIntegrations = async () => {
    try {
      if (!projectId) return;

      const { data, error } = await supabase
        .from('lighthouse_tool_integrations')
        .select('*')
        .eq('project_id', projectId)
        .order('tool_category', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      setToolIntegrations((data || []).map(castToolIntegration));
    } catch (error: any) {
      console.error('Error fetching tool integrations:', error);
      toast.error('Failed to fetch tool integrations');
    }
  };

  useEffect(() => {
    fetchRecommendations();
    fetchTemplates();
    fetchBatches();
    fetchToolIntegrations();
  }, [projectId]);

  return {
    recommendations,
    templates,
    batches,
    toolIntegrations,
    isLoading,
    refreshData: () => {
      fetchRecommendations();
      fetchTemplates();
      fetchBatches();
      fetchToolIntegrations();
    },
  };
}

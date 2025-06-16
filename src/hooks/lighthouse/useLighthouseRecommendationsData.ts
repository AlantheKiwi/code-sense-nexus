
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  LighthouseRecommendation,
  LighthouseRecommendationTemplate,
  LighthouseRecommendationBatch,
  LighthouseToolIntegration
} from './types';
import { 
  castRecommendation,
  castTemplate,
  castBatch,
  castToolIntegration
} from './castingUtils';

export function useLighthouseRecommendationsData(projectId?: string) {
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

  const refreshData = () => {
    fetchRecommendations();
    fetchTemplates();
    fetchBatches();
    fetchToolIntegrations();
  };

  return {
    recommendations,
    templates,
    batches,
    toolIntegrations,
    isLoading,
    refreshData,
  };
}

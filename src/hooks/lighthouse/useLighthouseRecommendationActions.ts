
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LighthouseRecommendationBatch, LighthouseToolIntegration } from './types';

export function useLighthouseRecommendationActions() {
  const generateRecommendations = async (auditId: string, projectId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('lighthouse-recommendation-engine', {
        body: {
          action: 'generate_recommendations',
          auditId,
          projectId,
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      toast.success('Recommendations generated successfully');
      return data;
    } catch (error: any) {
      console.error('Error generating recommendations:', error);
      toast.error('Failed to generate recommendations');
      throw error;
    }
  };

  const updateRecommendationStatus = async (
    recommendationId: string, 
    status: 'pending' | 'in_progress' | 'completed' | 'dismissed' | 'not_applicable',
    notes?: string,
    timeSpentHours?: number
  ) => {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === 'completed') {
        updateData.implemented_at = new Date().toISOString();
      } else if (status === 'dismissed') {
        updateData.dismissed_at = new Date().toISOString();
        if (notes) {
          updateData.dismissed_reason = notes;
        }
      }

      const { data, error } = await supabase
        .from('lighthouse_recommendations')
        .update(updateData)
        .eq('id', recommendationId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Log progress
      await supabase
        .from('lighthouse_recommendation_progress')
        .insert({
          recommendation_id: recommendationId,
          project_id: data.project_id,
          old_status: data.status,
          new_status: status,
          notes,
          time_spent_hours: timeSpentHours || 0,
        });

      toast.success('Recommendation status updated successfully');
      return data;
    } catch (error: any) {
      console.error('Error updating recommendation status:', error);
      toast.error('Failed to update recommendation status');
      throw error;
    }
  };

  const createRecommendationBatch = async (batchData: Partial<LighthouseRecommendationBatch>) => {
    try {
      const { data, error } = await supabase
        .from('lighthouse_recommendation_batches')
        .insert({
          project_id: batchData.project_id,
          name: batchData.name,
          description: batchData.description,
          audit_ids: batchData.audit_ids,
          total_recommendations: batchData.total_recommendations || 0,
          estimated_total_hours: batchData.estimated_total_hours || 0,
          expected_savings_ms: batchData.expected_savings_ms || 0,
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      toast.success('Recommendation batch created successfully');
      return data;
    } catch (error: any) {
      console.error('Error creating recommendation batch:', error);
      toast.error('Failed to create recommendation batch');
      throw error;
    }
  };

  const updateBatchStatus = async (batchId: string, status: 'planned' | 'in_progress' | 'completed' | 'cancelled') => {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === 'in_progress') {
        updateData.started_at = new Date().toISOString();
      } else if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('lighthouse_recommendation_batches')
        .update(updateData)
        .eq('id', batchId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      toast.success('Batch status updated successfully');
      return data;
    } catch (error: any) {
      console.error('Error updating batch status:', error);
      toast.error('Failed to update batch status');
      throw error;
    }
  };

  const createToolIntegration = async (integrationData: Partial<LighthouseToolIntegration>) => {
    try {
      const { data, error } = await supabase
        .from('lighthouse_tool_integrations')
        .insert({
          project_id: integrationData.project_id,
          tool_name: integrationData.tool_name,
          tool_category: integrationData.tool_category,
          configuration: integrationData.configuration || {},
          api_credentials: integrationData.api_credentials,
          is_active: integrationData.is_active ?? true,
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      toast.success('Tool integration created successfully');
      return data;
    } catch (error: any) {
      console.error('Error creating tool integration:', error);
      toast.error('Failed to create tool integration');
      throw error;
    }
  };

  const updateToolIntegration = async (integrationId: string, integrationData: Partial<LighthouseToolIntegration>) => {
    try {
      const { data, error } = await supabase
        .from('lighthouse_tool_integrations')
        .update({
          tool_name: integrationData.tool_name,
          tool_category: integrationData.tool_category,
          configuration: integrationData.configuration,
          api_credentials: integrationData.api_credentials,
          is_active: integrationData.is_active,
        })
        .eq('id', integrationId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      toast.success('Tool integration updated successfully');
      return data;
    } catch (error: any) {
      console.error('Error updating tool integration:', error);
      toast.error('Failed to update tool integration');
      throw error;
    }
  };

  const executeAutomatedFix = async (recommendationId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('lighthouse-recommendation-engine', {
        body: {
          action: 'execute_automated_fix',
          recommendationId,
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      toast.success('Automated fix executed successfully');
      return data;
    } catch (error: any) {
      console.error('Error executing automated fix:', error);
      toast.error('Failed to execute automated fix');
      throw error;
    }
  };

  const analyzeCostBenefit = async (recommendationIds: string[]) => {
    try {
      const { data, error } = await supabase.functions.invoke('lighthouse-recommendation-engine', {
        body: {
          action: 'analyze_cost_benefit',
          recommendationIds,
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error: any) {
      console.error('Error analyzing cost-benefit:', error);
      toast.error('Failed to analyze cost-benefit');
      throw error;
    }
  };

  return {
    generateRecommendations,
    updateRecommendationStatus,
    createRecommendationBatch,
    updateBatchStatus,
    createToolIntegration,
    updateToolIntegration,
    executeAutomatedFix,
    analyzeCostBenefit,
  };
}

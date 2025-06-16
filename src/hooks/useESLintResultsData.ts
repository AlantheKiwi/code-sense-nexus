
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ESLintProjectSummary, ESLintTrend, ESLintCriticalAlert, ESLintFixSuggestion } from './useESLintResults';

export function useESLintResultsData() {
  const [summary, setSummary] = useState<ESLintProjectSummary | null>(null);
  const [trends, setTrends] = useState<ESLintTrend[]>([]);
  const [alerts, setAlerts] = useState<ESLintCriticalAlert[]>([]);
  const [fixSuggestions, setFixSuggestions] = useState<ESLintFixSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchProjectSummary = async (projectId: string) => {
    try {
      setIsLoading(true);
      const response = await supabase.functions.invoke('eslint-results-processor', {
        method: 'GET',
        body: null,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setSummary(response.data.summary);
      return response.data.summary;
    } catch (error: any) {
      console.error('Error fetching project summary:', error);
      toast.error('Failed to fetch project summary');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProjectTrends = async (projectId: string, days: number = 30) => {
    try {
      const response = await supabase.functions.invoke('eslint-results-processor', {
        method: 'GET',
        body: null,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setTrends(response.data.trends);
      return response.data.trends;
    } catch (error: any) {
      console.error('Error fetching project trends:', error);
      toast.error('Failed to fetch project trends');
      throw error;
    }
  };

  const fetchCriticalAlerts = async (projectId: string) => {
    try {
      const response = await supabase.functions.invoke('eslint-results-processor', {
        method: 'GET',
        body: null,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setAlerts(response.data.alerts);
      return response.data.alerts;
    } catch (error: any) {
      console.error('Error fetching critical alerts:', error);
      toast.error('Failed to fetch critical alerts');
      throw error;
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      const response = await supabase.functions.invoke('eslint-results-processor', {
        method: 'POST',
        body: null,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      // Update local state
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, is_resolved: true, resolved_at: new Date().toISOString() }
          : alert
      ));

      toast.success('Alert resolved successfully');
      return response.data.alert;
    } catch (error: any) {
      console.error('Error resolving alert:', error);
      toast.error('Failed to resolve alert');
      throw error;
    }
  };

  const fetchFixSuggestions = async (resultId: string) => {
    try {
      const response = await supabase.functions.invoke('eslint-results-processor', {
        method: 'GET',
        body: null,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setFixSuggestions(response.data.suggestions);
      return response.data.suggestions;
    } catch (error: any) {
      console.error('Error fetching fix suggestions:', error);
      toast.error('Failed to fetch fix suggestions');
      throw error;
    }
  };

  return {
    summary,
    trends,
    alerts,
    fixSuggestions,
    isLoading,
    fetchProjectSummary,
    fetchProjectTrends,
    fetchCriticalAlerts,
    resolveAlert,
    fetchFixSuggestions,
  };
}

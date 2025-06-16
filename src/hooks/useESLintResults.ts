
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ESLintIssue {
  ruleId: string;
  severity: number;
  message: string;
  line: number;
  column: number;
  category: 'code_quality' | 'potential_bugs' | 'style_violations' | 'security';
}

export interface ESLintResult {
  id: string;
  project_id: string;
  file_path: string;
  issues: ESLintIssue[];
  severity_counts: {
    error: number;
    warn: number;
    info: number;
  };
  quality_score: number;
  total_issues: number;
  configuration_used?: string;
  created_at: string;
  updated_at: string;
}

export interface ESLintProjectSummary {
  id: string;
  project_id: string;
  total_files: number;
  total_issues: number;
  severity_counts: {
    error: number;
    warn: number;
    info: number;
  };
  category_counts: {
    code_quality: number;
    potential_bugs: number;
    style_violations: number;
    security: number;
  };
  average_quality_score: number;
  last_analysis_at: string;
}

export interface ESLintTrend {
  id: string;
  project_id: string;
  analysis_date: string;
  total_issues: number;
  severity_counts: Record<string, number>;
  category_counts: Record<string, number>;
  quality_score: number;
  files_analyzed: number;
  created_at: string;
}

export interface ESLintCriticalAlert {
  id: string;
  project_id: string;
  result_id: string;
  alert_type: string;
  message: string;
  file_path: string;
  line_number?: number;
  rule_id?: string;
  is_resolved: boolean;
  resolved_at?: string;
  resolved_by?: string;
  created_at: string;
}

export interface ESLintFixSuggestion {
  id: string;
  result_id: string;
  rule_id: string;
  issue_description: string;
  fix_description: string;
  code_example?: string;
  fixed_code_example?: string;
  difficulty_level: 'easy' | 'medium' | 'hard';
  estimated_time_minutes?: number;
  category: 'code_quality' | 'potential_bugs' | 'style_violations' | 'security';
  priority: number;
  created_at: string;
}

export function useESLintResults() {
  const [results, setResults] = useState<ESLintResult[]>([]);
  const [summary, setSummary] = useState<ESLintProjectSummary | null>(null);
  const [trends, setTrends] = useState<ESLintTrend[]>([]);
  const [alerts, setAlerts] = useState<ESLintCriticalAlert[]>([]);
  const [fixSuggestions, setFixSuggestions] = useState<ESLintFixSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const processResults = async (projectId: string, results: any[], configurationId?: string) => {
    try {
      setIsLoading(true);
      const response = await supabase.functions.invoke('eslint-results-processor', {
        body: {
          project_id: projectId,
          results,
          configuration_id: configurationId,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast.success(`Processed ${response.data.processed_files} files with ${response.data.total_issues} issues`);
      
      if (response.data.critical_alerts > 0) {
        toast.warning(`${response.data.critical_alerts} critical issues found!`, {
          duration: 5000,
        });
      }

      return response.data;
    } catch (error: any) {
      console.error('Error processing ESLint results:', error);
      toast.error('Failed to process ESLint results');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

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

  const fetchProjectResults = async (projectId: string, limit: number = 50) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('eslint_results')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(error.message);
      }

      // Transform the data to match our interface
      const transformedResults: ESLintResult[] = (data || []).map(item => ({
        id: item.id,
        project_id: item.project_id,
        file_path: item.file_path,
        issues: Array.isArray(item.issues) ? item.issues as ESLintIssue[] : [],
        severity_counts: typeof item.severity_counts === 'object' && item.severity_counts !== null 
          ? item.severity_counts as { error: number; warn: number; info: number; }
          : { error: 0, warn: 0, info: 0 },
        quality_score: item.quality_score || 0,
        total_issues: item.total_issues,
        configuration_used: item.configuration_used || undefined,
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));

      setResults(transformedResults);
      return transformedResults;
    } catch (error: any) {
      console.error('Error fetching project results:', error);
      toast.error('Failed to fetch ESLint results');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    results,
    summary,
    trends,
    alerts,
    fixSuggestions,
    isLoading,
    processResults,
    fetchProjectSummary,
    fetchProjectTrends,
    fetchCriticalAlerts,
    resolveAlert,
    fetchFixSuggestions,
    fetchProjectResults,
  };
}

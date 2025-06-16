
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

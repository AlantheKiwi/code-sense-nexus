
import { 
  LighthouseRecommendation,
  LighthouseRecommendationTemplate,
  LighthouseRecommendationBatch,
  LighthouseToolIntegration
} from './types';

export const castRecommendation = (data: any): LighthouseRecommendation => ({
  ...data,
  category: data.category as LighthouseRecommendation['category'],
  difficulty_level: data.difficulty_level as LighthouseRecommendation['difficulty_level'],
  status: data.status as LighthouseRecommendation['status'],
  tool_integrations: Array.isArray(data.tool_integrations) ? data.tool_integrations : [],
});

export const castTemplate = (data: any): LighthouseRecommendationTemplate => ({
  ...data,
  category: data.category as LighthouseRecommendationTemplate['category'],
  implementation_difficulty: data.implementation_difficulty as LighthouseRecommendationTemplate['implementation_difficulty'],
  tools_integration: Array.isArray(data.tools_integration) ? data.tools_integration : [],
  prerequisites: Array.isArray(data.prerequisites) ? data.prerequisites : [],
  expected_impact: typeof data.expected_impact === 'object' && data.expected_impact !== null ? data.expected_impact : {},
});

export const castBatch = (data: any): LighthouseRecommendationBatch => ({
  ...data,
  status: data.status as LighthouseRecommendationBatch['status'],
  audit_ids: Array.isArray(data.audit_ids) ? data.audit_ids : [],
});

export const castToolIntegration = (data: any): LighthouseToolIntegration => ({
  ...data,
  configuration: typeof data.configuration === 'object' && data.configuration !== null ? data.configuration : {},
  api_credentials: typeof data.api_credentials === 'object' && data.api_credentials !== null ? data.api_credentials : undefined,
});

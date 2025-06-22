
export interface LLMProvider {
  id: string;
  name: string;
  description: string;
  costPerRequest: number;
  estimatedTimeMs: number;
  strengths: string[];
  modelVersion: string;
}

export interface AnalysisRequest {
  code: string;
  analysisType: 'code_quality' | 'architecture' | 'security' | 'performance' | 'lovable_prompt';
  fileType?: string;
  projectContext?: string;
}

export interface AnalysisResult {
  provider: string;
  analysisType: string;
  result: {
    summary: string;
    issues: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      lineNumber?: number;
      suggestion: string;
      codeExample?: string;
    }>;
    recommendations: string[];
    score: number;
    estimatedFixTime?: string;
  };
  usage: {
    tokensUsed: number;
    costInCredits: number;
    processingTimeMs: number;
  };
  timestamp: string;
}

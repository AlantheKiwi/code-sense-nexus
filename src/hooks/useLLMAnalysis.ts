import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { llmGateway } from '@/services/ai/LLMGateway';
import { toast } from 'sonner';

interface AnalysisRequest {
  code: string;
  analysisType: string;
  projectId?: string;
}

interface AnalysisResult {
  id: string;
  analysisType: string;
  provider: string;
  result: {
    summary: string;
    score?: number;
    issues?: Array<{
      type: string;
      severity: string;
      description: string;
      suggestion?: string;
      lineNumber?: number;
    }>;
    recommendations: string[];
    estimatedFixTime?: string;
  };
  usage: {
    tokensUsed: number;
    processingTimeMs: number;
    costInCredits: number;
  };
  timestamp: string;
}

export function useLLMAnalysis() {
  const { user } = useAuth();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisResult[]>([]);
  const [userCredits, setUserCredits] = useState(100); // Mock credits for demo

  const loadUserCredits = useCallback(async () => {
    if (!user?.id) return;
    
    // In a real app, load from credits table
    console.log('Loading user credits...');
    setUserCredits(100); // Mock value
  }, [user?.id]);

  const analyzeWithLLM = useCallback(async (
    provider: string, 
    request: AnalysisRequest
  ) => {
    if (!user?.id) {
      toast.error('Please log in to use AI analysis');
      return;
    }

    if (!request.code.trim()) {
      toast.error('Please provide code to analyze');
      return;
    }

    setIsAnalyzing(true);
    setCurrentAnalysis(null);

    try {
      console.log(`Starting ${provider} analysis...`);

      // Use the real LLM gateway
      const llmRequest = {
        code: request.code,
        analysisType: request.analysisType,
        projectContext: request.projectId
      };

      const result = await llmGateway.analyzeWithProvider(provider, llmRequest, user.id);

      // Transform the response to match our interface
      const analysisResult: AnalysisResult = {
        id: `analysis_${Date.now()}`,
        analysisType: request.analysisType,
        provider: provider,
        result: {
          summary: result.result.summary || 'Analysis completed',
          score: result.result.score,
          issues: result.result.issues?.map((issue: any) => ({
            type: issue.type || 'General',
            severity: issue.severity as 'critical' | 'high' | 'medium' | 'low',
            description: issue.description || issue.issue,
            suggestion: issue.suggestion || 'No specific suggestion available',
            lineNumber: issue.lineNumber || issue.line
          })) || [],
          recommendations: result.result.recommendations || [],
          estimatedFixTime: result.result.estimatedFixTime || `${Math.max(5, (result.result.issues?.length || 0) * 10)} minutes`
        },
        usage: result.usage,
        timestamp: result.timestamp
      };

      // Update state
      setCurrentAnalysis(analysisResult);
      setAnalysisHistory(prev => [analysisResult, ...prev.slice(0, 9)]); // Keep last 10
      setUserCredits(prev => Math.max(0, prev - result.usage.costInCredits));

      toast.success(`Analysis completed with ${provider}!`);
      console.log('Analysis result:', analysisResult);

    } catch (error: any) {
      console.error('LLM Analysis error:', error);
      toast.error(`Analysis failed: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  }, [user?.id]);

  const clearAnalysis = useCallback(() => {
    setCurrentAnalysis(null);
  }, []);

  return {
    isAnalyzing,
    currentAnalysis,
    analysisHistory,
    userCredits,
    analyzeWithLLM,
    clearAnalysis,
    loadUserCredits
  };
}

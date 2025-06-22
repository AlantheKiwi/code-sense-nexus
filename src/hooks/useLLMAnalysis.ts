
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
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

      const { data, error } = await supabase.functions.invoke('ai-code-analysis', {
        body: {
          projectId: request.projectId || 'demo-project',
          code: request.code,
          analysisType: request.analysisType
        }
      });

      if (error) throw error;

      // Transform the response to match our interface
      const result: AnalysisResult = {
        id: `analysis_${Date.now()}`,
        analysisType: request.analysisType,
        provider: provider,
        result: {
          summary: data.summary || 'Analysis completed',
          score: data.quality_score,
          issues: [
            ...(data.bugs || []).map((bug: any) => ({
              type: 'Bug',
              severity: 'high',
              description: bug.issue,
              suggestion: bug.suggestion,
              lineNumber: bug.line
            })),
            ...(data.improvements || []).map((imp: any) => ({
              type: 'Improvement',
              severity: 'medium',
              description: imp.issue,
              suggestion: imp.suggestion,
              lineNumber: imp.line
            }))
          ],
          recommendations: [
            ...(data.bugs || []).map((bug: any) => bug.suggestion),
            ...(data.improvements || []).map((imp: any) => imp.suggestion)
          ],
          estimatedFixTime: `${Math.max(5, (data.bugs?.length || 0) * 10)} minutes`
        },
        usage: {
          tokensUsed: Math.floor(request.code.length / 4), // Rough estimate
          processingTimeMs: Math.floor(Math.random() * 3000) + 1000,
          costInCredits: 1
        },
        timestamp: new Date().toISOString()
      };

      // Update state
      setCurrentAnalysis(result);
      setAnalysisHistory(prev => [result, ...prev.slice(0, 9)]); // Keep last 10
      setUserCredits(prev => prev - 1);

      toast.success(`Analysis completed with ${provider}!`);
      console.log('Analysis result:', result);

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

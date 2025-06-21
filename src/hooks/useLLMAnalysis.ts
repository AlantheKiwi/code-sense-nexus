
import { useState, useCallback } from 'react';
import { llmGateway, type AnalysisRequest, type AnalysisResult } from '@/services/ai/LLMGateway';
import { creditsManager } from '@/services/ai/CreditsManager';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function useLLMAnalysis() {
  const { user } = useAuth();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisResult[]>([]);
  const [userCredits, setUserCredits] = useState(0);

  const loadUserCredits = useCallback(async () => {
    if (!user?.id) return;
    
    const credits = await creditsManager.getUserCredits(user.id);
    setUserCredits(credits);
  }, [user?.id]);

  const analyzeWithLLM = useCallback(async (
    provider: string, 
    request: AnalysisRequest
  ) => {
    if (!user?.id) {
      toast.error('Please log in to use AI analysis');
      return;
    }

    setIsAnalyzing(true);
    setCurrentAnalysis(null);

    try {
      // Check if user has enough credits
      const currentCredits = await creditsManager.getUserCredits(user.id);
      const requiredCredits = llmGateway.getProviderCost(provider);
      
      if (currentCredits < requiredCredits) {
        toast.error(`Insufficient credits. You need ${requiredCredits} credits for this analysis.`);
        return;
      }

      // Perform the analysis
      const result = await llmGateway.analyzeWithProvider(provider, request, user.id);

      // Deduct credits
      const success = await creditsManager.deductCredits(
        user.id,
        result.usage.costInCredits,
        `${provider} analysis - ${request.analysisType}`,
        {
          provider,
          analysisType: request.analysisType,
          tokensUsed: result.usage.tokensUsed,
          processingTimeMs: result.usage.processingTimeMs
        }
      );

      if (!success) {
        toast.error('Failed to process payment. Please try again.');
        return;
      }

      // Update state
      setCurrentAnalysis(result);
      setAnalysisHistory(prev => [result, ...prev.slice(0, 9)]); // Keep last 10
      setUserCredits(prev => prev - result.usage.costInCredits);

      toast.success(`Analysis completed with ${provider}!`);

    } catch (error) {
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

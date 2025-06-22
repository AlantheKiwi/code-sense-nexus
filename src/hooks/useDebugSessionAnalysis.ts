
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useAnalysisTrigger } from './useAnalysisTrigger';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { toast } from 'sonner';

export const useDebugSessionAnalysis = (sessionId: string | undefined) => {
  const [result, setResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { track } = useAnalytics();
  const { triggerAnalysis, isTriggering } = useAnalysisTrigger();
  const { checkUsageLimit, incrementUsage } = useUsageTracking();

  const handleAnalyzeCode = async (selectedTools: string[], code: string, broadcastEvent: (event: any) => void) => {
    setIsAnalyzing(true);
    setResult(null);
    
    track('code_analysis_started', { 
      sessionId, 
      selectedTools,
      toolCount: selectedTools.length 
    });

    try {
      // Check if analysis is allowed (considers credits and limits)
      const usageCheck = await checkUsageLimit('basic');
      
      if (!usageCheck.allowed) {
        toast.error(usageCheck.reason || 'Analysis not allowed. Please check your subscription or credits.');
        setIsAnalyzing(false);
        return;
      }

      console.log('Usage check passed:', usageCheck);

      // Increment usage before running analysis
      const usageIncremented = await incrementUsage('basic');
      if (!usageIncremented) {
        toast.error('Failed to track usage. Please try again.');
        setIsAnalyzing(false);
        return;
      }

      console.log('Running eslint-analysis with tools:', selectedTools);
      console.log('Code length:', code.length);
      
      // Use the eslint-analysis function with proper error handling
      const { data, error } = await supabase.functions.invoke('eslint-analysis', {
        body: { 
          code, 
          selectedTools: selectedTools || [],
          config: {
            rules: {},
            extends: ['eslint:recommended']
          }
        },
      });

      console.log('Raw response from edge function:', { data, error });

      if (error) {
        console.error('ESLint analysis error:', error);
        throw new Error(`Analysis failed: ${error.message || JSON.stringify(error)}`);
      }

      if (!data) {
        console.error('No data returned from edge function');
        throw new Error('No data returned from analysis function');
      }
      
      // Check if the response indicates an error (even with 200 status)
      if (data.success === false && data.error) {
        console.error('Edge function returned error:', data.error);
        throw new Error(`Analysis failed: ${data.error}`);
      }
      
      console.log('ESLint analysis completed successfully:', data);
      
      const newResult = { 
        ...data, 
        timestamp: new Date().toISOString(),
        analyzedTools: selectedTools,
        sessionId
      };
      
      setResult(newResult);
      broadcastEvent({ type: 'EXECUTION_RESULT', payload: newResult });
      
      track('code_analysis_completed', { 
        sessionId, 
        selectedTools,
        toolCount: selectedTools.length,
        success: true, 
        issueCount: data.analysis?.issues?.length || 0
      });

      toast.success('Analysis completed successfully!');

    } catch (e: any) {
      console.error('Analysis failed with error:', e);
      
      // Provide more specific error messages
      let errorMessage = 'Analysis failed';
      if (e.message) {
        errorMessage = e.message;
      } else if (typeof e === 'string') {
        errorMessage = e;
      }
      
      // Check if it's a network error
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('TypeError: Failed to fetch')) {
        errorMessage = 'Network connection error. Please check your internet connection and try again.';
      }
      
      const newError = { 
        error: errorMessage, 
        timestamp: new Date().toISOString(),
        analyzedTools: selectedTools,
        details: e.details || e.stack || 'No additional details available',
        isNetworkError: errorMessage.includes('Network connection error')
      };
      
      setResult(newError);
      broadcastEvent({ type: 'EXECUTION_RESULT', payload: newError });
      
      track('code_analysis_completed', { 
        sessionId, 
        selectedTools,
        toolCount: selectedTools.length,
        success: false,
        error: errorMessage
      });
      
      toast.error(`Analysis failed: ${errorMessage}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    result,
    isAnalyzing: isAnalyzing || isTriggering,
    handleAnalyzeCode,
    setResult
  };
};


import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAnalytics } from '@/hooks/useAnalytics';

export const useDebugSessionAnalysis = (sessionId: string | undefined) => {
  const [result, setResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { track } = useAnalytics();

  const handleAnalyzeCode = async (selectedTools: string[], code: string, broadcastEvent: (event: any) => void) => {
    setIsAnalyzing(true);
    setResult(null);
    track('code_analysis_started', { 
      sessionId, 
      selectedTools,
      toolCount: selectedTools.length 
    });
    
    try {
      const { data, error } = await supabase.functions.invoke('eslint-analysis', {
        body: { code, selectedTools },
      });

      if (error) throw error;
      
      const newResult = { 
        ...data, 
        timestamp: new Date().toISOString(),
        analyzedTools: selectedTools 
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

    } catch (e: any) {
      const newError = { 
        error: e.message, 
        timestamp: new Date().toISOString(),
        analyzedTools: selectedTools 
      };
      setResult(newError);
      broadcastEvent({ type: 'EXECUTION_RESULT', payload: newError });
      track('code_analysis_completed', { 
        sessionId, 
        selectedTools,
        toolCount: selectedTools.length,
        success: false 
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    result,
    isAnalyzing,
    handleAnalyzeCode,
    setResult
  };
};


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

      // If we have a session ID, try to use the scheduler for better tracking
      if (sessionId) {
        console.log('Using scheduler for analysis with session:', sessionId);
        
        const job = await triggerAnalysis(sessionId, code, selectedTools);
        
        if (job) {
          // For now, also run the direct analysis for immediate feedback
          // In the future, we could wait for the scheduled job to complete
          const { data, error } = await supabase.functions.invoke('eslint-analysis', {
            body: { code, selectedTools },
          });

          if (error) throw error;
          
          const newResult = { 
            ...data, 
            timestamp: new Date().toISOString(),
            analyzedTools: selectedTools,
            jobId: job.id
          };
          
          setResult(newResult);
          broadcastEvent({ type: 'EXECUTION_RESULT', payload: newResult });
          
          track('code_analysis_completed', { 
            sessionId, 
            selectedTools,
            toolCount: selectedTools.length,
            success: true, 
            issueCount: data.analysis?.issues?.length || 0,
            jobId: job.id
          });

          toast.success('Analysis completed successfully!');
        } else {
          throw new Error('Failed to schedule analysis');
        }
      } else {
        // Fallback to direct analysis if no session
        console.log('Using direct analysis (no session)');
        
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

        toast.success('Analysis completed successfully!');
      }

    } catch (e: any) {
      console.error('Analysis failed:', e);
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
      toast.error(`Analysis failed: ${e.message}`);
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


import { useState } from 'react';
import { useESLintScheduler } from './useESLintScheduler';
import { toast } from 'sonner';

export function useAnalysisTrigger() {
  const [isTriggering, setIsTriggering] = useState(false);
  const { scheduleAnalysis } = useESLintScheduler();

  const triggerAnalysis = async (
    projectId: string,
    code: string,
    selectedTools: string[],
    triggerType: 'manual' | 'scheduled' | 'git_commit' | 'file_upload' = 'manual'
  ) => {
    if (!projectId) {
      toast.error('Project ID is required to schedule analysis');
      return null;
    }

    setIsTriggering(true);
    
    try {
      console.log('Triggering analysis via scheduler:', {
        projectId,
        selectedTools,
        triggerType,
        codeLength: code.length
      });

      // Create trigger data with code and tools
      const triggerData = {
        code,
        selectedTools,
        timestamp: new Date().toISOString(),
        source: 'debug_session'
      };

      // Schedule the analysis through the ESLint scheduler
      const job = await scheduleAnalysis(
        projectId,
        triggerType,
        triggerData,
        5, // normal priority
        undefined // immediate execution
      );

      toast.success(`Analysis scheduled successfully (Job: ${job.id.slice(0, 8)})`);
      
      return job;
    } catch (error: any) {
      console.error('Failed to trigger analysis:', error);
      toast.error(`Failed to schedule analysis: ${error.message}`);
      return null;
    } finally {
      setIsTriggering(false);
    }
  };

  return {
    triggerAnalysis,
    isTriggering
  };
}

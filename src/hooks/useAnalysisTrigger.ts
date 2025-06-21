
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

    if (!code || code.trim().length === 0) {
      toast.error('Code is required for analysis');
      return null;
    }

    if (!selectedTools || selectedTools.length === 0) {
      toast.error('At least one analysis tool must be selected');
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
        code: code.trim(),
        selectedTools,
        timestamp: new Date().toISOString(),
        source: 'debug_session',
        codePreview: code.substring(0, 100) + (code.length > 100 ? '...' : '')
      };

      // DISABLED: Analysis scheduling during system rebuild
      console.log('Analysis scheduling disabled during system rebuild');
      toast.error('Auto-fix scheduling temporarily disabled during system rebuild');
      return null;

      // The following code is commented out during the rebuild phase
      /*
      // Schedule the analysis through the ESLint scheduler
      const job = await scheduleAnalysis(
        projectId,
        triggerType,
        triggerData,
        5, // normal priority
        undefined // immediate execution
      );

      if (job) {
        toast.success(`Analysis scheduled successfully`, {
          description: `Job ${job.id.slice(0, 8)}... queued for ${selectedTools.join(', ')} analysis`
        });
        
        return job;
      } else {
        throw new Error('Failed to create analysis job');
      }
      */
    } catch (error: any) {
      console.error('Failed to trigger analysis:', error);
      
      let errorMessage = 'Failed to schedule analysis';
      if (error.message.includes('Authorization')) {
        errorMessage = 'Authentication failed. Please refresh and try again.';
      } else if (error.message.includes('Project access')) {
        errorMessage = 'Access denied for this project.';
      } else if (error.message.includes('Too many active')) {
        errorMessage = 'Too many analyses running. Please wait and try again.';
      } else if (error.message) {
        errorMessage = `Failed to schedule analysis: ${error.message}`;
      }
      
      toast.error(errorMessage);
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

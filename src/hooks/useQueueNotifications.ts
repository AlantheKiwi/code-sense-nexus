
import { useEffect } from 'react';
import { toast } from 'sonner';

interface QueueJob {
  id: string;
  status: string;
  trigger_type: string;
  trigger_data?: any;
  error_message?: string;
  result_summary?: any;
  progress: number;
}

export function useQueueNotifications() {
  const showJobNotification = (job: QueueJob, previousStatus?: string) => {
    const jobId = job.id.slice(0, 8);
    const tools = job.trigger_data?.selectedTools?.join(', ') || 'ESLint';
    
    switch (job.status) {
      case 'queued':
        if (previousStatus !== 'queued') {
          toast.info(`Analysis queued`, {
            description: `${tools} analysis for job ${jobId}... is waiting to start`
          });
        }
        break;
        
      case 'running':
        if (previousStatus !== 'running') {
          toast.info(`Analysis started`, {
            description: `${tools} analysis (${jobId}...) is now processing`
          });
        }
        break;
        
      case 'completed':
        if (previousStatus !== 'completed') {
          const issueCount = job.result_summary?.totalIssues || 0;
          toast.success(`Analysis completed`, {
            description: `${tools} analysis finished with ${issueCount} issues found`
          });
        }
        break;
        
      case 'failed':
        if (previousStatus !== 'failed') {
          toast.error(`Analysis failed`, {
            description: `${tools} analysis failed: ${job.error_message || 'Unknown error'}`
          });
        }
        break;
        
      case 'retrying':
        if (previousStatus !== 'retrying') {
          toast.warning(`Analysis retrying`, {
            description: `${tools} analysis (${jobId}...) is being retried`
          });
        }
        break;
    }
  };

  return {
    showJobNotification
  };
}

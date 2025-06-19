
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap } from 'lucide-react';
import { useESLintScheduler } from '@/hooks/useESLintScheduler';
import { useESLintRealtimeUpdates } from '@/hooks/useESLintRealtimeUpdates';
import { useLighthouseQueue } from '@/hooks/useLighthouse';
import { AnalysisProgressIndicator } from './analysis/AnalysisProgressIndicator';
import { AnalysisQueueManager } from './analysis/AnalysisQueueManager';
import { AnalysisTimeline } from './analysis/AnalysisTimeline';
import { CriticalIssuesPreview } from './analysis/CriticalIssuesPreview';
import { toast } from 'sonner';

interface RealTimeAnalysisDashboardProps {
  projectId?: string;
  sessionId?: string;
}

export const RealTimeAnalysisDashboard = ({ 
  projectId, 
  sessionId 
}: RealTimeAnalysisDashboardProps) => {
  const [activeAnalyses, setActiveAnalyses] = useState<any[]>([]);
  const [criticalIssues, setCriticalIssues] = useState<any[]>([]);
  const hasInitializedRef = useRef(false);
  const projectIdRef = useRef<string | undefined>(undefined);
  
  const { jobs, queueStats, fetchQueueStatus } = useESLintScheduler();
  const { subscribeToJobUpdates, unsubscribeFromJobUpdates } = useESLintRealtimeUpdates();
  const { data: lighthouseQueue } = useLighthouseQueue(projectId);

  // Subscribe to real-time updates only once per projectId
  useEffect(() => {
    // Only initialize if projectId exists and has changed
    if (!projectId || (hasInitializedRef.current && projectIdRef.current === projectId)) {
      return;
    }

    // Clean up previous subscription if projectId changed
    if (hasInitializedRef.current && projectIdRef.current !== projectId) {
      console.log('Project ID changed, cleaning up previous subscription');
      unsubscribeFromJobUpdates();
      hasInitializedRef.current = false;
    }

    hasInitializedRef.current = true;
    projectIdRef.current = projectId;
    
    console.log('Initializing RealTimeAnalysisDashboard for project:', projectId);
    
    subscribeToJobUpdates(projectId, (updatedJob) => {
      console.log('Job update received:', updatedJob);
      
      // Show toast notifications for job status changes
      if (updatedJob.status === 'running' && updatedJob.trigger_data?.source === 'debug_session') {
        toast.info(`Analysis started (${updatedJob.trigger_data.selectedTools?.join(', ') || 'ESLint'})`, {
          description: `Job ${updatedJob.id.slice(0, 8)}... is now processing`
        });
      } else if (updatedJob.status === 'completed') {
        toast.success(`Analysis completed successfully`, {
          description: `Job ${updatedJob.id.slice(0, 8)}... finished with ${updatedJob.result_summary?.totalIssues || 0} issues found`
        });
      } else if (updatedJob.status === 'failed') {
        toast.error(`Analysis failed`, {
          description: `Job ${updatedJob.id.slice(0, 8)}... failed: ${updatedJob.error_message || 'Unknown error'}`
        });
      }

      setActiveAnalyses(prev => {
        const index = prev.findIndex(job => job.id === updatedJob.id);
        if (index >= 0) {
          const newAnalyses = [...prev];
          newAnalyses[index] = updatedJob;
          return newAnalyses;
        }
        return [...prev, updatedJob];
      });

      // Check for critical issues in completed analyses
      if (updatedJob.status === 'completed' && updatedJob.result_summary?.criticalIssues) {
        setCriticalIssues(prev => [...prev, ...updatedJob.result_summary.criticalIssues]);
      }
    });

    // Initial fetch with error handling
    fetchQueueStatus().catch(error => {
      console.log('Queue status fetch failed, but continuing:', error.message);
      // Don't show toast for initial fetch failures to avoid spam
    });

    return () => {
      console.log('Cleaning up RealTimeAnalysisDashboard');
      hasInitializedRef.current = false;
      projectIdRef.current = undefined;
      unsubscribeFromJobUpdates();
    };
  }, [projectId]); // Only depend on projectId

  // Update active analyses from queue data
  useEffect(() => {
    const runningJobs = jobs.filter(job => 
      ['queued', 'running', 'retrying'].includes(job.status)
    );
    setActiveAnalyses(runningJobs);
  }, [jobs]);

  // Don't render if no projectId
  if (!projectId) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Project Selected</h3>
          <p className="text-muted-foreground">Please select a project to view real-time analysis.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Real-Time Analysis Dashboard
            <span className="text-sm font-normal text-muted-foreground">
              Project: {projectId.slice(0, 8)}...
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Active Analyses */}
          <div>
            <h3 className="font-medium mb-3">Active Analyses</h3>
            {activeAnalyses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm mb-2">No active analyses running</p>
                <p className="text-xs">Use the Queue Manager to start a new analysis</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeAnalyses.map((analysis) => (
                  <AnalysisProgressIndicator
                    key={analysis.id}
                    analysis={analysis}
                    onCancel={(id) => {
                      console.log('Cancel analysis:', id);
                      toast.info('Analysis cancellation requested');
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Critical Issues Preview */}
          {criticalIssues.length > 0 && (
            <CriticalIssuesPreview issues={criticalIssues} />
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* Analysis Timeline */}
            <AnalysisTimeline jobs={jobs.slice(0, 10)} />

            {/* Queue Management */}
            <AnalysisQueueManager 
              queueStats={queueStats}
              lighthouseQueue={lighthouseQueue}
              projectId={projectId}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

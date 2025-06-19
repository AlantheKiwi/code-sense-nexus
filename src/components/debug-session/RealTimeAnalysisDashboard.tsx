
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
  const isInitializedRef = useRef(false);
  const currentProjectIdRef = useRef<string | null>(null);
  
  const { jobs, queueStats, fetchQueueStatus } = useESLintScheduler();
  const { subscribeToJobUpdates, unsubscribeFromJobUpdates } = useESLintRealtimeUpdates();
  const { data: lighthouseQueue } = useLighthouseQueue(projectId);

  // Stable project ID tracking
  useEffect(() => {
    currentProjectIdRef.current = projectId || null;
  }, [projectId]);

  // Single initialization effect
  useEffect(() => {
    // Only initialize once per project
    if (!projectId || isInitializedRef.current) {
      return;
    }

    console.log('Initializing RealTimeAnalysisDashboard for project:', projectId);
    isInitializedRef.current = true;
    
    const handleJobUpdate = (updatedJob: any) => {
      console.log('Job update received:', updatedJob);
      
      // Throttled toast notifications
      if (updatedJob.status === 'completed') {
        toast.success(`Analysis completed`, {
          description: `${updatedJob.result_summary?.totalIssues || 0} issues found`
        });
      } else if (updatedJob.status === 'failed') {
        toast.error(`Analysis failed`, {
          description: updatedJob.error_message || 'Unknown error'
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

      // Handle critical issues
      if (updatedJob.status === 'completed' && updatedJob.result_summary?.criticalIssues) {
        setCriticalIssues(prev => [...prev, ...updatedJob.result_summary.criticalIssues]);
      }
    };

    subscribeToJobUpdates(projectId, handleJobUpdate);

    return () => {
      console.log('Cleaning up RealTimeAnalysisDashboard');
      isInitializedRef.current = false;
      unsubscribeFromJobUpdates();
    };
  }, [projectId, subscribeToJobUpdates, unsubscribeFromJobUpdates]);

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

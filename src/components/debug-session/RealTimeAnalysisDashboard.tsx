
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
  
  const { jobs, queueStats, fetchQueueStatus } = useESLintScheduler();
  const { subscribeToJobUpdates, unsubscribeFromJobUpdates } = useESLintRealtimeUpdates();
  const { data: lighthouseQueue } = useLighthouseQueue(projectId);

  // Subscribe to real-time updates only once
  useEffect(() => {
    if (!projectId || hasInitializedRef.current) return;

    hasInitializedRef.current = true;
    console.log('Initializing RealTimeAnalysisDashboard for project:', projectId);
    
    subscribeToJobUpdates(projectId, (updatedJob) => {
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

    // Initial fetch
    fetchQueueStatus().catch(error => {
      console.log('Queue status fetch failed, but continuing:', error.message);
    });

    return () => {
      console.log('Cleaning up RealTimeAnalysisDashboard');
      hasInitializedRef.current = false;
      unsubscribeFromJobUpdates();
    };
  }, [projectId, subscribeToJobUpdates, unsubscribeFromJobUpdates, fetchQueueStatus]);

  // Update active analyses from queue data
  useEffect(() => {
    const runningJobs = jobs.filter(job => 
      ['queued', 'running', 'retrying'].includes(job.status)
    );
    setActiveAnalyses(runningJobs);
  }, [jobs]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Real-Time Analysis Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Active Analyses */}
          <div>
            <h3 className="font-medium mb-3">Active Analyses</h3>
            {activeAnalyses.length === 0 ? (
              <p className="text-muted-foreground text-sm">No active analyses running</p>
            ) : (
              <div className="space-y-3">
                {activeAnalyses.map((analysis) => (
                  <AnalysisProgressIndicator
                    key={analysis.id}
                    analysis={analysis}
                    onCancel={(id) => {
                      console.log('Cancel analysis:', id);
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

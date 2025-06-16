
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { List, Play, Pause, RotateCcw, Zap } from 'lucide-react';
import { useAnalysisTrigger } from '@/hooks/useAnalysisTrigger';
import { useESLintSchedulerActions } from '@/hooks/useESLintSchedulerActions';
import { useState } from 'react';
import { toast } from 'sonner';

interface AnalysisQueueManagerProps {
  queueStats: {
    total: number;
    queued: number;
    running: number;
    completed: number;
    failed: number;
    retrying: number;
  } | null;
  lighthouseQueue?: {
    queueItems: Array<{
      id: string;
      url: string;
      status: string;
      priority: string;
      created_at: string;
    }>;
    stats: {
      pending: number;
      processing: number;
    };
  };
  projectId?: string;
}

export const AnalysisQueueManager = ({ 
  queueStats, 
  lighthouseQueue, 
  projectId 
}: AnalysisQueueManagerProps) => {
  const { triggerAnalysis, isTriggering } = useAnalysisTrigger();
  const { processQueue } = useESLintSchedulerActions();
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  
  const totalQueued = (queueStats?.queued || 0) + (lighthouseQueue?.stats?.pending || 0);
  const totalRunning = (queueStats?.running || 0) + (lighthouseQueue?.stats?.processing || 0);
  const totalItems = queueStats?.total || 0;

  const getQueueProgress = () => {
    if (totalItems === 0) return 0;
    const completed = queueStats?.completed || 0;
    return (completed / totalItems) * 100;
  };

  const handleTriggerAnalysis = async () => {
    if (!projectId) {
      toast.error('No project selected');
      return;
    }

    const sampleCode = `// Sample code analysis
function example() {
  const unused = "variable";
  console.log("Hello World");
}`;

    await triggerAnalysis(
      projectId,
      sampleCode,
      ['eslint'],
      'manual'
    );
  };

  const handleProcessQueue = async () => {
    setIsProcessingQueue(true);
    try {
      await processQueue();
      toast.success('Queue processing initiated');
    } catch (error: any) {
      toast.error(`Failed to process queue: ${error.message}`);
    } finally {
      setIsProcessingQueue(false);
    }
  };

  const handleRetryFailed = async () => {
    toast.info('Retry failed functionality coming soon');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <List className="h-5 w-5" />
          Queue Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Queue Statistics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {totalQueued}
            </div>
            <div className="text-xs text-muted-foreground">Queued</div>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {totalRunning}
            </div>
            <div className="text-xs text-muted-foreground">Running</div>
          </div>
        </div>

        {/* Trigger Analysis Button */}
        <div className="border rounded-lg p-3 bg-muted/20">
          <h4 className="text-sm font-medium mb-2">Quick Actions</h4>
          <Button 
            onClick={handleTriggerAnalysis}
            disabled={isTriggering || !projectId}
            className="w-full mb-2"
            size="sm"
          >
            <Zap className="h-4 w-4 mr-1" />
            {isTriggering ? 'Scheduling...' : 'Start Analysis'}
          </Button>
          <p className="text-xs text-muted-foreground">
            Trigger a manual ESLint analysis for this project
          </p>
        </div>

        {/* Overall Progress */}
        {totalItems > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{Math.round(getQueueProgress())}%</span>
            </div>
            <Progress value={getQueueProgress()} className="h-2" />
          </div>
        )}

        {/* Queue Breakdown */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Queue Breakdown</h4>
          <div className="space-y-1">
            {queueStats && (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">ESLint</Badge>
                    Queued
                  </span>
                  <span>{queueStats.queued}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">ESLint</Badge>
                    Running
                  </span>
                  <span>{queueStats.running}</span>
                </div>
                {queueStats.failed > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Badge variant="destructive" className="text-xs">ESLint</Badge>
                      Failed
                    </span>
                    <span>{queueStats.failed}</span>
                  </div>
                )}
              </>
            )}
            {lighthouseQueue && (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">Lighthouse</Badge>
                    Pending
                  </span>
                  <span>{lighthouseQueue.stats.pending}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">Lighthouse</Badge>
                    Processing
                  </span>
                  <span>{lighthouseQueue.stats.processing}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Queue Actions */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={handleProcessQueue}
            disabled={isProcessingQueue}
          >
            <Play className="h-4 w-4 mr-1" />
            {isProcessingQueue ? 'Processing...' : 'Process Queue'}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={handleRetryFailed}
            disabled={!queueStats?.failed}
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Retry Failed
          </Button>
        </div>

        {/* Upcoming Scheduled */}
        {lighthouseQueue?.queueItems && lighthouseQueue.queueItems.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Upcoming Scheduled</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {lighthouseQueue.queueItems.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between text-xs">
                  <span className="truncate">{item.url}</span>
                  <Badge variant="outline" className="text-xs">
                    {item.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {projectId && (
          <div className="text-xs text-muted-foreground">
            Project: {projectId.slice(0, 8)}...
          </div>
        )}
      </CardContent>
    </Card>
  );
};

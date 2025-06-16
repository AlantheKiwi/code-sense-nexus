
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface AnalysisTimelineProps {
  jobs: Array<{
    id: string;
    trigger_type: string;
    status: string;
    created_at: string;
    started_at?: string;
    completed_at?: string;
    error_message?: string;
  }>;
}

export const AnalysisTimeline = ({ jobs }: AnalysisTimelineProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'retrying': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getDuration = (started?: string, completed?: string) => {
    if (!started || !completed) return null;
    const duration = new Date(completed).getTime() - new Date(started).getTime();
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Analysis Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        {jobs.length === 0 ? (
          <p className="text-muted-foreground text-sm">No recent analyses</p>
        ) : (
          <div className="space-y-4">
            {jobs.map((job, index) => (
              <div key={job.id} className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(job.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      {job.trigger_type}
                    </Badge>
                    <Badge variant={job.status === 'completed' ? 'secondary' : 
                                   job.status === 'failed' ? 'destructive' : 'default'}>
                      {job.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Started: {formatTime(job.created_at)}
                  </p>
                  {job.completed_at && (
                    <p className="text-sm text-muted-foreground">
                      Completed: {formatTime(job.completed_at)}
                      {getDuration(job.started_at, job.completed_at) && (
                        <span className="ml-2">
                          ({getDuration(job.started_at, job.completed_at)})
                        </span>
                      )}
                    </p>
                  )}
                  {job.error_message && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      {job.error_message}
                    </p>
                  )}
                </div>
                {index < jobs.length - 1 && (
                  <div className="absolute left-3 top-8 w-px h-8 bg-border" 
                       style={{ marginLeft: '0.5rem' }} />
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

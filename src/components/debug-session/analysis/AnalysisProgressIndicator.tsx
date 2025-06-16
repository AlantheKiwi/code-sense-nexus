
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, Clock, Play, X, Zap } from 'lucide-react';

interface AnalysisProgressIndicatorProps {
  analysis: {
    id: string;
    trigger_type: string;
    status: string;
    progress: number;
    status_message?: string;
    created_at: string;
    started_at?: string;
    error_message?: string;
  };
  onCancel: (id: string) => void;
}

export const AnalysisProgressIndicator = ({ 
  analysis, 
  onCancel 
}: AnalysisProgressIndicatorProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'queued': return 'secondary';
      case 'running': return 'default';
      case 'completed': return 'secondary';
      case 'failed': return 'destructive';
      case 'retrying': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'queued': return <Clock className="h-4 w-4" />;
      case 'running': return <Play className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <AlertTriangle className="h-4 w-4" />;
      case 'retrying': return <Zap className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getElapsedTime = () => {
    if (!analysis.started_at) return null;
    const elapsed = Date.now() - new Date(analysis.started_at).getTime();
    const seconds = Math.floor(elapsed / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {getStatusIcon(analysis.status)}
            <Badge variant={getStatusColor(analysis.status)}>
              {analysis.status.toUpperCase()}
            </Badge>
            <span className="text-sm font-medium">
              {analysis.trigger_type === 'manual' ? 'Manual Analysis' : 'Scheduled Analysis'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {analysis.started_at && (
              <span className="text-xs text-muted-foreground">
                {getElapsedTime()}
              </span>
            )}
            {(analysis.status === 'queued' || analysis.status === 'running') && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onCancel(analysis.id)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {analysis.status === 'running' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>{analysis.status_message || 'Processing...'}</span>
              <span>{analysis.progress}%</span>
            </div>
            <Progress value={analysis.progress} className="h-2" />
          </div>
        )}

        {analysis.error_message && (
          <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-sm text-red-700 dark:text-red-300">
            {analysis.error_message}
          </div>
        )}

        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
          <span>Started: {formatTime(analysis.created_at)}</span>
          {analysis.started_at && analysis.started_at !== analysis.created_at && (
            <span>Running since: {formatTime(analysis.started_at)}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

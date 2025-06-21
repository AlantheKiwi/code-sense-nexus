
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Play, Square } from 'lucide-react';
import { useAutoFix } from '@/hooks/useAutoFix';
import { AutoFixOrchestrator } from '@/services/AutoFixOrchestrator';

interface SimpleAutoFixPanelProps {
  projectId?: string;
  sessionId?: string;
}

export const SimpleAutoFixPanel: React.FC<SimpleAutoFixPanelProps> = ({ 
  projectId, 
  sessionId 
}) => {
  const { state, actions } = useAutoFix();
  const orchestrator = React.useMemo(() => new AutoFixOrchestrator(actions), [actions]);

  // Debug logging
  console.log('SimpleAutoFixPanel rendering, autoFix state:', state);
  console.log('SimpleAutoFixPanel props:', { projectId, sessionId });

  const handleRunESLint = async () => {
    if (!projectId) {
      actions.addError('Project ID is required');
      return;
    }
    console.log('Starting ESLint mock analysis');
    await orchestrator.runESLintAnalysis(projectId);
  };

  const handleRunLighthouse = async () => {
    if (!projectId) {
      actions.addError('Project ID is required');
      return;
    }
    console.log('Starting Lighthouse mock analysis');
    await orchestrator.runLighthouseAnalysis(projectId);
  };

  const handleRunAll = async () => {
    if (!projectId) {
      actions.addError('Project ID is required');
      return;
    }
    console.log('Starting Full mock analysis');
    await orchestrator.runFullAnalysis(projectId);
  };

  const handleStop = () => {
    console.log('Stopping mock analysis');
    orchestrator.stopAnalysis();
  };

  const handleClear = () => {
    console.log('Clearing mock analysis results');
    actions.clearState();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Auto-Fix Analysis (Mock Mode)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Control Buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={handleRunESLint}
              disabled={state.isRunning}
              variant="outline"
              size="sm"
            >
              Run ESLint (Mock)
            </Button>
            <Button
              onClick={handleRunLighthouse}
              disabled={state.isRunning}
              variant="outline"
              size="sm"
            >
              Run Lighthouse (Mock)
            </Button>
            <Button
              onClick={handleRunAll}
              disabled={state.isRunning}
              size="sm"
            >
              Run All Analysis (Mock)
            </Button>
            {state.isRunning && (
              <Button
                onClick={handleStop}
                variant="destructive"
                size="sm"
              >
                <Square className="h-4 w-4 mr-1" />
                Stop
              </Button>
            )}
            {(state.results.length > 0 || state.errors.length > 0) && (
              <Button
                onClick={handleClear}
                variant="ghost"
                size="sm"
                disabled={state.isRunning}
              >
                Clear Results
              </Button>
            )}
          </div>

          {/* Status Display */}
          {state.isRunning && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  Running: {state.currentTool}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {state.progress}%
                </span>
              </div>
              <Progress value={state.progress} className="w-full" />
            </div>
          )}

          {/* Error Display */}
          {state.errors.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                Errors ({state.errors.length})
              </h4>
              <div className="space-y-1">
                {state.errors.map((error, index) => (
                  <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    {error}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Results Display */}
          {state.results.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-green-600 flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                Mock Results ({state.results.length})
              </h4>
              <div className="space-y-2">
                {state.results.map((result, index) => (
                  <Card key={index} className="p-3 bg-blue-50">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{result.tool} (Mock)</Badge>
                      {result.completedAt && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(result.completedAt).toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {result.summary}
                    </p>
                    
                    {/* ESLint Results */}
                    {result.issues && (
                      <div className="space-y-1">
                        {result.issues.map((issue: any, issueIndex: number) => (
                          <div key={issueIndex} className="text-xs flex items-center gap-2">
                            <Badge 
                              variant={issue.severity === 'error' ? 'destructive' : 'secondary'}
                              className="text-xs"
                            >
                              {issue.severity}
                            </Badge>
                            <span>Line {issue.line}: {issue.message}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Lighthouse Results */}
                    {result.scores && (
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>Performance: {result.scores.performance}/100</div>
                        <div>Accessibility: {result.scores.accessibility}/100</div>
                        <div>Best Practices: {result.scores.bestPractices}/100</div>
                        <div>SEO: {result.scores.seo}/100</div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

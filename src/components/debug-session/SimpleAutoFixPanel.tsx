import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, CheckCircle, Play, Square, Settings, RotateCcw, Wrench } from 'lucide-react';
import { useAutoFix } from '@/hooks/useAutoFix';
import { AutoFixOrchestrator } from '@/services/AutoFixOrchestrator';
import { FixReviewPanel } from './FixReviewPanel';
import { CodeFix, FixResult } from '@/services/CodeFixEngine';
import { LovableAssistant } from './LovableAssistant';

interface SimpleAutoFixPanelProps {
  projectId?: string;
  sessionId?: string;
}

export const SimpleAutoFixPanel: React.FC<SimpleAutoFixPanelProps> = ({ 
  projectId, 
  sessionId 
}) => {
  console.log('SimpleAutoFixPanel rendering, props:', { projectId, sessionId });

  // Error boundary state
  const [hasError, setHasError] = useState(false);
  
  // Code fixes state
  const [fixes, setFixes] = useState<CodeFix[]>([]);
  const [isGeneratingFixes, setIsGeneratingFixes] = useState(false);
  const [isApplyingFixes, setIsApplyingFixes] = useState(false);

  // Mock code for Lovable analysis
  const [currentCode] = useState(`// Sample Lovable-generated code
import React from 'react';

const MyComponent = () => {
  const data = fetchData();
  
  return (
    <div className="w-96">
      <h1>Hello World</h1>
      {/* TODO: Add error handling */}
    </div>
  );
};

export default MyComponent;`);

  try {
    const { state, actions } = useAutoFix();
    const [useRealAnalysis, setUseRealAnalysis] = useState(false);
    const orchestrator = React.useMemo(() => new AutoFixOrchestrator(actions), [actions]);

    console.log('SimpleAutoFixPanel state:', state);
    console.log('Orchestrator internal state:', orchestrator.getCurrentState());

    const handleRunESLint = async () => {
      try {
        if (!projectId) {
          actions.addError('Project ID is required');
          return;
        }
        console.log('Starting ESLint analysis, real mode:', useRealAnalysis);
        await orchestrator.runESLintAnalysis(projectId, undefined, useRealAnalysis);
        
        // After analysis, automatically generate fixes
        await handleGenerateFixes();
      } catch (error: any) {
        console.error('Error running ESLint:', error);
        actions.addError(`Failed to run ESLint: ${error.message}`);
      }
    };

    const handleRunLighthouse = async () => {
      try {
        if (!projectId) {
          actions.addError('Project ID is required');
          return;
        }
        console.log('Starting Lighthouse analysis, real mode:', useRealAnalysis);
        await orchestrator.runLighthouseAnalysis(projectId, undefined, useRealAnalysis);
        
        // After analysis, automatically generate fixes
        await handleGenerateFixes();
      } catch (error: any) {
        console.error('Error running Lighthouse:', error);
        actions.addError(`Failed to run Lighthouse: ${error.message}`);
      }
    };

    const handleRunAll = async () => {
      try {
        if (!projectId) {
          actions.addError('Project ID is required');
          return;
        }
        console.log('Starting Full analysis, real mode:', useRealAnalysis);
        await orchestrator.runFullAnalysis(projectId, undefined, undefined, useRealAnalysis);
        
        // After analysis, automatically generate fixes
        await handleGenerateFixes();
      } catch (error: any) {
        console.error('Error running full analysis:', error);
        actions.addError(`Failed to run full analysis: ${error.message}`);
      }
    };

    const handleGenerateFixes = async () => {
      try {
        setIsGeneratingFixes(true);
        console.log('Generating code fixes from analysis results');
        
        const generatedFixes = await orchestrator.generateCodeFixes();
        setFixes(generatedFixes);
        
        if (generatedFixes.length > 0) {
          console.log(`Generated ${generatedFixes.length} potential fixes`);
        } else {
          console.log('No fixable issues found');
        }
      } catch (error: any) {
        console.error('Error generating fixes:', error);
        actions.addError(`Failed to generate fixes: ${error.message}`);
      } finally {
        setIsGeneratingFixes(false);
      }
    };

    const handleApplyFixes = async (selectedFixIds: string[]): Promise<FixResult[]> => {
      try {
        setIsApplyingFixes(true);
        console.log('Applying selected fixes:', selectedFixIds);
        
        const results = await orchestrator.applyCodeFixes(selectedFixIds);
        
        const successCount = results.filter(r => r.success).length;
        if (successCount > 0) {
          // You could add a success message to the actions here
          console.log(`Successfully applied ${successCount} fixes`);
        }
        
        return results;
      } catch (error: any) {
        console.error('Error applying fixes:', error);
        actions.addError(`Failed to apply fixes: ${error.message}`);
        return [];
      } finally {
        setIsApplyingFixes(false);
      }
    };

    const handleStop = () => {
      try {
        console.log('Stopping analysis');
        orchestrator.stopAnalysis();
      } catch (error: any) {
        console.error('Error stopping analysis:', error);
        actions.addError(`Failed to stop analysis: ${error.message}`);
      }
    };

    const handleForceReset = () => {
      try {
        console.log('Force resetting analysis state');
        orchestrator.forceReset();
        actions.clearState();
        setFixes([]);
      } catch (error: any) {
        console.error('Error force resetting:', error);
        actions.addError(`Failed to force reset: ${error.message}`);
      }
    };

    const handleClear = () => {
      try {
        console.log('Clearing analysis results');
        actions.clearState();
        setFixes([]);
      } catch (error: any) {
        console.error('Error clearing results:', error);
        actions.addError(`Failed to clear results: ${error.message}`);
      }
    };

    const handleLovableFixes = (lovableFixes: any[]) => {
      console.log('Received Lovable fixes:', lovableFixes);
      // Convert Lovable fixes to CodeFix format if needed
      // This is where you'd integrate with actual fix application
    };

    if (hasError) {
      return (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              Auto-Fix Panel Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 mb-4">
              There was an error loading the auto-fix panel. Please refresh the page.
            </p>
            <Button onClick={() => setHasError(false)} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {/* Lovable Assistant - Now with smart fixes and guidance */}
        <LovableAssistant 
          code={currentCode}
          onFixIssues={handleLovableFixes}
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Smart Auto-Fix Analysis System
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Analysis Mode Settings */}
            <Card className="p-3 bg-blue-50">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="h-4 w-4" />
                <span className="text-sm font-medium">Analysis Mode</span>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="useReal"
                  checked={useRealAnalysis}
                  onCheckedChange={(checked) => setUseRealAnalysis(checked as boolean)}
                  disabled={state.isRunning}
                />
                <label htmlFor="useReal" className="text-sm">
                  Use Real Analysis (requires edge functions)
                </label>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {useRealAnalysis 
                  ? "Will call real edge functions and database. May take longer and can fail." 
                  : "Uses mock analysis for testing. Always works and responds quickly."}
              </p>
            </Card>

            {/* Control Buttons */}
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={handleRunESLint}
                disabled={state.isRunning}
                variant="outline"
                size="sm"
              >
                Run ESLint {useRealAnalysis ? '(Real)' : '(Mock)'}
              </Button>
              <Button
                onClick={handleRunLighthouse}
                disabled={state.isRunning}
                variant="outline"
                size="sm"
              >
                Run Lighthouse {useRealAnalysis ? '(Real)' : '(Mock)'}
              </Button>
              <Button
                onClick={handleRunAll}
                disabled={state.isRunning}
                size="sm"
              >
                Run All Analysis {useRealAnalysis ? '(Real)' : '(Mock)'}
              </Button>
              
              {/* Fix Generation Button */}
              {state.results.length > 0 && (
                <Button
                  onClick={handleGenerateFixes}
                  disabled={state.isRunning || isGeneratingFixes}
                  variant="secondary"
                  size="sm"
                  className="bg-green-100 hover:bg-green-200 text-green-800"
                >
                  <Wrench className="h-4 w-4 mr-1" />
                  {isGeneratingFixes ? 'Generating...' : 'Generate Fixes'}
                </Button>
              )}
              
              {/* Analysis Control Buttons */}
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
              
              {/* Reset Button - always available */}
              <Button
                onClick={handleForceReset}
                variant="outline"
                size="sm"
                className="text-orange-600 border-orange-200"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Force Reset
              </Button>
              
              {(state.results.length > 0 || state.errors.length > 0 || fixes.length > 0) && (
                <Button
                  onClick={handleClear}
                  variant="ghost"
                  size="sm"
                  disabled={state.isRunning}
                >
                  Clear All
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
                  {useRealAnalysis && (
                    <Badge variant="outline" className="text-xs">
                      Real Mode
                    </Badge>
                  )}
                </div>
                <Progress value={state.progress} className="w-full" />
                <p className="text-xs text-muted-foreground">
                  If analysis appears stuck, use the "Force Reset" button above.
                </p>
              </div>
            )}

            {/* Fix Generation Status */}
            {isGeneratingFixes && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    <Wrench className="h-3 w-3 mr-1" />
                    Generating Fixes...
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Analyzing results to create automatic code fixes...
                </p>
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
                <Button 
                  onClick={() => actions.clearState()} 
                  variant="outline" 
                  size="sm"
                  className="text-red-600"
                >
                  Clear Errors
                </Button>
              </div>
            )}

            {/* Results Display */}
            {state.results.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-green-600 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  Analysis Results ({state.results.length})
                </h4>
                <div className="space-y-2">
                  {state.results.map((result, index) => (
                    <Card key={index} className="p-3 bg-blue-50">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{result.tool}</Badge>
                        {result.completedAt && (
                          <span className="text-xs text-muted-foreground">
                            {new Date(result.completedAt).toLocaleTimeString()}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {result.summary}
                      </p>
                      
                      {/* Job ID for Real Analysis */}
                      {result.jobId && (
                        <div className="text-xs text-blue-600 mb-2">
                          Job ID: {result.jobId}
                        </div>
                      )}
                      
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

        {/* Code Fixes Panel */}
        <FixReviewPanel
          fixes={fixes}
          isApplying={isApplyingFixes}
          onApplyFixes={handleApplyFixes}
        />
      </div>
    );
  } catch (error: any) {
    console.error('SimpleAutoFixPanel error:', error);
    setHasError(true);
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <AlertCircle className="h-5 w-5" />
            Auto-Fix Panel Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-700 mb-2">
            There was an error loading the auto-fix panel.
          </p>
          <p className="text-sm text-red-600 mb-4">
            Error: {error.message}
          </p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Reload Page
          </Button>
        </CardContent>
      </Card>
    );
  }
};

import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useDebugSession } from '@/hooks/useDebugSession';
import { useEffect, useState, useCallback } from 'react';
import { LoadingSkeleton } from '@/components/debug-session/LoadingSkeleton';
import { SessionHeader } from '@/components/debug-session/SessionHeader';
import { CodeEditor } from '@/components/debug-session/CodeEditor';
import { AnalysisResult } from '@/components/debug-session/AnalysisResult';
import { CollaboratorsList } from '@/components/debug-session/CollaboratorsList';
import { CursorOverlay } from '@/components/debug-session/CursorOverlay';
import { AutomationControlPanel, AutomationSettings } from '@/components/debug-session/AutomationControlPanel';
import { DebugSessionInstructions } from '@/components/debug-session/DebugSessionInstructions';
import { useDebugSessionAnalysis } from '@/hooks/useDebugSessionAnalysis';
import { useDebugSessionCursor } from '@/hooks/useDebugSessionCursor';
// import { RealTimeAnalysisDashboard } from '@/components/debug-session/RealTimeAnalysisDashboard';
import { IssuesRecommendationsDashboard } from '@/components/debug-session/IssuesRecommendationsDashboard';
// import { ResultsSummaryDashboard } from '@/components/debug-session/results/ResultsSummaryDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

const DebugSessionPage = () => {
  const { sessionId, projectId } = useParams<{ sessionId: string; projectId: string }>();
  const { user } = useAuth();
  const { session, isLoading, error, collaborators, broadcastEvent, lastEvent } = useDebugSession(sessionId!, user);
  
  const [code, setCode] = useState(`// Welcome to the Live Debugging Session!
// 1. This is a shared code editor. Any changes you make will be seen by your team in real-time.
// 2. Select your debugging tools and click "Analyze" to get comprehensive feedback.
//
// Here's some example code with a few issues to find:

function sayHello(name) {
  const message = "Hello, " + name
  console.log(message);
}

const unusedVar = "I'm not used anywhere";

sayHello('World')`);

  const [automationSettings, setAutomationSettings] = useState<AutomationSettings>({
    allAutomatic: false,
    smartAnalysis: true,
    toolSettings: {},
    activePreset: 'development'
  });

  const { result, isAnalyzing, handleAnalyzeCode, setResult } = useDebugSessionAnalysis(sessionId);
  const { cursors, handleMouseMove, updateCursor, cleanupCursors } = useDebugSessionCursor();
  // const [showResultsSummary, setShowResultsSummary] = useState(false);

  // Handle last event changes
  useEffect(() => {
    if (!lastEvent) return;

    console.log('Processing event:', lastEvent);

    if (lastEvent.type === 'CODE_UPDATE') {
      setCode(lastEvent.payload.code);
    }
    if (lastEvent.type === 'EXECUTION_RESULT') {
      setResult(lastEvent.payload);
      // Auto-fix results disabled during rebuild
      // if (lastEvent.payload && !lastEvent.payload.error) {
      //   setShowResultsSummary(true);
      // }
    }
    if (lastEvent.type === 'CURSOR_UPDATE') {
      const collaborator = collaborators.find(c => c.user_id === lastEvent.sender);
      if (collaborator) {
        updateCursor(lastEvent.sender, { ...lastEvent.payload, email: collaborator.email });
      }
    }
  }, [lastEvent, collaborators, setResult, updateCursor]);

  // Handle collaborators cleanup
  useEffect(() => {
    const activeCollaboratorIds = new Set(collaborators.map(c => c.user_id));
    cleanupCursors(activeCollaboratorIds);
  }, [collaborators, cleanupCursors]);

  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode);
    broadcastEvent({
      type: 'CODE_UPDATE',
      payload: { code: newCode },
    });
  }, [broadcastEvent]);

  const handleAutomationSettingsChange = useCallback((settings: AutomationSettings) => {
    setAutomationSettings(settings);
    console.log('Automation settings updated:', settings);
  }, []);

  const onAnalyze = useCallback((selectedTools: string[]) => {
    handleAnalyzeCode(selectedTools, code, broadcastEvent);
  }, [handleAnalyzeCode, code, broadcastEvent]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    handleMouseMove(e, broadcastEvent);
  }, [handleMouseMove, broadcastEvent]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    console.error('Debug session error:', error);
    return (
      <div className="text-red-500 text-center p-8">
        <h2 className="text-xl font-semibold mb-2">Error loading session</h2>
        <p className="mb-4">{error.message}</p>
        <p className="text-sm text-gray-600">
          This could be due to network issues or database problems. Please try refreshing the page.
        </p>
      </div>
    );
  }

  // Handle case where session is null (not found)
  if (!session) {
    return (
      <div className="text-yellow-600 text-center p-8">
        <h2 className="text-xl font-semibold mb-2">Session not found</h2>
        <p className="mb-4">The debug session you're looking for doesn't exist or you don't have access to it.</p>
        <p className="text-sm text-gray-600">
          Please check the URL or contact your team administrator.
        </p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8 relative" onMouseMove={onMouseMove}>
      <SessionHeader sessionId={session?.id} />
      <DebugSessionInstructions />

      {/* System Rebuild Notice */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800">
            <AlertTriangle className="h-5 w-5" />
            Auto-Fix System Temporarily Disabled
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-yellow-700">
            We are rebuilding the auto-fix system for better reliability. 
            Manual analysis and recommendations are still available below.
            Real-time analysis and automated fixes will return soon.
          </p>
        </CardContent>
      </Card>

      {/* Disabled: Real-Time Analysis Dashboard */}
      {/* 
      <RealTimeAnalysisDashboard 
        projectId={projectId} 
        sessionId={sessionId}
      />
      */}

      {/* Issues Recommendations Dashboard - Keep basic recommendations */}
      <IssuesRecommendationsDashboard 
        projectId={projectId} 
        sessionId={sessionId}
      />

      {/* Disabled: Results Summary Dashboard */}
      {/* 
      {showResultsSummary && result && !result.error && (
        <ResultsSummaryDashboard
          projectId={projectId || ''}
          sessionId={sessionId}
          results={{
            id: 'current-analysis',
            projectId: projectId || '',
            sessionId: sessionId || '',
            timestamp: new Date().toISOString(),
            overallHealthScore: result.analysis?.overallScore || 75,
            toolsUsed: result.analyzedTools || [],
            issues: result.analysis?.issues?.map((issue: any, index: number) => ({
              id: `issue-${index}`,
              title: issue.message || 'Code issue detected',
              description: issue.description || issue.message || '',
              severity: issue.severity === 2 ? 'critical' : issue.severity === 1 ? 'high' : 'medium',
              category: issue.ruleId?.includes('security') ? 'security' : 
                       issue.ruleId?.includes('performance') ? 'performance' : 
                       issue.ruleId?.includes('a11y') ? 'accessibility' : 'code_quality',
              impact: issue.severity === 2 ? 'high' : 'medium',
              effort: 'low',
              estimatedTimeHours: 2,
              businessImpact: `Resolving this ${issue.ruleId || 'issue'} will improve code quality and maintainability`,
              technicalDebt: true,
              quickWin: issue.severity !== 2,
              status: 'open' as const,
            })) || [],
            recommendations: [],
            metrics: {
              codeQualityScore: result.analysis?.codeQualityScore || 75,
              securityScore: result.analysis?.securityScore || 80,
              performanceScore: result.analysis?.performanceScore || 70,
              accessibilityScore: result.analysis?.accessibilityScore || 85,
              technicalDebtIndex: result.analysis?.technicalDebtIndex || 25,
            }
          }}
        />
      )}
      */}

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          <CodeEditor 
            code={code}
            onCodeChange={handleCodeChange}
            onAnalyze={onAnalyze}
            isAnalyzing={isAnalyzing}
          />
          <AnalysisResult result={result} isAnalyzing={isAnalyzing} />
        </div>
        
        <div className="space-y-4">
          <CollaboratorsList collaborators={collaborators} />
          {/* Auto-fix control panel disabled during rebuild */}
          {/* 
          <AutomationControlPanel
            projectId={projectId}
            availableTools={['eslint', 'lighthouse', 'snyk', 'sonarqube', 'accessibility', 'bundle-analyzer']}
            onSettingsChange={handleAutomationSettingsChange}
          />
          */}
        </div>
      </div>
      <CursorOverlay cursors={cursors} currentUserId={user?.id} />
    </div>
  );
};

export default DebugSessionPage;

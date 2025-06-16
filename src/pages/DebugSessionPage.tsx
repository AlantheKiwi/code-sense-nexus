
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useDebugSession } from '@/hooks/useDebugSession';
import { useEffect, useState } from 'react';
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
import { RealTimeAnalysisDashboard } from '@/components/debug-session/RealTimeAnalysisDashboard';
import { IssuesRecommendationsDashboard } from '@/components/debug-session/IssuesRecommendationsDashboard';
import { ResultsSummaryDashboard } from '@/components/debug-session/results/ResultsSummaryDashboard';

const DebugSessionPage = () => {
  const { sessionId } = useParams<{ sessionId: string; projectId: string }>();
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
  const [showResultsSummary, setShowResultsSummary] = useState(false);

  useEffect(() => {
    if (lastEvent) {
      if (lastEvent.type === 'CODE_UPDATE') {
        setCode(lastEvent.payload.code);
      }
      if (lastEvent.type === 'EXECUTION_RESULT') {
        setResult(lastEvent.payload);
        // Show results summary when analysis completes
        if (lastEvent.payload && !lastEvent.payload.error) {
          setShowResultsSummary(true);
        }
      }
      if (lastEvent.type === 'CURSOR_UPDATE') {
        const collaborator = collaborators.find(c => c.user_id === lastEvent.sender);
        if (collaborator) {
          updateCursor(lastEvent.sender, { ...lastEvent.payload, email: collaborator.email });
        }
      }
    }
  }, [lastEvent, collaborators, setResult, updateCursor]);

  useEffect(() => {
    const activeCollaboratorIds = new Set(collaborators.map(c => c.user_id));
    cleanupCursors(activeCollaboratorIds);
  }, [collaborators, cleanupCursors]);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    broadcastEvent({
      type: 'CODE_UPDATE',
      payload: { code: newCode },
    });
  };

  const handleAutomationSettingsChange = (settings: AutomationSettings) => {
    setAutomationSettings(settings);
    console.log('Automation settings updated:', settings);
  };

  const onAnalyze = (selectedTools: string[]) => {
    handleAnalyzeCode(selectedTools, code, broadcastEvent);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    handleMouseMove(e, broadcastEvent);
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <div className="text-red-500 text-center p-8">Error loading session: {error.message}</div>;
  }
  
  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8 relative" onMouseMove={onMouseMove}>
      <SessionHeader sessionId={session?.id} />
      <DebugSessionInstructions />

      {/* Real-Time Analysis Dashboard */}
      <RealTimeAnalysisDashboard 
        projectId={session?.id} 
        sessionId={sessionId}
      />

      {/* Issues Recommendations Dashboard */}
      <IssuesRecommendationsDashboard 
        projectId={session?.id} 
        sessionId={sessionId}
      />

      {/* Results Summary Dashboard - Show after analysis completes */}
      {showResultsSummary && result && !result.error && (
        <ResultsSummaryDashboard
          projectId={session?.id || ''}
          sessionId={sessionId}
          results={{
            id: 'current-analysis',
            projectId: session?.id || '',
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
          <AutomationControlPanel
            projectId={session?.id}
            availableTools={['eslint', 'lighthouse', 'snyk', 'sonarqube', 'accessibility', 'bundle-analyzer']}
            onSettingsChange={handleAutomationSettingsChange}
          />
        </div>
      </div>
      <CursorOverlay cursors={cursors} currentUserId={user?.id} />
    </div>
  );
};

export default DebugSessionPage;

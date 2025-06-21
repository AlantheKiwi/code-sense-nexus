
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
import { AutoFixProvider } from '@/contexts/AutoFixProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { SimpleAutoFixPanel } from '@/components/debug-session/SimpleAutoFixPanel';

const DebugSessionPageContent = () => {
  const { sessionId, projectId } = useParams<{ sessionId: string; projectId: string }>();
  const { user } = useAuth();
  
  // Early return if missing required params
  if (!sessionId || !projectId) {
    console.error('Missing required URL parameters:', { sessionId, projectId });
    return (
      <div className="text-red-500 text-center p-8">
        <h2 className="text-xl font-semibold mb-2">Invalid URL</h2>
        <p className="mb-4">Missing required session or project ID in URL</p>
        <p className="text-sm text-gray-600">
          Please check the URL and try again.
        </p>
      </div>
    );
  }

  const { session, isLoading, error, collaborators, broadcastEvent, lastEvent } = useDebugSession(sessionId, user);
  
  // Debug logging
  console.log('DebugSessionPageContent rendering with:', { sessionId, projectId, user: user?.id });
  console.log('Session data:', { session, isLoading, error });
  
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

  // Handle last event changes
  useEffect(() => {
    if (!lastEvent) return;

    console.log('Processing event:', lastEvent);

    try {
      if (lastEvent.type === 'CODE_UPDATE') {
        setCode(lastEvent.payload.code);
      }
      if (lastEvent.type === 'EXECUTION_RESULT') {
        setResult(lastEvent.payload);
      }
      if (lastEvent.type === 'CURSOR_UPDATE') {
        const collaborator = collaborators.find(c => c.user_id === lastEvent.sender);
        if (collaborator) {
          updateCursor(lastEvent.sender, { ...lastEvent.payload, email: collaborator.email });
        }
      }
    } catch (eventError) {
      console.error('Error processing event:', eventError);
    }
  }, [lastEvent, collaborators, setResult, updateCursor]);

  // Handle collaborators cleanup
  useEffect(() => {
    try {
      const activeCollaboratorIds = new Set(collaborators.map(c => c.user_id));
      cleanupCursors(activeCollaboratorIds);
    } catch (cleanupError) {
      console.error('Error cleaning up cursors:', cleanupError);
    }
  }, [collaborators, cleanupCursors]);

  const handleCodeChange = useCallback((newCode: string) => {
    try {
      setCode(newCode);
      broadcastEvent({
        type: 'CODE_UPDATE',
        payload: { code: newCode },
      });
    } catch (broadcastError) {
      console.error('Error broadcasting code change:', broadcastError);
    }
  }, [broadcastEvent]);

  const handleAutomationSettingsChange = useCallback((settings: AutomationSettings) => {
    setAutomationSettings(settings);
    console.log('Automation settings updated:', settings);
  }, []);

  const onAnalyze = useCallback((selectedTools: string[]) => {
    try {
      handleAnalyzeCode(selectedTools, code, broadcastEvent);
    } catch (analyzeError) {
      console.error('Error analyzing code:', analyzeError);
    }
  }, [handleAnalyzeCode, code, broadcastEvent]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    try {
      handleMouseMove(e, broadcastEvent);
    } catch (mouseMoveError) {
      console.error('Error handling mouse move:', mouseMoveError);
    }
  }, [handleMouseMove, broadcastEvent]);

  if (isLoading) {
    console.log('Debug session loading...');
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
    console.warn('Debug session not found:', sessionId);
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

  console.log('Rendering debug session page content');
  
  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8 relative" onMouseMove={onMouseMove}>
      <SessionHeader sessionId={session?.id} />
      <DebugSessionInstructions />

      {/* System Status Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <AlertTriangle className="h-5 w-5" />
            Auto-Fix System Ready
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-700">
            New centralized state management system is active! 
            You can now use both mock and real analysis modes. Toggle between them in the panel below.
          </p>
        </CardContent>
      </Card>

      {/* Auto-Fix Panel */}
      <SimpleAutoFixPanel 
        projectId={projectId} 
        sessionId={sessionId}
      />

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
        </div>
      </div>
      <CursorOverlay cursors={cursors} currentUserId={user?.id} />
    </div>
  );
};

const DebugSessionPage = () => {
  console.log('DebugSessionPage wrapper rendering');
  
  try {
    return (
      <AutoFixProvider>
        <DebugSessionPageContent />
      </AutoFixProvider>
    );
  } catch (providerError) {
    console.error('Error in AutoFixProvider:', providerError);
    return (
      <div className="text-red-500 text-center p-8">
        <h2 className="text-xl font-semibold mb-2">Application Error</h2>
        <p className="mb-4">There was an error initializing the debug session</p>
        <p className="text-sm text-gray-600">
          Please refresh the page and try again.
        </p>
      </div>
    );
  }
};

export default DebugSessionPage;

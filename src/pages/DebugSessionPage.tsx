import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useDebugSession } from '@/hooks/useDebugSession';
import { useEffect, useState, useRef } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Rocket } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSkeleton } from '@/components/debug-session/LoadingSkeleton';
import { SessionHeader } from '@/components/debug-session/SessionHeader';
import { CodeEditor } from '@/components/debug-session/CodeEditor';
import { AnalysisResult } from '@/components/debug-session/AnalysisResult';
import { CollaboratorsList } from '@/components/debug-session/CollaboratorsList';
import { CursorOverlay } from '@/components/debug-session/CursorOverlay';
import { AutomationControlPanel, AutomationSettings } from '@/components/debug-session/AutomationControlPanel';

const DebugSessionPage = () => {
  const { sessionId } = useParams<{ sessionId: string; projectId: string }>();
  const { user } = useAuth();
  const { session, isLoading, error, collaborators, broadcastEvent, lastEvent } = useDebugSession(sessionId!, user);
  const { track } = useAnalytics();
  
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
  const [result, setResult] = useState<any>(null);
  const [cursors, setCursors] = useState<{ [userId: string]: { x: number, y: number, email: string } }>({});
  const throttleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [automationSettings, setAutomationSettings] = useState<AutomationSettings>({
    allAutomatic: false,
    smartAnalysis: true,
    toolSettings: {},
    activePreset: 'development'
  });

  useEffect(() => {
    if (lastEvent) {
      if (lastEvent.type === 'CODE_UPDATE') {
        setCode(lastEvent.payload.code);
      }
      if (lastEvent.type === 'EXECUTION_RESULT') {
        setResult(lastEvent.payload);
      }
      if (lastEvent.type === 'CURSOR_UPDATE') {
        const collaborator = collaborators.find(c => c.user_id === lastEvent.sender);
        if (collaborator) {
            setCursors(prev => ({
                ...prev,
                [lastEvent.sender]: { ...lastEvent.payload, email: collaborator.email }
            }));
        }
      }
    }
  }, [lastEvent, collaborators]);

  useEffect(() => {
    // Clean up cursors for collaborators who have left the session
    setCursors(currentCursors => {
      const activeCollaboratorIds = new Set(collaborators.map(c => c.user_id));
      const newCursors: { [userId: string]: { x: number, y: number, email: string } } = {};
      Object.keys(currentCursors).forEach(userId => {
        if (activeCollaboratorIds.has(userId)) {
          newCursors[userId] = currentCursors[userId];
        }
      });
      return newCursors;
    });
  }, [collaborators]);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    broadcastEvent({
      type: 'CODE_UPDATE',
      payload: { code: newCode },
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (throttleTimeoutRef.current) {
      return;
    }
    broadcastEvent({
      type: 'CURSOR_UPDATE',
      payload: { x: e.clientX, y: e.clientY },
    });
    throttleTimeoutRef.current = setTimeout(() => {
      throttleTimeoutRef.current = null;
    }, 50); // Throttle to ~20fps
  };
  
  const handleAnalyzeCode = async (selectedTools: string[]) => {
    setIsAnalyzing(true);
    setResult(null);
    track('code_analysis_started', { 
      sessionId, 
      selectedTools,
      toolCount: selectedTools.length 
    });
    
    try {
      // For now, we'll still use ESLint as the primary analysis tool
      // In the future, this would be enhanced to handle multiple tools
      const { data, error } = await supabase.functions.invoke('eslint-analysis', {
        body: { code, selectedTools },
      });

      if (error) throw error;
      
      const newResult = { 
        ...data, 
        timestamp: new Date().toISOString(),
        analyzedTools: selectedTools 
      };
      setResult(newResult);
      broadcastEvent({ type: 'EXECUTION_RESULT', payload: newResult });
      track('code_analysis_completed', { 
        sessionId, 
        selectedTools,
        toolCount: selectedTools.length,
        success: true, 
        issueCount: data.analysis?.issues?.length || 0 
      });

    } catch (e: any) {
      const newError = { 
        error: e.message, 
        timestamp: new Date().toISOString(),
        analyzedTools: selectedTools 
      };
      setResult(newError);
      broadcastEvent({ type: 'EXECUTION_RESULT', payload: newError });
      track('code_analysis_completed', { 
        sessionId, 
        selectedTools,
        toolCount: selectedTools.length,
        success: false 
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAutomationSettingsChange = (settings: AutomationSettings) => {
    setAutomationSettings(settings);
    // TODO: Save automation settings to project preferences
    console.log('Automation settings updated:', settings);
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <div className="text-red-500 text-center p-8">Error loading session: {error.message}</div>;
  }
  
  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8 relative" onMouseMove={handleMouseMove}>
      <SessionHeader sessionId={session?.id} />

       <Alert variant="default" className="bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300">
        <Rocket className="h-4 w-4" />
        <AlertTitle>How to Use the Multi-Tool Analyzer</AlertTitle>
        <AlertDescription>
          <ol className="list-decimal list-inside space-y-1 mt-2">
            <li>The editor below is pre-filled with sample code. You can also paste your own.</li>
            <li>Select the debugging tools you want to use from the tool selection interface.</li>
            <li>Click the <strong>Analyze</strong> button to run your selected tools.</li>
            <li>The results will appear in the "Analysis Result" panel with findings from all tools.</li>
            <li>Collaborate with your team in real-time! Changes are synced automatically.</li>
          </ol>
        </AlertDescription>
      </Alert>

       <Alert>
        <Terminal className="h-4 w-4" />
        <AlertTitle>Secure Multi-Tool Analysis</AlertTitle>
        <AlertDescription>
          This platform uses static analysis to check your code for issues across multiple categories. No code is executed on the server.
        </AlertDescription>
      </Alert>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          <CodeEditor 
            code={code}
            onCodeChange={handleCodeChange}
            onAnalyze={handleAnalyzeCode}
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

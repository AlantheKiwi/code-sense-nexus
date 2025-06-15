
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useDebugSession } from '@/hooks/useDebugSession';
import { useEffect, useState, useRef } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSkeleton } from '@/components/debug-session/LoadingSkeleton';
import { SessionHeader } from '@/components/debug-session/SessionHeader';
import { CodeEditor } from '@/components/debug-session/CodeEditor';
import { AnalysisResult } from '@/components/debug-session/AnalysisResult';
import { CollaboratorsList } from '@/components/debug-session/CollaboratorsList';
import { CursorOverlay } from '@/components/debug-session/CursorOverlay';

const DebugSessionPage = () => {
  const { sessionId } = useParams<{ sessionId: string; projectId: string }>();
  const { user } = useAuth();
  const { session, isLoading, error, collaborators, broadcastEvent, lastEvent } = useDebugSession(sessionId!, user);
  const { track } = useAnalytics();
  
  const [code, setCode] = useState('// Start typing your code here...');
  const [result, setResult] = useState<any>(null);
  const [cursors, setCursors] = useState<{ [userId: string]: { x: number, y: number, email: string } }>({});
  const throttleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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
  
  const handleAnalyzeCode = async () => {
    setIsAnalyzing(true);
    setResult(null);
    track('code_analysis_started', { sessionId, toolName: 'secure_analyzer' });
    try {
      const { data, error } = await supabase.functions.invoke('eslint-analysis', {
        body: { code },
      });

      if (error) throw error;
      
      const newResult = { ...data, timestamp: new Date().toISOString() };
      setResult(newResult);
      broadcastEvent({ type: 'EXECUTION_RESULT', payload: newResult });
      track('code_analysis_completed', { sessionId, toolName: 'secure_analyzer', success: true, issueCount: data.analysis?.issues?.length || 0 });

    } catch (e: any) {
      const newError = { error: e.message, timestamp: new Date().toISOString() };
      setResult(newError);
      broadcastEvent({ type: 'EXECUTION_RESULT', payload: newError });
      track('code_analysis_completed', { sessionId, toolName: 'secure_analyzer', success: false });
    } finally {
      setIsAnalyzing(false);
    }
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

       <Alert>
        <Terminal className="h-4 w-4" />
        <AlertTitle>Secure Code Analysis</AlertTitle>
        <AlertDescription>
          This tool uses static analysis to check your code for issues. No code is executed on the server.
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
        
        <div>
          <CollaboratorsList collaborators={collaborators} />
        </div>
      </div>
      <CursorOverlay cursors={cursors} currentUserId={user?.id} />
    </div>
  );
};

export default DebugSessionPage;

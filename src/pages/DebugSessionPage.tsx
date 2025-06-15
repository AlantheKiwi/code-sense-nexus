import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useDebugSession } from '@/hooks/useDebugSession';
import { useEffect, useState, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, MousePointer2 } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { supabase } from '@/integrations/supabase/client';

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
      const newCursors = {};
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
    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-8 w-1/4" />
            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-4">
                    <Skeleton className="h-64" />
                    <Skeleton className="h-40" />
                </div>
                <div>
                    <Skeleton className="h-48" />
                </div>
            </div>
        </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-8">Error loading session: {error.message}</div>;
  }
  
  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8 relative" onMouseMove={handleMouseMove}>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Live Debugging Session</h1>
        <p className="text-muted-foreground">Session ID: {session?.id}</p>
      </div>

       <Alert>
        <Terminal className="h-4 w-4" />
        <AlertTitle>Secure Code Analysis</AlertTitle>
        <AlertDescription>
          This tool uses static analysis to check your code for issues. No code is executed on the server.
        </AlertDescription>
      </Alert>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Shared Code Editor</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea 
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                className="font-mono h-64 bg-gray-900 text-green-400"
                placeholder="Enter your Javascript code here"
              />
              <Button onClick={handleAnalyzeCode} className="mt-4" disabled={isAnalyzing}>
                {isAnalyzing ? 'Analyzing...' : 'Analyze Code'}
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Analysis Result</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-900 text-white p-4 rounded-md overflow-x-auto h-40">
                {isAnalyzing 
                  ? 'Analyzing code...' 
                  : result 
                    ? JSON.stringify(result, null, 2) 
                    : 'No result yet. Click "Analyze Code" to run the analysis.'}
              </pre>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Collaborators</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {collaborators.map((c: any) => (
                <div key={c.user_id} className="flex items-center gap-3">
                   <Tooltip>
                    <TooltipTrigger>
                      <Avatar>
                        <AvatarImage src={`https://i.pravatar.cc/150?u=${c.email}`} />
                        <AvatarFallback>{c.email?.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>{c.email}</TooltipContent>
                   </Tooltip>
                  <span className="text-sm font-medium">{c.email}</span>
                </div>
              ))}
              {collaborators.length === 0 && <p className="text-sm text-muted-foreground">Just you so far.</p>}
            </CardContent>
          </Card>
        </div>
      </div>
      {Object.entries(cursors).map(([userId, cursorData]) => {
        if (userId === user?.id) return null;
        return (
          <div
            key={userId}
            className="absolute flex items-center gap-1 text-white bg-blue-500/80 px-2 py-1 rounded-full pointer-events-none transition-all duration-75 ease-out"
            style={{ left: cursorData.x, top: cursorData.y, zIndex: 50, transform: 'translateY(-100%)' }}
          >
            <MousePointer2 className="h-4 w-4" />
            <span className="text-xs font-medium">{cursorData.email}</span>
          </div>
        );
      })}
    </div>
  );
};

export default DebugSessionPage;

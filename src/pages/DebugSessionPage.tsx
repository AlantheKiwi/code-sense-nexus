
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useDebugSession } from '@/hooks/useDebugSession';
import { useEffect, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

const DebugSessionPage = () => {
  const { sessionId } = useParams<{ sessionId: string; projectId: string }>();
  const { user } = useAuth();
  const { session, isLoading, error, collaborators, broadcastEvent, lastEvent } = useDebugSession(sessionId!, user);
  
  const [code, setCode] = useState('// Start typing your code here...');
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (lastEvent) {
      if (lastEvent.type === 'CODE_UPDATE') {
        setCode(lastEvent.payload.code);
      }
      if (lastEvent.type === 'EXECUTION_RESULT') {
        setResult(lastEvent.payload);
      }
    }
  }, [lastEvent]);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    broadcastEvent({
      type: 'CODE_UPDATE',
      payload: { code: newCode },
    });
  };
  
  const handleExecuteCode = () => {
    // WARNING: eval is used for demo purposes ONLY. DO NOT USE IN PRODUCTION.
    try {
      const executionResult = eval(code);
      const newResult = { output: executionResult, timestamp: new Date().toISOString() };
      setResult(newResult);
      broadcastEvent({ type: 'EXECUTION_RESULT', payload: newResult });
    } catch (e: any) {
      const newError = { error: e.message, stack: e.stack, timestamp: new Date().toISOString() };
      setResult(newError);
      broadcastEvent({ type: 'EXECUTION_RESULT', payload: newError });
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
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Live Debugging Session</h1>
        <p className="text-muted-foreground">Session ID: {session?.id}</p>
      </div>

       <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Developer Demo</AlertTitle>
        <AlertDescription>
          This live debugger uses `eval()` for code execution and is for demonstration purposes only. Do not use in production.
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
              <Button onClick={handleExecuteCode} className="mt-4">Execute</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Execution Result</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-900 text-white p-4 rounded-md overflow-x-auto h-40">
                {result ? JSON.stringify(result, null, 2) : 'No result yet. Click "Execute" to run the code.'}
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
    </div>
  );
};

export default DebugSessionPage;

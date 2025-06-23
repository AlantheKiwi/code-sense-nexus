
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useDebugSession } from '@/hooks/useDebugSession';
import { useEffect, useState, useCallback } from 'react';
import { LoadingSkeleton } from '@/components/debug-session/LoadingSkeleton';
import { SessionHeader } from '@/components/debug-session/SessionHeader';
import { DebugSessionInstructions } from '@/components/debug-session/DebugSessionInstructions';
import { useDebugSessionAnalysis } from '@/hooks/useDebugSessionAnalysis';
import { useDebugSessionCursor } from '@/hooks/useDebugSessionCursor';
import { SystemStatusNotice } from './SystemStatusNotice';
import { DebugSessionMainGrid } from './DebugSessionMainGrid';
import { MobileDebugSession } from './MobileDebugSession';
import { SimpleAutoFixPanel } from '@/components/debug-session/SimpleAutoFixPanel';
import { AIAssistantPanel } from '@/components/ai/AIAssistantPanel';
import { BillingWrapper } from '@/components/billing/BillingWrapper';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { useIsMobile } from '@/hooks/use-mobile';
import { CursorOverlay } from '@/components/debug-session/CursorOverlay';

export interface AutomationSettings {
  allAutomatic: boolean;
  smartAnalysis: boolean;
  toolSettings: Record<string, any>;
  activePreset: string;
}

const DebugSessionContent = () => {
  const { sessionId, projectId } = useParams<{ sessionId: string; projectId: string }>();
  const { user } = useAuth();
  const { loadUsageData } = useUsageTracking();
  const isMobile = useIsMobile();
  
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
  console.log('DebugSessionContent rendering with:', { sessionId, projectId, user: user?.id });
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

  // Load usage data when component mounts
  useEffect(() => {
    if (user?.id) {
      loadUsageData();
    }
  }, [user?.id, loadUsageData]);

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

  const handleAIPromptApply = useCallback((prompt: string) => {
    console.log('AI prompt applied:', prompt);
    // In a real implementation, this might open Lovable with the prompt
    // or copy it to clipboard for the user
  }, []);

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
    <div className={`${isMobile ? 'px-2 py-4' : 'container mx-auto p-4 md:p-8'} space-y-8 relative`} onMouseMove={onMouseMove}>
      <SessionHeader sessionId={session?.id} />
      
      {/* Usage Meter at the top */}
      <BillingWrapper 
        analysisType="basic"
        featureName="Code Analysis"
        showUsageMeter={true}
        showPricingLink={true}
      >
        <div></div>
      </BillingWrapper>
      
      {/* Instructions for desktop only */}
      {!isMobile && <DebugSessionInstructions />}
      
      {/* Mobile vs Desktop Layout */}
      {isMobile ? (
        <MobileDebugSession
          code={code}
          onCodeChange={handleCodeChange}
          onAnalyze={onAnalyze}
          isAnalyzing={isAnalyzing}
          result={result}
          collaborators={collaborators}
          projectId={projectId}
          sessionId={sessionId}
        />
      ) : (
        <>
          <DebugSessionMainGrid
            code={code}
            onCodeChange={handleCodeChange}
            onAnalyze={onAnalyze}
            isAnalyzing={isAnalyzing}
            result={result}
            collaborators={collaborators}
          />

          <SystemStatusNotice />

          {/* AI Assistant Panel */}
          <AIAssistantPanel 
            code={code}
            filePath="debug-session.tsx"
            projectType="lovable"
            userTier="premium"
            onApplyPrompt={handleAIPromptApply}
          />

          {/* Auto-Fix Panel */}
          <SimpleAutoFixPanel 
            projectId={projectId} 
            sessionId={sessionId}
          />
        </>
      )}

      <CursorOverlay cursors={cursors} currentUserId={user?.id} />
    </div>
  );
};

export default DebugSessionContent;

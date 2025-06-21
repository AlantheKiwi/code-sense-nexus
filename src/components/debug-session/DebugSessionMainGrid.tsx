
import { CodeEditor } from '@/components/debug-session/CodeEditor';
import { AnalysisResult } from '@/components/debug-session/AnalysisResult';
import { CollaboratorsList } from '@/components/debug-session/CollaboratorsList';

interface DebugSessionMainGridProps {
  code: string;
  onCodeChange: (code: string) => void;
  onAnalyze: (selectedTools: string[]) => void;
  isAnalyzing: boolean;
  result: any;
  collaborators: any[];
}

export const DebugSessionMainGrid = ({
  code,
  onCodeChange,
  onAnalyze,
  isAnalyzing,
  result,
  collaborators
}: DebugSessionMainGridProps) => {
  return (
    <div className="grid md:grid-cols-4 gap-8">
      {/* Main content area with Code Editor prominently placed */}
      <div className="md:col-span-3 space-y-6">
        <CodeEditor 
          code={code}
          onCodeChange={onCodeChange}
          onAnalyze={onAnalyze}
          isAnalyzing={isAnalyzing}
        />
        <AnalysisResult result={result} isAnalyzing={isAnalyzing} />
      </div>
      
      {/* Sidebar with collaborators and supporting panels */}
      <div className="space-y-6">
        <CollaboratorsList collaborators={collaborators} />
      </div>
    </div>
  );
};

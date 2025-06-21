
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Play, Loader2 } from 'lucide-react';
import { ToolSelectionGrid } from './tool-selection/ToolSelectionGrid';
import { BillingWrapper } from '@/components/billing/BillingWrapper';

interface CodeEditorProps {
  code: string;
  onCodeChange: (code: string) => void;
  onAnalyze: (selectedTools: string[]) => void;
  isAnalyzing: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onCodeChange,
  onAnalyze,
  isAnalyzing
}) => {
  const [selectedTools, setSelectedTools] = React.useState<string[]>(['eslint', 'lighthouse']);

  const handleAnalyzeClick = () => {
    onAnalyze(selectedTools);
  };

  return (
    <div className="space-y-4">
      {/* Usage Meter */}
      <BillingWrapper 
        analysisType="basic"
        featureName="Code Analysis"
        showUsageMeter={true}
      >
        <div></div>
      </BillingWrapper>

      {/* Code Editor */}
      <Card>
        <CardHeader>
          <CardTitle>Live Code Editor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            className="font-mono text-sm min-h-[300px]"
            placeholder="Paste your code here..."
          />
          
          <ToolSelectionGrid
            selectedTools={selectedTools}
            onSelectionChange={setSelectedTools}
          />
          
          <BillingWrapper
            analysisType="basic"
            featureName="Code Analysis"
            onAnalysisAttempt={handleAnalyzeClick}
            showUsageMeter={false}
          >
            <Button
              className="w-full"
              disabled={isAnalyzing || selectedTools.length === 0}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Analyze Code
                </>
              )}
            </Button>
          </BillingWrapper>
        </CardContent>
      </Card>
    </div>
  );
};

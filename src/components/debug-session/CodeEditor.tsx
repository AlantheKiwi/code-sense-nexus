
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { LLMSelector } from '@/components/ai/LLMSelector';
import { AIAnalysisResults } from '@/components/ai/AIAnalysisResults';
import { BillingWrapper } from '@/components/billing/BillingWrapper';
import { useLLMAnalysis } from '@/hooks/useLLMAnalysis';

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
  const {
    isAnalyzing: isLLMAnalyzing,
    currentAnalysis,
    userCredits,
    analyzeWithLLM,
    clearAnalysis,
    loadUserCredits
  } = useLLMAnalysis();

  useEffect(() => {
    loadUserCredits();
  }, [loadUserCredits]);

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
        </CardContent>
      </Card>

      {/* AI Analysis Section */}
      <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LLM Selectors */}
        <div className="space-y-4">
          <LLMSelector
            analysisType="code_quality"
            onAnalyze={analyzeWithLLM}
            code={code}
            userCredits={userCredits}
            isAnalyzing={isLLMAnalyzing}
          />
          
          <LLMSelector
            analysisType="security"
            onAnalyze={analyzeWithLLM}
            code={code}
            userCredits={userCredits}
            isAnalyzing={isLLMAnalyzing}
          />
        </div>

        {/* Analysis Results */}
        <div>
          {currentAnalysis && (
            <AIAnalysisResults
              result={currentAnalysis}
              onClear={clearAnalysis}
            />
          )}
        </div>
      </div>
    </div>
  );
};

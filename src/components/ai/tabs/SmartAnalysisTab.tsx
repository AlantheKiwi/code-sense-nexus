
import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, Zap } from 'lucide-react';

interface SmartAnalysisTabProps {
  isAnalyzing: boolean;
  analysis: any;
  onAnalyze: () => void;
}

export const SmartAnalysisTab: React.FC<SmartAnalysisTabProps> = ({
  isAnalyzing,
  analysis,
  onAnalyze
}) => {
  return (
    <div className="space-y-3">
      <Button
        onClick={onAnalyze}
        disabled={isAnalyzing}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 mr-2" />
            Run Smart Analysis
          </>
        )}
      </Button>

      {analysis && !analysis.lovablePrompts && (
        <div className="space-y-3">
          <Alert className="border-green-200 bg-green-50">
            <Zap className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              <strong>Analysis Complete!</strong> {analysis.summary}
            </AlertDescription>
          </Alert>

          {analysis.codeQualityScore && (
            <div className="flex items-center justify-between p-3 bg-white rounded border">
              <span className="text-sm font-medium">Code Quality Score</span>
              <Badge className={
                analysis.codeQualityScore >= 80 ? 'bg-green-100 text-green-800' :
                analysis.codeQualityScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }>
                {analysis.codeQualityScore}/100
              </Badge>
            </div>
          )}

          {analysis.insights && analysis.insights.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-blue-800">Key Insights</h4>
              <div className="space-y-1">
                {analysis.insights.map((insight: string, index: number) => (
                  <div key={index} className="text-sm p-2 bg-white rounded border-l-2 border-blue-300">
                    {insight}
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysis.recommendations && analysis.recommendations.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-blue-800">Recommendations</h4>
              <div className="space-y-1">
                {analysis.recommendations.map((rec: string, index: number) => (
                  <div key={index} className="text-sm p-2 bg-white rounded border-l-2 border-green-300">
                    💡 {rec}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

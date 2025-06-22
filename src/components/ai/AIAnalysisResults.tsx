
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign,
  Brain,
  Copy,
  Download,
  Share
} from 'lucide-react';
import { type AnalysisResult } from '@/services/ai/LLMGateway';
import { toast } from 'sonner';

interface AIAnalysisResultsProps {
  result: AnalysisResult;
  onClear?: () => void;
}

export const AIAnalysisResults: React.FC<AIAnalysisResultsProps> = ({ 
  result, 
  onClear 
}) => {
  const getSeverityColor = (severity: string) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return colors[severity] || colors.medium;
  };

  const getSeverityIcon = (severity: string) => {
    if (severity === 'critical' || severity === 'high') {
      return <AlertTriangle className="h-4 w-4" />;
    }
    return <CheckCircle className="h-4 w-4" />;
  };

  const copyToClipboard = (issue: any) => {
    const issueText = `
**${issue.type || 'Issue'}** (${issue.severity})
${issue.lineNumber ? `Line ${issue.lineNumber}` : ''}

Description: ${issue.description}

${issue.suggestion ? `Suggestion: ${issue.suggestion}` : ''}
    `.trim();
    
    navigator.clipboard.writeText(issueText);
    toast.success('Issue details copied to clipboard!');
  };

  const formatAnalysisType = (type: string) => {
    const types = {
      code_quality: 'Code Quality',
      architecture: 'Architecture Review',
      security: 'Security Audit',
      performance: 'Performance Analysis',
      lovable_prompt: 'Lovable Prompt'
    };
    return types[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              {formatAnalysisType(result.analysisType)} Results
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {result.provider}
              </Badge>
              {onClear && (
                <Button variant="outline" size="sm" onClick={onClear}>
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm">
                {Math.round(result.usage.processingTimeMs / 1000)}s
              </span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <span className="text-sm">
                {result.usage.costInCredits} credits
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-gray-500" />
              <span className="text-sm">
                {result.usage.tokensUsed || 0} tokens
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Summary
            {result.result.score && (
              <Badge className={`
                ${result.result.score >= 80 ? 'bg-green-100 text-green-800' : 
                  result.result.score >= 60 ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-red-100 text-red-800'}
              `}>
                Score: {result.result.score}/100
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">{result.result.summary}</p>
          {result.result.estimatedFixTime && (
            <div className="mt-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Estimated fix time: {result.result.estimatedFixTime}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Issues */}
      {result.result.issues && result.result.issues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Issues Found ({result.result.issues.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {result.result.issues.map((issue, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getSeverityIcon(issue.severity)}
                      <Badge className={getSeverityColor(issue.severity)}>
                        {issue.severity}
                      </Badge>
                      <span className="font-medium">{issue.type}</span>
                      {issue.lineNumber && (
                        <Badge variant="outline">
                          Line {issue.lineNumber}
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(issue)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-gray-700 mb-2">{issue.description}</p>
                  {issue.suggestion && (
                    <div className="bg-blue-50 p-3 rounded border-l-2 border-blue-300">
                      <p className="text-sm text-blue-800">
                        <strong>Suggestion:</strong> {issue.suggestion}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Share className="h-4 w-4" />
              Share Results
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

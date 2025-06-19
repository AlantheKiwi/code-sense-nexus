
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, TrendingUp, Clock, Code, Zap, Target } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface FixResult {
  recommendationId: string;
  title: string;
  success: boolean;
  beforeState: {
    issueCount: number;
    performanceScore?: number;
    bundleSize?: string;
    codeSnippet?: string;
  };
  afterState: {
    issueCount: number;
    performanceScore?: number;
    bundleSize?: string;
    codeSnippet?: string;
  };
  improvements: {
    metric: string;
    before: string;
    after: string;
    improvement: string;
  }[];
  timeSpent: string;
  impact: 'high' | 'medium' | 'low';
}

interface FixResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  result?: FixResult;
}

export const FixResultsModal = ({ isOpen, onClose, result }: FixResultsModalProps) => {
  const [animationStep, setAnimationStep] = useState(0);

  useEffect(() => {
    if (isOpen && result) {
      // Animate the progress over 2 seconds
      const timer = setTimeout(() => setAnimationStep(1), 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, result]);

  if (!result) return null;

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'low': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {result.success ? (
              <CheckCircle className="h-6 w-6 text-green-500" />
            ) : (
              <XCircle className="h-6 w-6 text-red-500" />
            )}
            Fix Applied: {result.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Success Banner */}
          <Card className={`border-l-4 ${result.success ? 'border-l-green-500 bg-green-50' : 'border-l-red-500 bg-red-50'}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">
                    {result.success ? 'Fix Applied Successfully!' : 'Fix Application Failed'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {result.success 
                      ? 'Your code has been improved and issues have been resolved.'
                      : 'The fix could not be applied automatically. Manual intervention required.'
                    }
                  </p>
                </div>
                <Badge className={`${getImpactColor(result.impact)} border`}>
                  {result.impact.toUpperCase()} IMPACT
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Before vs After Comparison */}
          {result.success && (
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    Before Fix
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Issues Found</span>
                    <Badge variant="destructive">{result.beforeState.issueCount}</Badge>
                  </div>
                  {result.beforeState.performanceScore && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Performance Score</span>
                      <span className="text-sm font-mono">{result.beforeState.performanceScore}%</span>
                    </div>
                  )}
                  {result.beforeState.bundleSize && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Bundle Size</span>
                      <span className="text-sm font-mono">{result.beforeState.bundleSize}</span>
                    </div>
                  )}
                  {result.beforeState.codeSnippet && (
                    <div>
                      <span className="text-xs text-muted-foreground">Code Sample</span>
                      <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                        {result.beforeState.codeSnippet}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    After Fix
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Issues Found</span>
                    <Badge variant={result.afterState.issueCount === 0 ? "default" : "secondary"}>
                      {result.afterState.issueCount}
                    </Badge>
                  </div>
                  {result.afterState.performanceScore && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Performance Score</span>
                      <span className="text-sm font-mono text-green-600">
                        {result.afterState.performanceScore}%
                      </span>
                    </div>
                  )}
                  {result.afterState.bundleSize && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Bundle Size</span>
                      <span className="text-sm font-mono text-green-600">{result.afterState.bundleSize}</span>
                    </div>
                  )}
                  {result.afterState.codeSnippet && (
                    <div>
                      <span className="text-xs text-muted-foreground">Code Sample</span>
                      <pre className="text-xs bg-green-50 p-2 rounded mt-1 overflow-x-auto">
                        {result.afterState.codeSnippet}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Improvements Summary */}
          {result.success && result.improvements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Improvements Achieved
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result.improvements.map((improvement, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Target className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">{improvement.metric}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">{improvement.before}</span>
                        <span>→</span>
                        <span className="text-green-600 font-medium">{improvement.after}</span>
                        <Badge variant="outline" className="text-green-600 border-green-200">
                          {improvement.improvement}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Fix Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Fix Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Time Spent</div>
                    <div className="font-medium">{result.timeSpent}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Fix Type</div>
                    <div className="font-medium">Automated</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Impact Level</div>
                    <div className="font-medium capitalize">{result.impact}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={onClose}>
              Close Results
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

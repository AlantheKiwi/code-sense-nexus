
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Heart, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Wand2, 
  TrendingUp,
  Clock,
  Shield
} from 'lucide-react';
import { LovableIntegration, LovableIssue, LovableHealthMetrics } from '@/services/LovableIntegration';

interface LovableAssistantProps {
  code: string;
  onFixIssues: (fixes: any[]) => void;
}

export const LovableAssistant: React.FC<LovableAssistantProps> = ({ code, onFixIssues }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [issues, setIssues] = useState<LovableIssue[]>([]);
  const [metrics, setMetrics] = useState<LovableHealthMetrics | null>(null);
  const integration = React.useMemo(() => new LovableIntegration(), []);

  const handleHealthCheck = async () => {
    setIsAnalyzing(true);
    try {
      console.log('Running Lovable code health check...');
      
      // Simulate analyzing the current code
      const detectedIssues = await integration.analyzeCodeForLovableIssues(code, 'current-file.tsx');
      setIssues(detectedIssues);
      
      // Generate health metrics
      const healthMetrics = integration.generateHealthMetrics();
      setMetrics(healthMetrics);
      
      console.log(`Found ${detectedIssues.length} Lovable-specific issues`);
    } catch (error) {
      console.error('Error during health check:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFixLovableIssues = async () => {
    if (issues.length === 0) return;
    
    try {
      console.log('Generating fixes for Lovable issues...');
      const fixes = await integration.generateFixes(issues);
      onFixIssues(fixes);
    } catch (error) {
      console.error('Error generating fixes:', error);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-800">
          <Heart className="h-5 w-5 text-pink-500" />
          Lovable Assistant
        </CardTitle>
        <p className="text-sm text-purple-600">
          Making your Lovable projects even better
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Health Check Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Button
              onClick={handleHealthCheck}
              disabled={isAnalyzing}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Shield className="h-4 w-4 mr-2" />
              {isAnalyzing ? 'Checking...' : 'Lovable Code Health Check'}
            </Button>
            
            {issues.length > 0 && (
              <Button
                onClick={handleFixLovableIssues}
                variant="outline"
                className="border-purple-300 text-purple-700 hover:bg-purple-100"
              >
                <Wand2 className="h-4 w-4 mr-2" />
                Fix Lovable Issues ({issues.length})
              </Button>
            )}
          </div>
          
          {isAnalyzing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  Analyzing Lovable Code...
                </Badge>
              </div>
              <p className="text-xs text-purple-600">
                Checking for common issues in Lovable-generated code...
              </p>
            </div>
          )}
        </div>

        {/* Health Metrics */}
        {metrics && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(metrics.overallScore)}`}>
                  {metrics.overallScore}%
                </div>
                <div className="text-xs text-gray-600">Code Health</div>
                <Progress value={metrics.overallScore} className="mt-1" />
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(metrics.readinessScore)}`}>
                  {metrics.readinessScore}%
                </div>
                <div className="text-xs text-gray-600">Deploy Ready</div>
                <Progress value={metrics.readinessScore} className="mt-1" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white p-2 rounded border">
                <div className="flex items-center justify-center gap-1">
                  <Clock className="h-3 w-3 text-green-600" />
                  <span className="text-sm font-medium text-green-600">
                    {metrics.timeSavedMinutes}m
                  </span>
                </div>
                <div className="text-xs text-gray-600">Time Saved</div>
              </div>
              <div className="bg-white p-2 rounded border">
                <div className="flex items-center justify-center gap-1">
                  <TrendingUp className="h-3 w-3 text-blue-600" />
                  <span className="text-sm font-medium text-blue-600">
                    {metrics.issuesPrevented}
                  </span>
                </div>
                <div className="text-xs text-gray-600">Issues Found</div>
              </div>
              <div className="bg-white p-2 rounded border">
                <div className="flex items-center justify-center gap-1">
                  <CheckCircle className="h-3 w-3 text-purple-600" />
                  <span className="text-sm font-medium text-purple-600">
                    {metrics.readinessScore > 80 ? 'Ready' : 'Needs Work'}
                  </span>
                </div>
                <div className="text-xs text-gray-600">Status</div>
              </div>
            </div>
          </div>
        )}

        {/* Issues List */}
        {issues.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-purple-700 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Lovable Code Issues ({issues.length})
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {issues.map((issue) => (
                <div key={issue.id} className="bg-white p-3 rounded border border-purple-200">
                  <div className="flex items-start gap-2">
                    {getSeverityIcon(issue.severity)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{issue.title}</span>
                        <Badge variant="outline" className="text-xs">
                          {issue.type}
                        </Badge>
                        {issue.autoFixable && (
                          <Badge className="text-xs bg-green-100 text-green-800">
                            Auto-fixable
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{issue.description}</p>
                      <p className="text-xs text-purple-600 mt-1">💡 {issue.suggestion}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Success State */}
        {metrics && metrics.overallScore >= 90 && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              🎉 Excellent! Your Lovable project is {metrics.readinessScore}% ready to deploy. 
              You've saved approximately {metrics.timeSavedMinutes} minutes of debugging time!
            </AlertDescription>
          </Alert>
        )}

        {/* Help Text */}
        {issues.length === 0 && !isAnalyzing && (
          <div className="text-center py-4 text-purple-600">
            <Heart className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              Run a health check to see how your Lovable code is doing!
            </p>
            <p className="text-xs mt-1 text-purple-500">
              We'll help you catch issues before they become problems.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

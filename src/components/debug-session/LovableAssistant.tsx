
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Heart, 
  CheckCircle, 
  Wand2, 
  Zap,
  Shield
} from 'lucide-react';
import { 
  LovableIntegration, 
  LovableIssue, 
  LovableHealthMetrics, 
  FixResult,
  LovablePromptSuggestion 
} from '@/services/LovableIntegration';
import { LovableGuidance } from './LovableGuidance';
import { LovableHealthMetricsComponent } from './LovableHealthMetrics';
import { LovableIssuesList } from './LovableIssuesList';

interface LovableAssistantProps {
  code: string;
  onFixIssues: (fixes: FixResult[]) => void;
}

export const LovableAssistant: React.FC<LovableAssistantProps> = ({ code, onFixIssues }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isApplyingFixes, setIsApplyingFixes] = useState(false);
  const [issues, setIssues] = useState<LovableIssue[]>([]);
  const [metrics, setMetrics] = useState<LovableHealthMetrics | null>(null);
  const [suggestions, setSuggestions] = useState<LovablePromptSuggestion[]>([]);
  const [appliedFixes, setAppliedFixes] = useState<FixResult[]>([]);
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
      
      // Generate prompt suggestions
      const promptSuggestions = integration.generatePromptSuggestions(code);
      setSuggestions(promptSuggestions);
      
      console.log(`Found ${detectedIssues.length} Lovable-specific issues`);
    } catch (error) {
      console.error('Error during health check:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFixLovableIssues = async () => {
    if (issues.length === 0) return;
    
    setIsApplyingFixes(true);
    try {
      console.log('Applying automatic fixes for Lovable issues...');
      
      // Get all auto-fixable issues
      const autoFixableIssues = issues.filter(issue => issue.autoFixable);
      const issueIds = autoFixableIssues.map(issue => issue.id);
      
      if (issueIds.length === 0) {
        console.log('No auto-fixable issues found');
        return;
      }
      
      // Apply fixes
      const fixResults = await integration.applyAutoFixes(issueIds);
      setAppliedFixes(fixResults);
      
      // Update issues list (remove successfully fixed issues)
      const successfullyFixedIds = fixResults
        .filter(result => result.success)
        .map(result => result.issueId);
      
      setIssues(currentIssues => 
        currentIssues.filter(issue => !successfullyFixedIds.includes(issue.id))
      );
      
      // Update metrics
      const updatedMetrics = integration.generateHealthMetrics();
      setMetrics(updatedMetrics);
      
      // Notify parent component
      onFixIssues(fixResults);
      
      console.log(`Applied ${fixResults.filter(r => r.success).length} fixes successfully`);
    } catch (error) {
      console.error('Error applying fixes:', error);
    } finally {
      setIsApplyingFixes(false);
    }
  };

  const handleSuggestionClick = (suggestion: LovablePromptSuggestion) => {
    // Copy suggestion to clipboard
    navigator.clipboard.writeText(suggestion.prompt).then(() => {
      console.log('Prompt copied to clipboard:', suggestion.prompt);
      // You could show a toast notification here
    }).catch(err => {
      console.error('Failed to copy prompt:', err);
    });
  };

  return (
    <div className="space-y-4">
      {/* Main Lovable Assistant Card */}
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
                  disabled={isApplyingFixes || issues.filter(i => i.autoFixable).length === 0}
                  variant="outline"
                  className="border-purple-300 text-purple-700 hover:bg-purple-100"
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  {isApplyingFixes 
                    ? 'Applying Fixes...' 
                    : `Auto-Fix Issues (${issues.filter(i => i.autoFixable).length})`
                  }
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
          {metrics && <LovableHealthMetricsComponent metrics={metrics} />}

          {/* Applied Fixes Summary */}
          {appliedFixes.length > 0 && (
            <Alert className="border-green-200 bg-green-50">
              <Zap className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                ✨ Applied {appliedFixes.filter(f => f.success).length} automatic fixes! 
                Your code is now more robust and ready for production.
              </AlertDescription>
            </Alert>
          )}

          {/* Issues List */}
          <LovableIssuesList issues={issues} />

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
          {issues.length === 0 && !isAnalyzing && !metrics && (
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

      {/* Lovable Guidance */}
      {metrics && suggestions.length > 0 && (
        <LovableGuidance
          suggestions={suggestions}
          completionPercentage={metrics.completionPercentage}
          deploymentBlockers={metrics.deploymentBlockers}
          missingFeatures={metrics.missingFeatures}
          onSuggestionClick={handleSuggestionClick}
        />
      )}
    </div>
  );
};

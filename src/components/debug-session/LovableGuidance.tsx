
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Lightbulb, 
  Target, 
  TrendingUp, 
  CheckCircle2,
  AlertCircle,
  Rocket,
  BookOpen,
  MessageCircle
} from 'lucide-react';
import { LovablePromptSuggestion } from '@/services/LovableIntegration';

interface LovableGuidanceProps {
  suggestions: LovablePromptSuggestion[];
  completionPercentage: number;
  deploymentBlockers: string[];
  missingFeatures: string[];
  onSuggestionClick: (suggestion: LovablePromptSuggestion) => void;
}

export const LovableGuidance: React.FC<LovableGuidanceProps> = ({
  suggestions,
  completionPercentage,
  deploymentBlockers,
  missingFeatures,
  onSuggestionClick
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'enhancement': return <TrendingUp className="h-4 w-4" />;
      case 'feature': return <Target className="h-4 w-4" />;
      case 'quality': return <CheckCircle2 className="h-4 w-4" />;
      case 'deployment': return <Rocket className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getCompletionStatus = () => {
    if (completionPercentage >= 90) return { text: 'Ready to Ship! 🚀', color: 'text-green-600' };
    if (completionPercentage >= 70) return { text: 'Almost Ready', color: 'text-blue-600' };
    if (completionPercentage >= 50) return { text: 'Good Progress', color: 'text-yellow-600' };
    return { text: 'Getting Started', color: 'text-orange-600' };
  };

  const status = getCompletionStatus();

  return (
    <div className="space-y-4">
      {/* Project Status */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Target className="h-5 w-5" />
            Project Completion Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">Progress</span>
            <span className={`font-bold ${status.color}`}>{completionPercentage}% Complete</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <p className={`text-sm font-medium ${status.color}`}>{status.text}</p>
        </CardContent>
      </Card>

      {/* Deployment Blockers */}
      {deploymentBlockers.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              Deployment Blockers ({deploymentBlockers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {deploymentBlockers.map((blocker, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span className="text-sm text-red-700">{blocker}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-red-600 mt-2">
              Fix these issues before deploying to production
            </p>
          </CardContent>
        </Card>
      )}

      {/* Missing Features */}
      {missingFeatures.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <BookOpen className="h-5 w-5" />
              Recommended Enhancements ({missingFeatures.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {missingFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                  <span className="text-sm text-yellow-700">{feature}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-yellow-600 mt-2">
              These will improve user experience and code quality
            </p>
          </CardContent>
        </Card>
      )}

      {/* Smart Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Your Next Lovable Prompts
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Smart suggestions based on your current code
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {suggestions.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Great work! No immediate suggestions.</p>
              <p className="text-xs">Your code looks well-structured.</p>
            </div>
          ) : (
            suggestions.slice(0, 5).map((suggestion, index) => (
              <Card key={index} className="p-3 border border-gray-200 hover:border-blue-300 transition-colors">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(suggestion.category)}
                    <Badge variant="outline" className={getPriorityColor(suggestion.priority)}>
                      {suggestion.priority} priority
                    </Badge>
                    <Badge variant="outline" className="text-xs capitalize">
                      {suggestion.category}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{suggestion.prompt}</p>
                    <p className="text-xs text-muted-foreground">{suggestion.reasoning}</p>
                    <p className="text-xs text-blue-600">💡 {suggestion.estimatedImpact}</p>
                  </div>
                  
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full text-xs"
                    onClick={() => onSuggestionClick(suggestion)}
                  >
                    Use This Prompt in Lovable
                  </Button>
                </div>
              </Card>
            ))
          )}
          
          {suggestions.length > 5 && (
            <p className="text-xs text-center text-muted-foreground">
              +{suggestions.length - 5} more suggestions available
            </p>
          )}
        </CardContent>
      </Card>

      {/* Success State */}
      {completionPercentage >= 90 && deploymentBlockers.length === 0 && (
        <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <Rocket className="h-8 w-8 mx-auto text-green-600" />
              <h3 className="font-bold text-green-800">🎉 Ready for Production!</h3>
              <p className="text-sm text-green-700">
                Your Lovable project has passed all quality checks and is ready to deploy.
              </p>
              <Button className="bg-green-600 hover:bg-green-700">
                Deploy Your App
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};


import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lightbulb, CheckCircle, Clock, TrendingUp, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useLighthouseRecommendationActions } from '@/hooks/useLighthouseRecommendationActions';
import type { Recommendation } from '../IssuesRecommendationsDashboard';

interface RecommendationsPanelProps {
  recommendations: Recommendation[];
  compact?: boolean;
}

export const RecommendationsPanel = ({ 
  recommendations, 
  compact = false 
}: RecommendationsPanelProps) => {
  const [applyingFix, setApplyingFix] = useState<string | null>(null);
  const { executeAutomatedFix, updateRecommendationStatus } = useLighthouseRecommendationActions();

  const handleApplyFix = async (recommendation: Recommendation) => {
    setApplyingFix(recommendation.id);
    
    try {
      toast.info(`Applying fix: ${recommendation.title}`, {
        description: 'Starting implementation...'
      });

      // Update status to in_progress
      await updateRecommendationStatus(recommendation.id, 'in_progress');

      // Check if this is an automated fix
      if (recommendation.is_automated) {
        // Execute automated fix through the lighthouse recommendation engine
        const result = await executeAutomatedFix(recommendation.id);
        
        if (result.success) {
          await updateRecommendationStatus(recommendation.id, 'completed');
          toast.success(`Fix applied successfully!`, {
            description: `${recommendation.title} has been automatically implemented.`
          });
        } else {
          await updateRecommendationStatus(recommendation.id, 'pending');
          toast.error(`Automated fix failed`, {
            description: result.message || 'Manual intervention required.'
          });
        }
      } else {
        // For manual fixes, provide implementation guidance
        toast.info(`Manual implementation required`, {
          description: `${recommendation.title} requires manual implementation. Check the action steps provided.`
        });
        
        // Mark as in_progress since user needs to implement manually
        await updateRecommendationStatus(recommendation.id, 'in_progress');
      }
    } catch (error: any) {
      console.error('Error applying fix:', error);
      
      // Reset status back to pending on error
      await updateRecommendationStatus(recommendation.id, 'pending').catch(console.error);
      
      toast.error('Failed to apply fix', {
        description: error.message || 'An unexpected error occurred.'
      });
    } finally {
      setApplyingFix(null);
    }
  };

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">All Caught Up!</h3>
          <p className="text-muted-foreground">No new recommendations at this time.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Recommendations ({recommendations.length})
        </h3>
      </div>
      
      {recommendations.map((recommendation) => (
        <Card key={recommendation.id}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <CardTitle className="text-base">{recommendation.title}</CardTitle>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs">
                  Priority {recommendation.priority}
                </Badge>
                {recommendation.is_automated && (
                  <Badge variant="secondary" className="text-xs">
                    Auto-fixable
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {recommendation.description}
            </p>
            
            {!compact && (
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium mb-2">Action Steps:</h4>
                  <ol className="list-decimal list-inside space-y-1">
                    {recommendation.action_steps.map((step, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
                
                {recommendation.tools_needed && recommendation.tools_needed.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Tools Needed:</h4>
                    <div className="flex flex-wrap gap-1">
                      {recommendation.tools_needed.map((tool, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {recommendation.estimated_effort}
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {recommendation.expected_impact}
                </div>
              </div>
              <Button 
                size="sm" 
                onClick={() => handleApplyFix(recommendation)}
                disabled={applyingFix === recommendation.id}
                variant={recommendation.is_automated ? "default" : "outline"}
              >
                {applyingFix === recommendation.id ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    {recommendation.is_automated ? 'Applying...' : 'Processing...'}
                  </>
                ) : (
                  <>
                    {recommendation.is_automated ? 'Auto-Fix' : 'Implement'}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

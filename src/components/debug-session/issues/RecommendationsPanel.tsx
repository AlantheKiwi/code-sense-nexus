
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lightbulb, CheckCircle, Clock, TrendingUp, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
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

  const handleApplyFix = async (recommendation: Recommendation) => {
    setApplyingFix(recommendation.id);
    
    try {
      toast.info(`Applying fix: ${recommendation.title}`, {
        description: 'Starting implementation...'
      });

      // Simulate fix application process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, this would integrate with actual fix systems
      const success = Math.random() > 0.3; // 70% success rate for demo
      
      if (success) {
        toast.success(`Fix applied successfully!`, {
          description: `${recommendation.title} has been implemented.`
        });
      } else {
        toast.error(`Fix application failed`, {
          description: `Unable to automatically apply ${recommendation.title}. Manual intervention required.`
        });
      }
    } catch (error) {
      console.error('Error applying fix:', error);
      toast.error('Failed to apply fix', {
        description: 'An unexpected error occurred.'
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
              <Badge variant="outline" className="text-xs">
                Priority {recommendation.priority}
              </Badge>
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
              >
                {applyingFix === recommendation.id ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Applying...
                  </>
                ) : (
                  'Apply Fix'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};


import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Crown } from 'lucide-react';

interface CodeReviewTabProps {
  canUseFeature: (feature: string) => boolean;
  onStartReview: () => void;
}

export const CodeReviewTab: React.FC<CodeReviewTabProps> = ({
  canUseFeature,
  onStartReview
}) => {
  return (
    <div className="text-center py-8">
      <Lightbulb className="h-12 w-12 mx-auto mb-4 text-blue-600" />
      <h3 className="font-medium text-blue-800 mb-2">AI Code Review</h3>
      <p className="text-sm text-blue-600 mb-4">
        Get comprehensive code reviews with security, performance, and maintainability insights.
      </p>
      {canUseFeature('code-review') ? (
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={onStartReview}>
          Start AI Code Review
        </Button>
      ) : (
        <div className="space-y-2">
          <Badge className="bg-gold-100 text-gold-800">
            <Crown className="h-3 w-3 mr-1" />
            Premium Feature
          </Badge>
          <p className="text-xs text-muted-foreground">
            Upgrade for AI-powered code reviews
          </p>
        </div>
      )}
    </div>
  );
};

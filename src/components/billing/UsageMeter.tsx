
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Zap, ExternalLink, CreditCard, Crown } from 'lucide-react';
import { UsageData, UserSubscription, SUBSCRIPTION_TIERS } from '@/types/billing';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface UsageMeterProps {
  usage: UsageData | null;
  subscription: UserSubscription | null;
  credits?: number;
  showDetails?: boolean;
  showPricingLink?: boolean;
}

export const UsageMeter: React.FC<UsageMeterProps> = ({
  usage,
  subscription,
  credits = 0,
  showDetails = true,
  showPricingLink = false
}) => {
  const userTier = subscription?.tier || 'free';
  const tierConfig = SUBSCRIPTION_TIERS.find(t => t.id === userTier);
  
  if (!tierConfig) return null;

  // Premium and Enterprise have unlimited usage
  if (userTier === 'premium' || userTier === 'enterprise') {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Unlimited Analyses
              </span>
              <Badge className="bg-green-100 text-green-800">
                {tierConfig.name}
              </Badge>
            </div>
            {showPricingLink && (
              <Button variant="outline" size="sm" asChild>
                <Link to="/pricing" className="flex items-center gap-1">
                  View Plans <ExternalLink className="h-3 w-3" />
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show credits if available
  if (credits > 0) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                {credits} Credits Available
              </span>
              <Badge className="bg-blue-100 text-blue-800">
                Credit Balance
              </Badge>
            </div>
            <div className="flex gap-2">
              {showPricingLink && (
                <Button variant="outline" size="sm" asChild>
                  <Link to="/pricing" className="flex items-center gap-1">
                    Buy More <ExternalLink className="h-3 w-3" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
          {showDetails && (
            <div className="mt-2 text-xs text-blue-600">
              Credits bypass daily limits. Basic analysis costs 1 credit, AI analysis costs 10 credits.
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Free tier usage tracking
  const dailyLimit = tierConfig.limits.dailyAnalyses;
  const currentUsage = usage?.analysis_count || 0;
  const usagePercentage = dailyLimit > 0 ? (currentUsage / dailyLimit) * 100 : 0;
  const remaining = Math.max(0, dailyLimit - currentUsage);

  const getStatusColor = () => {
    if (usagePercentage >= 100) return 'text-red-600';
    if (usagePercentage >= 80) return 'text-yellow-600';
    return 'text-blue-600';
  };

  const getProgressColor = () => {
    if (usagePercentage >= 100) return 'bg-red-500';
    if (usagePercentage >= 80) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  return (
    <Card className={`${usagePercentage >= 80 ? 'border-yellow-200 bg-yellow-50' : 'border-blue-200 bg-blue-50'}`}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {usagePercentage >= 80 && (
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            )}
            <span className="text-sm font-medium">
              Daily Usage
            </span>
            <Badge variant="secondary">
              {tierConfig.name}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-semibold ${getStatusColor()}`}>
              {currentUsage}/{dailyLimit}
            </span>
            <Button variant="outline" size="sm" asChild className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:from-purple-600 hover:to-pink-600">
              <Link to="/pricing" className="flex items-center gap-1">
                <Crown className="h-3 w-3" />
                Upgrade
              </Link>
            </Button>
            {showPricingLink && (
              <Button variant="outline" size="sm" asChild>
                <Link to="/pricing" className="flex items-center gap-1">
                  View Plans <ExternalLink className="h-3 w-3" />
                </Link>
              </Button>
            )}
          </div>
        </div>

        <Progress 
          value={Math.min(usagePercentage, 100)} 
          className="h-2"
        />

        <div className="flex justify-between text-xs text-gray-600">
          <span>
            {remaining > 0 ? `${remaining} analyses remaining` : 'Daily limit reached'}
          </span>
          <span>
            Resets at midnight
          </span>
        </div>

        {showDetails && usagePercentage >= 80 && (
          <div className="text-xs text-yellow-700 bg-yellow-100 p-2 rounded">
            {remaining === 0 
              ? "You've reached your daily limit. Buy credits or upgrade to Premium for unlimited analyses!"
              : `Only ${remaining} analysis${remaining === 1 ? '' : 'es'} left today. Consider buying credits or upgrading for unlimited access.`
            }
          </div>
        )}
      </CardContent>
    </Card>
  );
};

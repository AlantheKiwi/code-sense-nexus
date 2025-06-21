
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Crown, 
  Zap, 
  Users, 
  Shield, 
  ArrowRight, 
  Check,
  Star
} from 'lucide-react';
import { SUBSCRIPTION_TIERS, UserSubscription } from '@/types/billing';
import { usageTracker } from '@/services/billing/UsageTracker';

interface UpgradePromptProps {
  open: boolean;
  onClose: () => void;
  currentSubscription: UserSubscription | null;
  userId: string;
  featureBlocked?: string;
  upgradeReason?: string;
  onUpgradeClick?: (tier: string) => void;
}

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  open,
  onClose,
  currentSubscription,
  userId,
  featureBlocked,
  upgradeReason,
  onUpgradeClick
}) => {
  const [selectedTier, setSelectedTier] = useState<'premium' | 'enterprise'>('premium');
  const [isProcessing, setIsProcessing] = useState(false);

  const currentTier = currentSubscription?.tier || 'free';
  const availableTiers = SUBSCRIPTION_TIERS.filter(tier => tier.id !== 'free' && tier.id !== currentTier);

  const handleUpgradeClick = async (tier: string) => {
    setIsProcessing(true);
    
    // Track conversion event
    await usageTracker.trackConversionEvent(userId, 'upgrade_clicked', {
      featureBlocked,
      upgradeTier: tier,
      conversionData: {
        upgrade_reason: upgradeReason,
        selected_tier: tier
      }
    });

    if (onUpgradeClick) {
      onUpgradeClick(tier);
    }

    setIsProcessing(false);
  };

  const getTierIcon = (tierId: string) => {
    switch (tierId) {
      case 'premium':
        return <Crown className="h-5 w-5 text-purple-600" />;
      case 'enterprise':
        return <Shield className="h-5 w-5 text-blue-600" />;
      default:
        return <Zap className="h-5 w-5" />;
    }
  };

  const getTierColor = (tierId: string) => {
    switch (tierId) {
      case 'premium':
        return 'border-purple-200 bg-purple-50';
      case 'enterprise':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  React.useEffect(() => {
    if (open) {
      // Track that upgrade prompt was shown
      usageTracker.trackConversionEvent(userId, 'upgrade_prompt_shown', {
        featureBlocked,
        conversionData: {
          upgrade_reason: upgradeReason
        }
      });
    }
  }, [open, userId, featureBlocked, upgradeReason]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            <Crown className="h-6 w-6 text-gold-500" />
            Unlock Premium Features
          </DialogTitle>
          <p className="text-gray-600 mt-2">
            {upgradeReason || "You've reached your daily limit. Upgrade for unlimited access and premium features!"}
          </p>
          
          {featureBlocked && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Feature blocked:</strong> {featureBlocked}
              </p>
            </div>
          )}
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {availableTiers.map((tier) => (
            <Card 
              key={tier.id}
              className={`relative cursor-pointer transition-all ${
                selectedTier === tier.id 
                  ? `ring-2 ring-${tier.id === 'premium' ? 'purple' : 'blue'}-500 ${getTierColor(tier.id)}` 
                  : getTierColor(tier.id)
              }`}
              onClick={() => setSelectedTier(tier.id as 'premium' | 'enterprise')}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                  {getTierIcon(tier.id)}
                </div>
                <CardTitle className="text-xl">{tier.name}</CardTitle>
                <div className="text-3xl font-bold">
                  ${tier.price}
                  <span className="text-lg font-normal text-gray-600">/{tier.period}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {tier.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  className={`w-full ${
                    tier.id === 'premium'
                      ? 'bg-purple-600 hover:bg-purple-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                  onClick={() => handleUpgradeClick(tier.id)}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    'Processing...'
                  ) : (
                    <>
                      Upgrade to {tier.name}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 text-center space-y-4">
          <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              Join 1,247+ developers
            </div>
            <div className="flex items-center gap-1">
              <Shield className="h-4 w-4" />
              Cancel anytime
            </div>
            <div className="flex items-center gap-1">
              <Zap className="h-4 w-4" />
              Instant access
            </div>
          </div>

          <p className="text-xs text-gray-500">
            Secure payment powered by Stripe. No setup fees or hidden charges.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

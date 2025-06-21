
import React, { useState } from 'react';
import { UsageMeter } from './UsageMeter';
import { UpgradePrompt } from './UpgradePrompt';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { useAuth } from '@/contexts/AuthContext';

interface BillingWrapperProps {
  children: React.ReactNode;
  analysisType?: 'basic' | 'ai';
  featureName?: string;
  onAnalysisAttempt?: () => void;
  showUsageMeter?: boolean;
}

export const BillingWrapper: React.FC<BillingWrapperProps> = ({
  children,
  analysisType = 'basic',
  featureName,
  onAnalysisAttempt,
  showUsageMeter = true
}) => {
  const { user } = useAuth();
  const { usage, subscription, checkUsageLimit, incrementUsage, trackConversion } = useUsageTracking();
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<string>('');

  const handleAnalysisRequest = async () => {
    if (!user?.id) return;

    const result = await checkUsageLimit(analysisType);
    
    if (!result.allowed) {
      // Track that user hit a limit
      await trackConversion('limit_hit', {
        featureBlocked: featureName,
        conversionData: {
          analysis_type: analysisType,
          current_usage: result.usage?.analysis_count || 0,
          user_tier: result.subscription?.tier || 'free'
        }
      });

      // Show upgrade prompt
      if (analysisType === 'ai') {
        setUpgradeReason('AI-powered analysis requires a Premium subscription. Upgrade now for unlimited AI features!');
      } else {
        setUpgradeReason("You've reached your daily limit of 3 analyses. Upgrade to Premium for unlimited access!");
      }
      
      setShowUpgradePrompt(true);
      return;
    }

    // If allowed, increment usage and proceed
    await incrementUsage(analysisType);
    
    if (onAnalysisAttempt) {
      onAnalysisAttempt();
    }
  };

  const handleUpgradeClick = (tier: string) => {
    // In a real implementation, this would redirect to Stripe checkout
    console.log('Upgrade to:', tier);
    setShowUpgradePrompt(false);
    
    // For demo purposes, just show a message
    alert(`Redirecting to ${tier} subscription checkout...`);
  };

  return (
    <div className="space-y-4">
      {showUsageMeter && (
        <UsageMeter usage={usage} subscription={subscription} />
      )}
      
      <div onClick={handleAnalysisRequest}>
        {children}
      </div>

      <UpgradePrompt
        open={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        currentSubscription={subscription}
        userId={user?.id || ''}
        featureBlocked={featureName}
        upgradeReason={upgradeReason}
        onUpgradeClick={handleUpgradeClick}
      />
    </div>
  );
};

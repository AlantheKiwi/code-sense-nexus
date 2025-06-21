
import React from 'react';
import { UsageMeter } from './UsageMeter';
import { UpgradePrompt } from './UpgradePrompt';
import { useUsageTracking } from '@/hooks/useUsageTracking';

interface BillingWrapperProps {
  children: React.ReactNode;
  analysisType?: 'basic' | 'ai';
  featureName?: string;
  showUsageMeter?: boolean;
  showPricingLink?: boolean;
}

export const BillingWrapper: React.FC<BillingWrapperProps> = ({
  children,
  analysisType = 'basic',
  featureName = 'Analysis',
  showUsageMeter = false,
  showPricingLink = false
}) => {
  const { usage, subscription, isLoading, checkUsageLimit } = useUsageTracking();

  // Show usage meter if requested
  if (showUsageMeter && !isLoading) {
    return (
      <UsageMeter 
        usage={usage} 
        subscription={subscription} 
        showPricingLink={showPricingLink}
      />
    );
  }

  // For other billing-related functionality, we can add logic here
  // For now, just render children if not showing usage meter
  return <>{children}</>;
};

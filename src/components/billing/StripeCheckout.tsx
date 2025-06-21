
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, CreditCard, Crown, Zap, Building } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { StripeService, CREDIT_PACKAGES, SUBSCRIPTION_PLANS } from '@/services/payments/StripeService';
import { toast } from 'sonner';

interface StripeCheckoutProps {
  type: 'credits' | 'subscription' | 'enterprise';
  className?: string;
}

export const StripeCheckout: React.FC<StripeCheckoutProps> = ({ type, className }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const handleCreditPurchase = async (packageId: string) => {
    if (!user?.email) {
      toast.error('Please log in to purchase credits');
      return;
    }

    setLoading(packageId);
    try {
      const { url } = await StripeService.createCreditPackageCheckout(
        packageId,
        user.id,
        user.email
      );
      
      if (url) {
        window.open(url, '_blank');
      }
    } catch (error: any) {
      toast.error(`Purchase failed: ${error.message}`);
    } finally {
      setLoading(null);
    }
  };

  const handleSubscriptionUpgrade = async (planId: string) => {
    if (!user?.email) {
      toast.error('Please log in to upgrade');
      return;
    }

    setLoading(planId);
    try {
      const { url } = await StripeService.createSubscriptionCheckout(
        planId,
        user.id,
        user.email
      );
      
      if (url) {
        window.open(url, '_blank');
      }
    } catch (error: any) {
      toast.error(`Upgrade failed: ${error.message}`);
    } finally {
      setLoading(null);
    }
  };

  if (type === 'credits') {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Buy Credits</h2>
          <p className="text-muted-foreground">
            Powered by <span className="font-semibold">Insight AI Systems Ltd</span> - CodeSense
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {CREDIT_PACKAGES.map((pkg) => (
            <Card key={pkg.id} className={`relative ${pkg.popular ? 'ring-2 ring-primary' : ''}`}>
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    <Crown className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  {pkg.name}
                </CardTitle>
                <div className="text-3xl font-bold">${pkg.price}</div>
                <p className="text-muted-foreground">{pkg.credits} credits</p>
              </CardHeader>
              
              <CardContent>
                <Button
                  onClick={() => handleCreditPurchase(pkg.id)}
                  disabled={loading === pkg.id}
                  className="w-full"
                  variant={pkg.popular ? 'default' : 'outline'}
                >
                  {loading === pkg.id ? 'Processing...' : 'Buy Now'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'subscription') {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Upgrade Subscription</h2>
          <p className="text-muted-foreground">
            Powered by <span className="font-semibold">Insight AI Systems Ltd</span> - CodeSense
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <Card key={plan.id} className={`relative ${plan.popular ? 'ring-2 ring-primary' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    <Crown className="h-3 w-3 mr-1" />
                    Recommended
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Zap className="h-5 w-5" />
                  {plan.name}
                </CardTitle>
                <div className="text-3xl font-bold">${plan.price}<span className="text-lg font-normal">/month</span></div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  onClick={() => handleSubscriptionUpgrade(plan.id)}
                  disabled={loading === plan.id}
                  className="w-full"
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  {loading === plan.id ? 'Processing...' : 'Upgrade Now'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'enterprise') {
    return (
      <Card className={className}>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Building className="h-6 w-6" />
            Enterprise Solutions
          </CardTitle>
          <p className="text-muted-foreground">
            Custom pricing and features for large organizations
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Powered by <span className="font-semibold">Insight AI Systems Ltd</span>
            </p>
          </div>
          
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-sm">Custom integrations and workflows</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-sm">Dedicated support and training</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-sm">White-label solutions available</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-sm">Volume pricing and flexible billing</span>
            </li>
          </ul>
          
          <Button className="w-full" variant="outline">
            Schedule Consultation
          </Button>
        </CardContent>
      </Card>
    );
  }

  return null;
};

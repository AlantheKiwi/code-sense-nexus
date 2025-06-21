
import React, { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useUsageTracking } from '@/hooks/useUsageTracking';

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { refreshSubscription } = useUsageTracking();

  useEffect(() => {
    // Refresh subscription status after successful payment
    if (sessionId) {
      setTimeout(() => {
        refreshSubscription();
      }, 2000); // Wait 2 seconds for Stripe to process
    }
  }, [sessionId, refreshSubscription]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow flex items-center justify-center py-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="text-center border-green-200 bg-green-50">
            <CardHeader className="pb-4">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-3xl font-bold text-green-800">
                Payment Successful!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-lg text-green-700">
                Thank you for subscribing! Your premium features are now active.
              </p>
              
              {sessionId && (
                <div className="text-sm text-green-600 bg-green-100 p-3 rounded-lg">
                  <strong>Session ID:</strong> {sessionId}
                </div>
              )}

              <div className="space-y-4">
                <p className="text-gray-600">
                  You now have access to:
                </p>
                <ul className="text-left space-y-2 text-gray-700">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Unlimited code analyses
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    AI-powered debugging
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Priority support
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Advanced insights and recommendations
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="bg-green-600 hover:bg-green-700">
                  <Link to="/dashboard" className="flex items-center">
                    Go to Dashboard
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/pricing">
                    View All Plans
                  </Link>
                </Button>
              </div>

              <div className="text-sm text-gray-500 pt-4 border-t">
                <p>
                  You can manage your subscription anytime from your dashboard.
                  Need help? <Link to="/contact" className="text-green-600 hover:underline">Contact our support team</Link>.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentSuccessPage;

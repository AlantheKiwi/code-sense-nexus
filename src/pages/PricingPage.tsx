
import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const tiers = [
  {
    name: 'Developer',
    price: '$0',
    description: 'Perfect for individual developers testing the platform.',
    features: [
      '1 Lovable project',
      '5 analyses per month',
      'Basic issue detection',
      'Community support',
    ],
    cta: 'Get Started Free',
    link: '/auth'
  },
  {
    name: 'Agency Ready',
    price: '$19',
    description: 'For freelancers and small agencies ready to deliver quality.',
    features: [
      '10 Lovable projects',
      'Unlimited analyses',
      'All debugging features',
      'Priority support',
      'Custom branding'
    ],
    cta: 'Start Pro Trial',
    link: '/auth',
    popular: true,
  },
  {
    name: 'Team',
    price: '$49',
    description: 'For growing agencies with multiple clients and developers.',
    features: [
      'Unlimited projects',
      'Team collaboration features',
      'Advanced analytics',
      'White-label reports',
      'API access'
    ],
    cta: 'Start Team Trial',
    link: '/auth'
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large agencies and enterprises with custom needs.',
    features: [
      'Everything in Team',
      'Custom integrations',
      'Dedicated support & SSO',
      'Custom deployment',
    ],
    cta: 'Contact Sales',
    link: '/contact'
  }
];

const PricingPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Simple, Powerful Pricing</h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your needs. 33% cheaper than Lovable Pro.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
            {tiers.map((tier) => (
              <Card key={tier.name} className={`flex flex-col ${tier.popular ? 'border-brand shadow-lg' : ''}`}>
                {tier.popular && <div className="bg-brand text-brand-foreground text-center py-1 text-sm font-bold rounded-t-lg">Most Popular</div>}
                <CardHeader>
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                  <div className="text-4xl font-bold pt-4">{tier.price}<span className="text-lg font-normal text-muted-foreground">/month</span></div>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col">
                  <ul className="space-y-3 mb-8 flex-grow">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-center">
                        <Check className="h-5 w-5 text-green-500 mr-2" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button asChild className={`w-full ${tier.popular ? 'bg-brand text-brand-foreground hover:bg-brand/90' : ''}`} variant={tier.popular ? 'default' : 'outline'}>
                    <Link to={tier.link}>{tier.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-24 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">An Insane Return on Investment</h2>
            <p className="text-muted-foreground">
              An average React developer makes $75/hour. By saving just 3 hours a week on debugging, CodeSense provides over <span className="text-primary font-semibold">$900 in monthly value</span>. That's an ROI of over 4,700% on our Pro plan. It pays for itself if you save just 15 minutes a week.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PricingPage;

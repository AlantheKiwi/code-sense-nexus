
import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InteractiveDemo } from '@/components/demo/InteractiveDemo';
import { Github, Zap, FileCode } from 'lucide-react';

const steps = [
  {
    icon: <Github className="h-12 w-12 text-brand" />,
    title: 'Step 1: Connect Your Lovable Project',
    description: 'Integrate your GitHub repository in just 30 seconds. CodeSense automatically syncs with your Lovable project.',
  },
  {
    icon: <Zap className="h-12 w-12 text-brand" />,
    title: 'Step 2: Get Instant Analysis',
    description: 'Our AI-powered engine analyzes your code, identifying over 50 types of Lovable-specific issues, from component complexity to Supabase integration flaws.',
  },
  {
    icon: <FileCode className="h-12 w-12 text-brand" />,
    title: 'Step 3: Fix Issues Fast',
    description: 'Receive plain-English explanations and exact code solutions. Understand the "why" behind the issue and fix it with confidence.',
  },
];

const HowItWorksPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">How CodeSense Works</h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Transform your Lovable development workflow in three simple steps.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {steps.map((step) => (
              <Card key={step.title} className="text-center shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="mx-auto bg-brand-light rounded-full p-4 w-fit mb-4">
                    {step.icon}
                  </div>
                  <CardTitle className="text-2xl">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">See CodeSense in Action</h2>
              <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
                Watch how CodeSense analyzes a real Lovable component, identifies issues, and provides 
                clear fixes that improve performance and maintainability.
              </p>
            </div>
            <InteractiveDemo />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HowItWorksPage;

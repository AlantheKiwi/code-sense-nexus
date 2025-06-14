
import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const DemoPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Interactive Demo</h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the power of CodeSense firsthand. No signup required.
            </p>
          </div>
          <Card className="max-w-5xl mx-auto shadow-2xl">
            <CardContent className="p-8">
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-8">
                <p className="text-muted-foreground">[Interactive Sandbox Placeholder]</p>
              </div>
              <h2 className="text-2xl font-bold mb-4">Live Debugging Session</h2>
              <p className="text-muted-foreground mb-8">
                We've loaded a sample Lovable project with common issues. Use the tooltips to explore features and see how CodeSense detects and explains each problem.
              </p>
              <div className="text-center">
                <Button asChild size="lg" className="bg-brand text-brand-foreground hover:bg-brand/90">
                  <Link to="/auth">Try with Your Own Project <ArrowRight className="ml-2 h-5 w-5" /></Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DemoPage;

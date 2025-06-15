
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="py-20 md:py-32 bg-gradient-to-br from-brand-light to-background">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-gray-900 dark:text-white">
          CodeSense for Lovable: <br /> <span className="text-brand">Debug Smarter, Build Faster.</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-4 max-w-2xl mx-auto">
          The only debugging platform built exclusively for Lovable developers.
        </p>
        <p className="text-md text-muted-foreground mb-10 max-w-3xl mx-auto">
          Fix AI-generated code issues 5x faster &bull; Prevent bugs before they happen &bull; Ship production-ready apps with confidence
        </p>
        <div className="flex justify-center space-x-4">
          <Button asChild size="lg" className="bg-brand text-brand-foreground hover:bg-brand/90 px-8 py-3 text-lg">
            <Link to="/auth">Get Started Free <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="px-8 py-3 text-lg border-gray-300 dark:border-gray-700">
            <Link to="/demo">Request a Demo</Link>
          </Button>
        </div>
        <p className="mt-8 text-sm text-muted-foreground">Trusted by 500+ Lovable developers and agencies</p>
      </div>
    </section>
  );
};

export default Hero;

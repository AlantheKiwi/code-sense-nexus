
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <section className="py-20 md:py-32 bg-gradient-to-br from-brand-light to-background">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-gray-900 dark:text-white">
          Debug No-Code, <span className="text-brand">Supercharged.</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
          CodeSense is the ultimate white-label debugging platform for no-code tools. Empower your clients with deep insights and faster resolutions for Lovable, Bubble, and more.
        </p>
        <div className="flex justify-center space-x-4">
          <Button size="lg" className="bg-brand text-brand-foreground hover:bg-brand/90 px-8 py-3 text-lg">
            Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button variant="outline" size="lg" className="px-8 py-3 text-lg border-gray-300 dark:border-gray-700">
            Request a Demo
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;

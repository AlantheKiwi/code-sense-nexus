
import React from 'react';
import { Button } from '@/components/ui/button';

const CallToAction = () => {
  return (
    <section className="py-16 md:py-24 bg-brand text-brand-foreground">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Ready to Elevate Your No-Code Support?
        </h2>
        <p className="text-lg md:text-xl opacity-80 mb-10 max-w-2xl mx-auto">
          Offer unparalleled debugging capabilities to your clients. Launch your branded CodeSense platform today.
        </p>
        <Button variant="secondary" size="lg" className="bg-white text-brand hover:bg-gray-100 px-10 py-4 text-lg font-semibold">
          Start Your Free Trial
        </Button>
      </div>
    </section>
  );
};

export default CallToAction;

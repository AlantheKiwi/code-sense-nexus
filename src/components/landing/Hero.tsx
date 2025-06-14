
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Code, Cpu, Database } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="hero-section py-20 md:py-32 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-cyber opacity-80" />
      <div className="container mx-auto px-4 text-center relative">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-white">
          CodeSense for Lovable: <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-matrix to-primary-electric">Debug Smarter, Build Faster.</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-300 mb-4 max-w-2xl mx-auto">
          The only debugging platform built exclusively for Lovable developers.
        </p>
        <p className="text-md text-gray-400 mb-10 max-w-3xl mx-auto">
          Fix AI-generated code issues 5x faster &bull; Prevent bugs before they happen &bull; Ship production-ready apps with confidence
        </p>
        <div className="flex justify-center space-x-4">
          <Button asChild size="lg" className="tech-button px-8 py-3 text-lg overflow-hidden rounded-md">
            <Link to="/auth">Get Started Free <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="px-8 py-3 text-lg border-primary-electric/50 text-primary-electric bg-transparent hover:bg-primary-electric/10 hover:text-primary-electric">
            <Link to="/demo">Request a Demo</Link>
          </Button>
        </div>
        <p className="mt-8 text-sm text-gray-400">Trusted by 500+ Lovable developers and agencies</p>
      </div>
    </section>
  );
};

export default Hero;

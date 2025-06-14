
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">
          CodeSense for Lovable: <br /> Debug Smarter, Build Faster.
        </h1>
        <p className="hero-description">
          The only debugging platform built exclusively for Lovable developers. 
          Fix AI-generated code issues 5x faster &bull; Prevent bugs before they happen &bull; Ship production-ready apps with confidence.
        </p>
        <div className="hero-buttons">
          <Button asChild className="btn-primary">
            <Link to="/auth">Get Started Free <ArrowRight /></Link>
          </Button>
          <Button asChild className="btn-secondary">
            <Link to="/demo">Request a Demo</Link>
          </Button>
        </div>
        <p className="trust-indicator">
          Trusted by 500+ Lovable developers and agencies
        </p>
      </div>
    </section>
  );
};

export default Hero;

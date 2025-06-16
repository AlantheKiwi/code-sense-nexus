
import React from 'react';
import Header from '@/components/layout/Header';
import Hero from '@/components/landing/Hero';
import FeaturesTeaser from '@/components/landing/FeaturesTeaser';
import CallToAction from '@/components/landing/CallToAction';
import Footer from '@/components/layout/Footer';

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        <Hero />
        <FeaturesTeaser />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
};

export default Index;


import React from 'react';
import { TypeScriptFixerHero } from '@/components/launch/TypeScriptFixerHero';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const Index = () => {
  console.log('Index page is rendering');
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        <TypeScriptFixerHero />
      </main>
      <Footer />
    </div>
  );
};

export default Index;

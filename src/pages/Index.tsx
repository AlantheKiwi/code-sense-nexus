
import React from 'react';
import { TypeScriptFixerHero } from '@/components/launch/TypeScriptFixerHero';
import { WhyItWorks } from '@/components/confidence/WhyItWorks';
import { FAQ } from '@/components/confidence/FAQ';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const Index = () => {
  console.log('Index page is rendering');
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        <TypeScriptFixerHero />
        
        {/* Why It Works Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <WhyItWorks />
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <FAQ />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;

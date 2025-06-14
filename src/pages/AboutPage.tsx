
import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const AboutPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">About CodeSense</h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Built by Lovable developers, for Lovable developers.
            </p>
          </div>
          <div className="space-y-8 text-lg text-muted-foreground">
            <h2 className="text-3xl font-bold text-primary">Our Mission: Make Every Lovable Project Production-Ready.</h2>
            <p>
              We love Lovable. It's a revolutionary tool for building applications at lightning speed. But as we built more complex projects for clients, we hit a wall. Debugging AI-generated code, ensuring consistency, and maintaining quality across large projects was a constant challenge.
            </p>
            <p>
              After debugging over 100 Lovable projects, we knew there had to be a better way. We needed a tool that understood the nuances of Lovable, from prompt optimization to component architecture.
            </p>
            <p>
              That's why we built CodeSense. It's the co-pilot we always wanted, a dedicated platform to analyze, debug, and optimize Lovable applications. Our goal is to empower developers to move from prototype to production with confidence, ensuring every app is scalable, maintainable, and robust.
            </p>
             <h2 className="text-3xl font-bold text-primary mt-12">Our Values</h2>
             <ul className="space-y-4">
                <li><span className="font-semibold text-primary">Quality:</span> We believe AI-generated code can and should meet the highest engineering standards.</li>
                <li><span className="font-semibold text-primary">Speed:</span> We help you fix issues faster so you can focus on building features.</li>
                <li><span className="font-semibold text-primary">Developer Happiness:</span> A happy developer is a productive developer. We aim to reduce the frustration of debugging.</li>
             </ul>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;

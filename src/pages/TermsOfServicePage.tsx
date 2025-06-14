
import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const TermsOfServicePage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow py-16 md:py-24">
        <div className="container mx-auto px-4 prose dark:prose-invert max-w-3xl">
          <h1>Terms of Service</h1>
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2>Usage Policy</h2>
          <p>We provide this service for analyzing and debugging web applications. You agree not to misuse the service or use it for any illegal purposes. We have usage limits on our free plan to ensure fair access for all users.</p>

          <h2>Intellectual Property</h2>
          <p>Your code and any projects you connect to CodeSense remain your intellectual property. We claim no ownership over your code.</p>

          <h2>Refunds & Guarantees</h2>
          <p>We offer a 30-day money-back guarantee on all our paid plans. If you're not satisfied, contact support for a full refund. We also provide a 99.9% uptime Service Level Agreement (SLA).</p>
          
          <p>This is a simplified Terms of Service. A full, legally-vetted document would be implemented for a production application.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfServicePage;

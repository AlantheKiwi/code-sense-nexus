
import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useLegalDocument } from '@/hooks/useLegalDocument';

const TermsOfServicePage = () => {
  const { data: content, isLoading } = useLegalDocument('terms');

  const defaultContent = `Last updated: ${new Date().toLocaleDateString()}

Usage Policy
We provide this service for analyzing and debugging web applications. You agree not to misuse the service or use it for any illegal purposes. We have usage limits on our free plan to ensure fair access for all users.

Intellectual Property
Your code and any projects you connect to CodeSense remain your intellectual property. We claim no ownership over your code.

Refunds & Guarantees
We offer a 30-day money-back guarantee on all our paid plans. If you're not satisfied, contact support for a full refund. We also provide a 99.9% uptime Service Level Agreement (SLA).

This is a simplified Terms of Service. A full, legally-vetted document would be implemented for a production application.`;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow py-16 md:py-24">
        <div className="container mx-auto px-4 prose dark:prose-invert max-w-3xl">
          <h1>Terms of Service</h1>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <div className="whitespace-pre-wrap">
              {content || defaultContent}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfServicePage;

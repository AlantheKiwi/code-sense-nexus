
import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useLegalDocument } from '@/hooks/useLegalDocument';

const PrivacyPolicyPage = () => {
  const { data: content, isLoading } = useLegalDocument('privacy');

  const defaultContent = `Last updated: ${new Date().toLocaleDateString()}

Your Code Stays Private
We take your privacy and intellectual property seriously. Your source code is only accessed for the purpose of analysis and is never stored on our servers permanently. Analysis is performed in-memory and results are stored, but not the code itself.

Data Handling
We are GDPR compliant. We track usage analytics to improve our platform, but this data is anonymized. Third-party integrations like GitHub and Supabase only request the minimum required permissions to function.

Data Retention
Analysis results for your projects are retained for 90 days to allow you to track progress over time. After 90 days, they are permanently deleted.

This is a simplified policy. A full, legally-vetted policy would be implemented for a production application.`;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow py-16 md:py-24">
        <div className="container mx-auto px-4 prose dark:prose-invert max-w-3xl">
          <h1>Privacy Policy</h1>
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

export default PrivacyPolicyPage;

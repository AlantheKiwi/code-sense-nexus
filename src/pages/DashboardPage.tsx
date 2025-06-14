
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const DashboardPage = () => {
  const { user, partner, signOut, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">
            {partner ? `${partner.company_name} Dashboard` : 'Dashboard'}
          </h1>
          {user && (
            <Button onClick={signOut} variant="outline">
              Sign Out
            </Button>
          )}
        </div>
        {user ? (
          <>
            <p className="mb-2">Welcome, {user.email}!</p>
            {partner ? (
              <p>This is the dashboard for {partner.company_name} (ID: {partner.id}, Slug: {partner.slug}). More features coming soon.</p>
            ) : (
              <p>Your partner account details are being set up or you might be a different user type.</p>
            )}
          </>
        ) : (
          <p>You are not logged in.</p>
        )}
        {/* Placeholder for future dashboard content */}
      </main>
      <Footer />
    </div>
  );
};

export default DashboardPage;

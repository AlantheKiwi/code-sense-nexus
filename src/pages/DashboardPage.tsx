
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header'; // Assuming Header can be used here
import Footer from '@/components/layout/Footer'; // Assuming Footer can be used here

const DashboardPage = () => {
  const { user, signOut, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header /> {/* You might want a different header for authenticated users */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          {user && (
            <Button onClick={signOut} variant="outline">
              Sign Out
            </Button>
          )}
        </div>
        {user ? (
          <p>Welcome, {user.email}! This is your dashboard. More features coming soon.</p>
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

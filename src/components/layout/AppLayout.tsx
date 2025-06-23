
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { MobileNavigation } from '@/components/layout/MobileNavigation';
import { useIsMobile } from '@/hooks/use-mobile';

const AppLayout = () => {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col min-h-screen">
      <MobileNavigation />
      {!isMobile && <Header />}
      <main className={`flex-1 ${isMobile ? 'pb-16' : ''}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;

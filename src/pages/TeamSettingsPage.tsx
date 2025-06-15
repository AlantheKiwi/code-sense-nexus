import React from 'react';
import { useParams } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useTeamsData } from '@/hooks/useTeamsData';
import { TeamMembers } from '@/components/teams/TeamMembers';

const TeamSettingsPage = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const { partner } = useAuth();
  const { data: teams, isLoading: teamsLoading } = useTeamsData(partner?.id);
  
  const team = teams?.find(t => t.id === teamId);

  if (teamsLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading team details...</div>;
  }

  if (!team) {
    return <div className="flex items-center justify-center min-h-screen">Team not found.</div>;
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Team Settings</h1>
          <p className="text-muted-foreground">Manage settings for {team.name}</p>
        </div>
        
        <div className="grid gap-6">
            <TeamMembers team={team} />
            {/* Other settings cards can be added here */}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TeamSettingsPage;

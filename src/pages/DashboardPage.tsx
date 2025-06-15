
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useProjectsData } from "@/hooks/useProjectsData";
import { ProjectList } from "@/components/projects/ProjectList";
import { useTeamsData } from "@/hooks/useTeamsData";
import { TeamList } from "@/components/teams/TeamList";

const DashboardPage = () => {
  const { partner } = useAuth();
  const { data: projects, isLoading: projectsLoading } = useProjectsData(partner?.id);
  const { data: teams, isLoading: teamsLoading } = useTeamsData(partner?.id);

  const isLoading = projectsLoading || teamsLoading;

  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back to your CodeSense dashboard.</p>
        </div>
        
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              {projects && partner && (
                <ProjectList projects={projects} partnerId={partner.id} />
              )}
            </div>
            <div>
              {teams && partner && (
                <TeamList teams={teams} partnerId={partner.id} />
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default DashboardPage;

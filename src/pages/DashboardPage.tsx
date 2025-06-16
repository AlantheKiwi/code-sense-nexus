
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useProjectsData } from "@/hooks/useProjectsData";
import { ProjectList } from "@/components/projects/ProjectList";
import { useTeamsData } from "@/hooks/useTeamsData";
import { TeamList } from "@/components/teams/TeamList";

const DashboardPage = () => {
  const { partner, user, isLoading: authLoading } = useAuth();
  const { data: projects, isLoading: projectsLoading, error: projectsError } = useProjectsData(partner?.id);
  const { data: teams, isLoading: teamsLoading } = useTeamsData(partner?.id);

  const isLoading = authLoading || projectsLoading || teamsLoading;

  // Debug logging for dashboard state
  console.log('DashboardPage Debug:', {
    authLoading,
    projectsLoading,
    teamsLoading,
    hasUser: !!user,
    hasPartner: !!partner,
    partnerId: partner?.id,
    projectsCount: projects?.length || 0,
    projectsError: projectsError?.message,
    teamsCount: teams?.length || 0
  });

  // Show loading state while auth is still loading
  if (authLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-muted/40">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Loading your account...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show error state if no partner found
  if (!partner && !authLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-muted/40">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-destructive">
              No partner account found. Please contact support if this is unexpected.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back to your CodeSense dashboard.</p>
          {partner && (
            <p className="text-sm text-muted-foreground mt-1">
              Partner: {partner.company_name} (ID: {partner.id})
            </p>
          )}
        </div>
        
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              {projects && partner ? (
                <ProjectList projects={projects} partnerId={partner.id} />
              ) : projectsError ? (
                <div className="p-4 border border-destructive rounded-lg">
                  <h3 className="font-semibold text-destructive mb-2">Failed to load projects</h3>
                  <p className="text-sm text-muted-foreground">{projectsError.message}</p>
                </div>
              ) : (
                <div className="p-4 border rounded-lg">
                  <p className="text-muted-foreground">No projects available</p>
                </div>
              )}
            </div>
            <div>
              {teams && partner ? (
                <TeamList teams={teams} partnerId={partner.id} />
              ) : (
                <div className="p-4 border rounded-lg">
                  <p className="text-muted-foreground">No teams available</p>
                </div>
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

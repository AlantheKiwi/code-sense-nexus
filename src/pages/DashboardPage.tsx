
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderKanban, History, PlusCircle, ExternalLink } from "lucide-react";
import { useProjectsData } from '@/hooks/useProjectsData';
import { AddProjectDialog } from '@/components/projects/AddProjectDialog';

const DashboardPage = () => {
  const { user, partner, isLoading: isAuthLoading } = useAuth();
  const { data: projects, isLoading: areProjectsLoading } = useProjectsData(partner?.id);
  const [isAddProjectDialogOpen, setIsAddProjectDialogOpen] = useState(false);

  const isLoading = isAuthLoading || areProjectsLoading;

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">
            {partner ? `${partner.company_name} Dashboard` : 'Dashboard'}
          </h1>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Welcome/Info Card */}
            <Card className="lg:col-span-3">
                <CardHeader>
                    <CardTitle>Welcome, {user?.email || 'Partner'}!</CardTitle>
                    <CardDescription>
                        {partner 
                            ? `You are managing projects for ${partner.company_name}.`
                            : "Your partner account is ready. Let's get started!"
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p>This is your central hub for managing projects, analyzing code, and optimizing performance for your clients.</p>
                </CardContent>
            </Card>

            {/* Projects Card */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-medium">Your Projects</CardTitle>
                    <FolderKanban className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {projects && projects.length > 0 ? (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                {projects.map((project) => (
                                    <div key={project.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted">
                                        <div>
                                            <p className="font-semibold">{project.name}</p>
                                            {project.github_url && (
                                                <a 
                                                    href={project.github_url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-brand hover:underline flex items-center"
                                                >
                                                    View on GitHub <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                                                </a>
                                            )}
                                        </div>
                                        <Button variant="outline" size="sm">
                                            Analyze
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <Button className="w-full mt-2" onClick={() => setIsAddProjectDialogOpen(true)}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Add New Project
                            </Button>
                        </div>
                    ) : (
                        <>
                            <p className="text-sm text-muted-foreground mb-4">You have no projects yet.</p>
                            <Button onClick={() => setIsAddProjectDialogOpen(true)}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Add New Project
                            </Button>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Activity Feed Card */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-medium">Recent Activity</CardTitle>
                    <History className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">No recent activity to display.</p>
                    {/* Placeholder for activity items */}
                </CardContent>
            </Card>

            {/* Quick Actions Card */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-medium">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col space-y-2">
                    <Button variant="outline">Analyze a Lovable App</Button>
                    <Button variant="outline">Optimize a Bubble Workflow</Button>
                    <Button variant="outline">Invite a Team Member</Button>
                </CardContent>
            </Card>
        </div>
      </main>
      <Footer />
      {partner && (
        <AddProjectDialog 
            partnerId={partner.id}
            isOpen={isAddProjectDialogOpen}
            onOpenChange={setIsAddProjectDialogOpen}
        />
      )}
    </div>
  );
};

export default DashboardPage;

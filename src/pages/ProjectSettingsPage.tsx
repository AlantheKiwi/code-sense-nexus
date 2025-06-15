import React from 'react';
import { useParams } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ProjectMembers } from '@/components/projects/ProjectMembers';
import { useProjectsData } from '@/hooks/useProjectsData';
import { useAuth } from '@/contexts/AuthContext';

const ProjectSettingsPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { partner } = useAuth();
  const { data: projects, isLoading: projectsLoading } = useProjectsData(partner?.id);
  
  const project = projects?.find(p => p.id === projectId);

  if (projectsLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading project details...</div>;
  }

  if (!project) {
    return <div className="flex items-center justify-center min-h-screen">Project not found.</div>;
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Project Settings</h1>
          <p className="text-muted-foreground">Manage settings for {project.name}</p>
        </div>
        
        <div className="grid gap-6">
            <ProjectMembers project={project} />
            {/* Other settings cards can be added here */}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProjectSettingsPage;

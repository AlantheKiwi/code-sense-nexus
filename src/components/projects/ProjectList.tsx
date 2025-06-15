
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tables } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { ExternalLink, PlusCircle, Edit, Trash2, Settings, MoreVertical } from "lucide-react";
import { ProjectDialog } from './ProjectDialog';
import { DeleteProjectDialog } from './DeleteProjectDialog';
import { useDeleteProject } from '@/hooks/useProjectMutations';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Project = Tables<'projects'>;

interface ProjectListProps {
    projects: Project[];
    partnerId: string;
}

export const ProjectList: React.FC<ProjectListProps> = ({ projects, partnerId }) => {
    const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
    const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
    
    const deleteProjectMutation = useDeleteProject(partnerId);

    const handleEdit = (project: Project) => {
        setProjectToEdit(project);
        setIsProjectDialogOpen(true);
    };

    const handleAdd = () => {
        setProjectToEdit(null);
        setIsProjectDialogOpen(true);
    };

    const handleDelete = (project: Project) => {
        setProjectToDelete(project);
        setIsDeleteDialogOpen(true);
    };
    
    const confirmDelete = () => {
        if (projectToDelete) {
            deleteProjectMutation.mutate(projectToDelete.id, {
                onSuccess: () => {
                    setIsDeleteDialogOpen(false);
                    setProjectToDelete(null);
                }
            });
        }
    };

    return (
        <>
            {projects.length > 0 ? (
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
                                <div className="flex items-center gap-1">
                                    <Button variant="outline" size="sm">
                                        Analyze
                                    </Button>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleEdit(project)}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                <span>Edit Project</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link to={`/project/${project.id}/settings`}>
                                                    <Settings className="mr-2 h-4 w-4" />
                                                    <span>Manage Members</span>
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleDelete(project)} className="text-destructive">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                <span>Delete Project</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Button className="w-full mt-2" onClick={handleAdd}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add New Project
                    </Button>
                </div>
            ) : (
                <>
                    <p className="text-sm text-muted-foreground mb-4">You have no projects yet.</p>
                    <Button onClick={handleAdd}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add New Project
                    </Button>
                </>
            )}

            <ProjectDialog
                partnerId={partnerId}
                isOpen={isProjectDialogOpen}
                onOpenChange={setIsProjectDialogOpen}
                projectToEdit={projectToEdit}
            />
            
            <DeleteProjectDialog
                isOpen={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={confirmDelete}
                isPending={deleteProjectMutation.isPending}
            />
        </>
    );
};

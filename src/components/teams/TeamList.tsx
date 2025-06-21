
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Team } from '@/hooks/useTeamsData';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, Settings, MoreVertical, Users } from "lucide-react";
import { TeamDialog } from './TeamDialog';
import { DeleteTeamDialog } from './DeleteTeamDialog';
import { useDeleteTeam } from '@/hooks/useTeamMutations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface TeamListProps {
    teams: Team[];
    partnerId: string;
}

export const TeamList: React.FC<TeamListProps> = ({ teams, partnerId }) => {
    const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
    const [teamToEdit, setTeamToEdit] = useState<Team | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);
    
    const deleteTeamMutation = useDeleteTeam(partnerId);

    const handleEdit = (team: Team) => {
        setTeamToEdit(team);
        setIsTeamDialogOpen(true);
    };

    const handleAdd = () => {
        setTeamToEdit(null);
        setIsTeamDialogOpen(true);
    };

    const handleDelete = (team: Team) => {
        setTeamToDelete(team);
        setIsDeleteDialogOpen(true);
    };
    
    const confirmDelete = () => {
        if (teamToDelete) {
            deleteTeamMutation.mutate(teamToDelete.id, {
                onSuccess: () => {
                    setIsDeleteDialogOpen(false);
                    setTeamToDelete(null);
                }
            });
        }
    };

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Teams</CardTitle>
                        <CardDescription>Collaborate with your team members on projects.</CardDescription>
                    </div>
                    <Button onClick={handleAdd} size="sm">
                        <PlusCircle className="mr-2 h-4 w-4" /> 
                        {teams.length === 0 ? 'Create Your First Team' : 'Add Team'}
                    </Button>
                </CardHeader>
                <CardContent>
                    {teams.length > 0 ? (
                        <div className="space-y-2">
                            {teams.map((team) => (
                                <div key={team.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted">
                                    <div className="flex items-center gap-3">
                                        <Users className="h-5 w-5 text-muted-foreground" />
                                        <p className="font-semibold">{team.name}</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEdit(team)}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    <span>Edit Team</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link to={`/team/${team.id}/settings`}>
                                                        <Settings className="mr-2 h-4 w-4" />
                                                        <span>Manage Members</span>
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDelete(team)} className="text-destructive">
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    <span>Delete Team</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-6">
                            <p className="text-sm text-muted-foreground">You haven't created any teams yet.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <TeamDialog
                partnerId={partnerId}
                isOpen={isTeamDialogOpen}
                onOpenChange={setIsTeamDialogOpen}
                teamToEdit={teamToEdit}
            />
            
            <DeleteTeamDialog
                isOpen={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={confirmDelete}
                isPending={deleteTeamMutation.isPending}
            />
        </>
    );
};


import React, { useState } from 'react';
import { ProjectMember, useProjectMembersData, useRemoveProjectMember } from '@/hooks/useProjectMembers';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, PlusCircle, User, Edit, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ManageMemberDialog } from './ManageMemberDialog';
import { RemoveMemberDialog } from './RemoveMemberDialog';
import { useAuth } from '@/contexts/AuthContext';

interface ProjectMembersProps {
  project: { id: string; name: string };
}

export const ProjectMembers: React.FC<ProjectMembersProps> = ({ project }) => {
  const { user } = useAuth();
  const { data: members, isLoading } = useProjectMembersData(project.id);
  const removeMemberMutation = useRemoveProjectMember(project.id);
  const [isManageMemberOpen, setManageMemberOpen] = useState(false);
  const [isRemoveMemberOpen, setRemoveMemberOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<ProjectMember | null>(null);

  const handleAdd = () => {
    setSelectedMember(null);
    setManageMemberOpen(true);
  };

  const handleEdit = (member: ProjectMember) => {
    setSelectedMember(member);
    setManageMemberOpen(true);
  };

  const handleRemove = (member: ProjectMember) => {
    setSelectedMember(member);
    setRemoveMemberOpen(true);
  };

  const confirmRemove = () => {
    if (selectedMember) {
      removeMemberMutation.mutate(
        { projectId: project.id, userId: selectedMember.user_id },
        { onSuccess: () => setRemoveMemberOpen(false) }
      );
    }
  };

  if (isLoading) return <div>Loading members...</div>;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>Manage who has access to this project.</CardDescription>
          </div>
          <Button onClick={handleAdd}><PlusCircle /> Add Member</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members?.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="font-medium">{member.user_profile.full_name || 'No Name'}</div>
                    <div className="text-sm text-muted-foreground">{member.user_profile.email}</div>
                  </TableCell>
                  <TableCell className="capitalize">{member.role}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={member.user_id === user?.id}>
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleEdit(member)}><Edit /> Edit Role</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRemove(member)} className="text-destructive"><Trash2 /> Remove</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <ManageMemberDialog
        isOpen={isManageMemberOpen}
        onOpenChange={setManageMemberOpen}
        project={project}
        memberToEdit={selectedMember}
      />
      
      <RemoveMemberDialog
        isOpen={isRemoveMemberOpen}
        onOpenChange={setRemoveMemberOpen}
        onConfirm={confirmRemove}
        isPending={removeMemberMutation.isPending}
        memberName={selectedMember?.user_profile.email || ''}
      />
    </>
  );
};

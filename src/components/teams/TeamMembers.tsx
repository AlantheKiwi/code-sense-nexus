
import React, { useState } from 'react';
import { TeamMember, useTeamMembersData, useRemoveTeamMember } from '@/hooks/useTeamMembers';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ManageTeamMemberDialog } from './ManageTeamMemberDialog';
import { RemoveTeamMemberDialog } from './RemoveTeamMemberDialog';
import { useAuth } from '@/contexts/AuthContext';

interface TeamMembersProps {
  team: { id: string; name: string };
}

export const TeamMembers: React.FC<TeamMembersProps> = ({ team }) => {
  const { user } = useAuth();
  const { data: members, isLoading } = useTeamMembersData(team.id);
  const removeMemberMutation = useRemoveTeamMember(team.id);
  const [isManageMemberOpen, setManageMemberOpen] = useState(false);
  const [isRemoveMemberOpen, setRemoveMemberOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const handleAdd = () => {
    setSelectedMember(null);
    setManageMemberOpen(true);
  };

  const handleEdit = (member: TeamMember) => {
    setSelectedMember(member);
    setManageMemberOpen(true);
  };

  const handleRemove = (member: TeamMember) => {
    setSelectedMember(member);
    setRemoveMemberOpen(true);
  };

  const confirmRemove = () => {
    if (selectedMember) {
      removeMemberMutation.mutate(
        { teamId: team.id, userId: selectedMember.user_id },
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
            <CardDescription>Manage who has access to this team.</CardDescription>
          </div>
          <Button onClick={handleAdd}><PlusCircle className="mr-2 h-4 w-4" /> Add Member</Button>
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
                        <DropdownMenuItem onClick={() => handleEdit(member)}><Edit className="mr-2 h-4 w-4" /> Edit Role</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRemove(member)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Remove</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <ManageTeamMemberDialog
        isOpen={isManageMemberOpen}
        onOpenChange={setManageMemberOpen}
        team={team}
        memberToEdit={selectedMember}
      />
      
      <RemoveTeamMemberDialog
        isOpen={isRemoveMemberOpen}
        onOpenChange={setRemoveMemberOpen}
        onConfirm={confirmRemove}
        isPending={removeMemberMutation.isPending}
        memberName={selectedMember?.user_profile.email || ''}
      />
    </>
  );
};


import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TeamMember, useAddTeamMember, useUpdateTeamMember } from '@/hooks/useTeamMembers';

const memberSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  role: z.enum(['admin', 'developer', 'viewer']),
});

interface ManageTeamMemberDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  team: { id: string; name: string };
  memberToEdit?: TeamMember | null;
}

export const ManageTeamMemberDialog: React.FC<ManageTeamMemberDialogProps> = ({ isOpen, onOpenChange, team, memberToEdit }) => {
  const addMemberMutation = useAddTeamMember(team.id);
  const updateMemberMutation = useUpdateTeamMember(team.id);

  const form = useForm<z.infer<typeof memberSchema>>({
    resolver: zodResolver(memberSchema),
    defaultValues: { role: 'developer' },
  });

  useEffect(() => {
    if (memberToEdit) {
      form.reset({ role: memberToEdit.role, email: memberToEdit.user_profile.email });
    } else {
      form.reset({ role: 'developer', email: '' });
    }
  }, [memberToEdit, form, isOpen]);

  const onSubmit = (values: z.infer<typeof memberSchema>) => {
    if (memberToEdit) {
      updateMemberMutation.mutate(
        { teamId: team.id, userId: memberToEdit.user_id, role: values.role },
        { onSuccess: () => onOpenChange(false) }
      );
    } else if (values.email) {
      addMemberMutation.mutate(
        { teamId: team.id, email: values.email, role: values.role },
        { onSuccess: () => onOpenChange(false) }
      );
    }
  };

  const isPending = addMemberMutation.isPending || updateMemberMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{memberToEdit ? 'Edit Member Role' : 'Add New Member'}</DialogTitle>
          <DialogDescription>
            {memberToEdit ? `Update the role for ${memberToEdit.user_profile.email}.` : `Invite a new member to the "${team.name}" team.`}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {!memberToEdit && (
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="member@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="developer">Developer</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : (memberToEdit ? 'Save Changes' : 'Add Member')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

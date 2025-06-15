
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProjectMember, useAddProjectMember, useUpdateProjectMember } from '@/hooks/useProjectMembers';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  role: z.enum(['admin', 'editor', 'viewer']),
});

interface ManageMemberDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  project: { id: string, name: string };
  memberToEdit?: ProjectMember | null;
}

export const ManageMemberDialog: React.FC<ManageMemberDialogProps> = ({ isOpen, onOpenChange, project, memberToEdit }) => {
  const addMemberMutation = useAddProjectMember(project.id);
  const updateMemberMutation = useUpdateProjectMember(project.id);
  const isPending = addMemberMutation.isPending || updateMemberMutation.isPending;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: memberToEdit?.user_profile.email || '',
      role: memberToEdit?.role || 'viewer',
    },
  });

  React.useEffect(() => {
    form.reset({
      email: memberToEdit?.user_profile.email || '',
      role: memberToEdit?.role || 'viewer',
    });
  }, [memberToEdit, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (memberToEdit) {
      updateMemberMutation.mutate(
        { projectId: project.id, userId: memberToEdit.user_id, role: values.role },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      addMemberMutation.mutate(
        { projectId: project.id, email: values.email, role: values.role },
        { onSuccess: () => onOpenChange(false) }
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{memberToEdit ? 'Edit Member Role' : 'Add New Member'}</DialogTitle>
          <DialogDescription>
            {memberToEdit ? `Update the role for ${memberToEdit.user_profile.email}.` : `Invite a new member to the "${project.name}" project.`}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="member@example.com" {...field} disabled={!!memberToEdit} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isPending}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="animate-spin" />}
                {memberToEdit ? 'Update Role' : 'Add Member'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

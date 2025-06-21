
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAddTeam, useUpdateTeam } from '@/hooks/useTeamMutations';
import { Team } from '@/hooks/useTeamsData';

const teamSchema = z.object({
  name: z.string().min(1, 'Team name is required'),
});

interface TeamDialogProps {
  partnerId: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  teamToEdit?: Team | null;
}

export const TeamDialog: React.FC<TeamDialogProps> = ({ partnerId, isOpen, onOpenChange, teamToEdit }) => {
  const addTeamMutation = useAddTeam();
  const updateTeamMutation = useUpdateTeam();

  const form = useForm<z.infer<typeof teamSchema>>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: '',
    },
  });

  useEffect(() => {
    if (teamToEdit) {
      form.reset({ name: teamToEdit.name });
    } else {
      form.reset({ name: '' });
    }
  }, [teamToEdit, form]);

  const onSubmit = (values: z.infer<typeof teamSchema>) => {
    console.log('Submitting team with partnerId:', partnerId);
    console.log('Form values:', values);
    
    if (!partnerId) {
      console.error('No partnerId provided');
      return;
    }

    if (teamToEdit) {
      updateTeamMutation.mutate(
        { id: teamToEdit.id, ...values },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      addTeamMutation.mutate(
        { 
          name: values.name, 
          partner_id: partnerId,
          created_by: null // Let the database handle this
        },
        { onSuccess: () => onOpenChange(false) }
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{teamToEdit ? 'Edit Team' : 'Create New Team'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Name</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g. Frontend Legends" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={addTeamMutation.isPending || updateTeamMutation.isPending}>
                {teamToEdit ? 'Save Changes' : 'Create Team'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

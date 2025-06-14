
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { TablesInsert } from '@/integrations/supabase/types';

type ProjectInsert = TablesInsert<'projects'>;

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Project name must be at least 2 characters.',
  }),
  github_url: z.string().url({ message: 'Please enter a valid URL.' }).optional().or(z.literal('')),
});

interface AddProjectDialogProps {
  partnerId: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const addProject = async (newProject: ProjectInsert) => {
  const { data, error } = await supabase.from('projects').insert(newProject).select().single();
  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export const AddProjectDialog: React.FC<AddProjectDialogProps> = ({ partnerId, isOpen, onOpenChange }) => {
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      github_url: '',
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: addProject,
    onSuccess: () => {
      toast.success('Project added successfully!');
      queryClient.invalidateQueries({ queryKey: ['projects', partnerId] });
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast.error(`Failed to add project: ${error.message}`);
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    mutate({
      ...values,
      partner_id: partnerId,
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Project</DialogTitle>
          <DialogDescription>
            Enter the details of your new project. Connect to GitHub to enable automatic analysis.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Awesome App" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="github_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GitHub Repository URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://github.com/user/repo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Add Project
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};


import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAddProject, useUpdateProject } from '@/hooks/useProjectMutations';
import { Tables } from '@/integrations/supabase/types';

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

type Project = Tables<'projects'>;

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Project name must be at least 2 characters.',
  }),
  github_url: z.string().url({ message: 'Please enter a valid URL.' }).optional().or(z.literal('')),
  language: z.string().optional(),
  framework: z.string().optional(),
});

interface ProjectDialogProps {
  partnerId: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  projectToEdit?: Project | null;
}

export const ProjectDialog: React.FC<ProjectDialogProps> = ({ partnerId, isOpen, onOpenChange, projectToEdit }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      github_url: '',
      language: '',
      framework: '',
    },
  });

  useEffect(() => {
    if (projectToEdit && isOpen) {
      form.reset({
        name: projectToEdit.name,
        github_url: projectToEdit.github_url || '',
        language: projectToEdit.language || '',
        framework: projectToEdit.framework || '',
      });
    } else if (!projectToEdit && isOpen) {
       form.reset({
          name: '',
          github_url: '',
          language: '',
          framework: '',
       });
    }
  }, [projectToEdit, form, isOpen]);

  const addProjectMutation = useAddProject();
  const updateProjectMutation = useUpdateProject();

  const isPending = addProjectMutation.isPending || updateProjectMutation.isPending;

  function onSubmit(values: z.infer<typeof formSchema>) {
    const commonPayload = {
        ...values,
        github_url: values.github_url || null,
        language: values.language || null,
        framework: values.framework || null,
    };

    if (projectToEdit) {
      updateProjectMutation.mutate({
        id: projectToEdit.id,
        ...commonPayload
      }, {
        onSuccess: () => onOpenChange(false)
      });
    } else {
      addProjectMutation.mutate({
        ...commonPayload,
        partner_id: partnerId,
      }, {
        onSuccess: () => onOpenChange(false)
      });
    }
  }
  
  const handleDialogClose = (open: boolean) => {
    if (!isPending) {
      onOpenChange(open);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{projectToEdit ? 'Edit Project' : 'Add New Project'}</DialogTitle>
          <DialogDescription>
            {projectToEdit ? 'Update the details of your project.' : 'Enter the details of your new project. Connect to GitHub to enable automatic analysis.'}
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
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Language (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., TypeScript" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="framework"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Framework (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., React" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleDialogClose(false)} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {projectToEdit ? 'Save Changes' : 'Add Project'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

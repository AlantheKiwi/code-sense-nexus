
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ToolUpdate } from '@/hooks/useToolUpdates';
import { Skeleton } from "@/components/ui/skeleton";

interface UpdatesTableProps {
  updates: ToolUpdate[];
  isLoading: boolean;
  isHistory?: boolean;
}

export function UpdatesTable({ updates, isLoading, isHistory = false }: UpdatesTableProps) {
    const queryClient = useQueryClient();

    const handleInstall = async (updateId: string) => {
        toast.info("Starting update installation...");

        const { error } = await supabase.functions.invoke('install-update', {
            body: { updateId },
        });

        if (error) {
            toast.error(`Installation failed: ${error.message}`);
        } else {
            toast.success("Update successfully queued for installation!");
            queryClient.invalidateQueries({ queryKey: ['toolUpdates'] });
        }
    };

    const handleRollback = async (updateId: string) => {
        toast.info("Starting rollback...");

        const { error } = await supabase.functions.invoke('rollback-update', {
            body: { updateId },
        });

        if (error) {
            toast.error(`Rollback failed: ${error.message}`);
        } else {
            toast.success("Update successfully rolled back!");
            queryClient.invalidateQueries({ queryKey: ['toolUpdates'] });
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        );
    }

    if (!updates || updates.length === 0) {
        return <p className="text-center text-muted-foreground py-4">No updates found.</p>;
    }

    const getBadgeVariant = (status: string) => {
        switch (status) {
            case 'completed':
                return 'default';
            case 'rolled_back':
                return 'outline';
            case 'installing':
                return 'secondary';
            case 'failed':
                return 'destructive';
            default:
                return 'secondary';
        }
    };

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Tool</TableHead>
                    <TableHead>From Version</TableHead>
                    <TableHead>To Version</TableHead>
                    <TableHead>Date</TableHead>
                    {isHistory && <TableHead>Status</TableHead>}
                    <TableHead className="text-right">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {updates.map((update) => (
                    <TableRow key={update.id}>
                        <TableCell className="font-medium">{update.tools?.name || 'Unknown Tool'}</TableCell>
                        <TableCell>{update.from_version || 'N/A'}</TableCell>
                        <TableCell>{update.to_version}</TableCell>
                        <TableCell>{format(new Date(update.created_at), 'PPP')}</TableCell>
                        {isHistory && (
                            <TableCell>
                                <Badge variant={getBadgeVariant(update.status)}>
                                    {update.status}
                                </Badge>
                            </TableCell>
                        )}
                        <TableCell className="text-right">
                            {!isHistory && (
                                <Button onClick={() => handleInstall(update.id)}>
                                    Install
                                </Button>
                            )}
                            {isHistory && update.status === 'completed' && (
                                <Button variant="outline" size="sm" onClick={() => handleRollback(update.id)}>
                                    Rollback
                                </Button>
                            )}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

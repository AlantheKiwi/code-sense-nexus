
import { useToolUpdates } from '@/hooks/useToolUpdates';
import { UpdatesTable } from './UpdatesTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function UpdateHistory() {
  const { data: updates, isLoading } = useToolUpdates(['completed', 'failed', 'rolled_back', 'installing']);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update History</CardTitle>
      </CardHeader>
      <CardContent>
        <UpdatesTable updates={updates || []} isLoading={isLoading} isHistory={true} />
      </CardContent>
    </Card>
  );
}

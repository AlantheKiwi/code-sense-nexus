
import { useToolUpdates } from '@/hooks/useToolUpdates';
import { UpdatesTable } from './UpdatesTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AvailableUpdates() {
  const { data: updates, isLoading } = useToolUpdates(['available']);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Available Updates</CardTitle>
      </CardHeader>
      <CardContent>
        <UpdatesTable updates={updates || []} isLoading={isLoading} />
      </CardContent>
    </Card>
  );
}

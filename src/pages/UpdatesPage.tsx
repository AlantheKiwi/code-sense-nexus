
import { AvailableUpdates } from '@/components/updates/AvailableUpdates';
import { UpdateHistory } from '@/components/updates/UpdateHistory';

const UpdatesPage = () => {
  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tool Updates</h1>
        <p className="text-muted-foreground">
          View and manage updates for your integrated tools.
        </p>
      </div>
      
      <AvailableUpdates />
      <UpdateHistory />
    </div>
  );
};

export default UpdatesPage;


import { Skeleton } from '@/components/ui/skeleton';

export const LoadingSkeleton = () => (
  <div className="container mx-auto p-4 md:p-8 space-y-8">
    <Skeleton className="h-10 w-1/3" />
    <Skeleton className="h-8 w-1/4" />
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2 space-y-4">
        <Skeleton className="h-64" />
        <Skeleton className="h-40" />
      </div>
      <div>
        <Skeleton className="h-48" />
      </div>
    </div>
  </div>
);

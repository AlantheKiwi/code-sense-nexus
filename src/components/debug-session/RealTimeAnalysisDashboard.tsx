
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface RealTimeAnalysisDashboardProps {
  projectId?: string;
  sessionId?: string;
}

export const RealTimeAnalysisDashboard = ({ 
  projectId, 
  sessionId 
}: RealTimeAnalysisDashboardProps) => {
  
  // DISABLED: All real-time analysis functionality during system rebuild
  console.log('RealTimeAnalysisDashboard disabled during system rebuild');

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <AlertTriangle className="h-5 w-5" />
          Real-Time Analysis Temporarily Unavailable
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-orange-700">
          <p className="text-lg font-medium mb-2">System Rebuild in Progress</p>
          <p className="text-sm mb-4">
            Real-time analysis features are being rebuilt for improved reliability and performance.
          </p>
          <p className="text-xs">
            Manual analysis tools remain available. Auto-fix features will return soon.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

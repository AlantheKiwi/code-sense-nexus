
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export const SystemStatusNotice = () => {
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <AlertTriangle className="h-5 w-5" />
          AI-Enhanced Debug Session Ready
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-blue-700">
          New AI-powered analysis system is active! 
          CodeSense AI will provide intelligent insights and perfect Lovable prompts.
        </p>
      </CardContent>
    </Card>
  );
};

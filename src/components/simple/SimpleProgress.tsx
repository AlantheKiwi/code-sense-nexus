
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, Zap } from 'lucide-react';

export const SimpleProgress: React.FC = () => {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl flex items-center justify-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          Fixing Your TypeScript Errors
        </CardTitle>
        <p className="text-gray-600">
          Our AI is analyzing and fixing your code automatically
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Analyzing code structure...</span>
            <span className="text-blue-600 font-medium">100%</span>
          </div>
          <Progress value={100} className="h-2" />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Detecting TypeScript errors...</span>
            <span className="text-blue-600 font-medium">85%</span>
          </div>
          <Progress value={85} className="h-2" />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Applying automatic fixes...</span>
            <span className="text-orange-600 font-medium">60%</span>
          </div>
          <Progress value={60} className="h-2" />
        </div>

        <div className="text-center p-6 bg-blue-50 rounded-lg">
          <Zap className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <p className="text-blue-800 font-medium">
            Fixing common Lovable TypeScript issues...
          </p>
          <p className="text-blue-600 text-sm mt-1">
            This usually takes 10-30 seconds
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

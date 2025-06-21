
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, TrendingUp, CheckCircle, Shield } from 'lucide-react';
import { LovableHealthMetrics } from '@/services/LovableIntegration';

interface LovableHealthMetricsProps {
  metrics: LovableHealthMetrics;
}

export const LovableHealthMetricsComponent: React.FC<LovableHealthMetricsProps> = ({ metrics }) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className={`text-2xl font-bold ${getScoreColor(metrics.overallScore)}`}>
            {metrics.overallScore}%
          </div>
          <div className="text-xs text-gray-600">Code Health</div>
          <Progress value={metrics.overallScore} className="mt-1" />
        </div>
        <div className="text-center">
          <div className={`text-2xl font-bold ${getScoreColor(metrics.readinessScore)}`}>
            {metrics.readinessScore}%
          </div>
          <div className="text-xs text-gray-600">Deploy Ready</div>
          <Progress value={metrics.readinessScore} className="mt-1" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-white p-2 rounded border">
          <div className="flex items-center justify-center gap-1">
            <Clock className="h-3 w-3 text-green-600" />
            <span className="text-sm font-medium text-green-600">
              {metrics.timeSavedMinutes}m
            </span>
          </div>
          <div className="text-xs text-gray-600">Time Saved</div>
        </div>
        <div className="bg-white p-2 rounded border">
          <div className="flex items-center justify-center gap-1">
            <TrendingUp className="h-3 w-3 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">
              {metrics.issuesPrevented}
            </span>
          </div>
          <div className="text-xs text-gray-600">Issues Found</div>
        </div>
        <div className="bg-white p-2 rounded border">
          <div className="flex items-center justify-center gap-1">
            <CheckCircle className="h-3 w-3 text-purple-600" />
            <span className="text-sm font-medium text-purple-600">
              {metrics.readinessScore > 80 ? 'Ready' : 'Needs Work'}
            </span>
          </div>
          <div className="text-xs text-gray-600">Status</div>
        </div>
      </div>
    </div>
  );
};

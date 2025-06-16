
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, BarChart } from 'lucide-react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import type { ProjectMetrics } from './ResultsSummaryDashboard';

interface BeforeAfterComparisonsProps {
  projectId: string;
  currentMetrics: ProjectMetrics;
}

interface ComparisonData {
  metric: string;
  before: number;
  after: number;
  improvement: number;
  unit: string;
}

export const BeforeAfterComparisons = ({ projectId, currentMetrics }: BeforeAfterComparisonsProps) => {
  const [selectedComparison, setSelectedComparison] = useState<string>('latest');

  // Mock historical data - in real implementation, this would come from API
  const comparisons: ComparisonData[] = [
    {
      metric: 'Code Quality Score',
      before: 65,
      after: currentMetrics.codeQualityScore,
      improvement: ((currentMetrics.codeQualityScore - 65) / 65) * 100,
      unit: '%'
    },
    {
      metric: 'Security Score',
      before: 58,
      after: currentMetrics.securityScore,
      improvement: ((currentMetrics.securityScore - 58) / 58) * 100,
      unit: '%'
    },
    {
      metric: 'Performance Score',
      before: 72,
      after: currentMetrics.performanceScore,
      improvement: ((currentMetrics.performanceScore - 72) / 72) * 100,
      unit: '%'
    },
    {
      metric: 'Accessibility Score',
      before: 66,
      after: currentMetrics.accessibilityScore,
      improvement: ((currentMetrics.accessibilityScore - 66) / 66) * 100,
      unit: '%'
    },
    {
      metric: 'Technical Debt Index',
      before: 42,
      after: currentMetrics.technicalDebtIndex,
      improvement: ((42 - currentMetrics.technicalDebtIndex) / 42) * 100, // Lower is better
      unit: '%'
    }
  ];

  // Mock timeline data
  const timelineData = [
    { date: '2024-01-01', codeQuality: 65, security: 58, performance: 72 },
    { date: '2024-01-15', codeQuality: 68, security: 61, performance: 74 },
    { date: '2024-02-01', codeQuality: 72, security: 63, performance: 76 },
    { date: '2024-02-15', codeQuality: 75, security: 65, performance: 78 },
    { date: '2024-03-01', codeQuality: currentMetrics.codeQualityScore, security: currentMetrics.securityScore, performance: currentMetrics.performanceScore },
  ];

  const getImprovementColor = (improvement: number) => {
    if (improvement > 0) return 'text-green-600';
    if (improvement < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getImprovementIcon = (improvement: number) => {
    if (improvement > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (improvement < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Comparison Period Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Before/After Comparisons</span>
            <div className="flex gap-2">
              <Button
                variant={selectedComparison === 'latest' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedComparison('latest')}
              >
                Latest Fix
              </Button>
              <Button
                variant={selectedComparison === '30d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedComparison('30d')}
              >
                30 Days
              </Button>
              <Button
                variant={selectedComparison === '90d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedComparison('90d')}
              >
                90 Days
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Metrics Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Metrics Improvement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={comparisons}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="metric" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    `${value}${name === 'before' || name === 'after' ? '%' : ''}`,
                    name === 'before' ? 'Before' : 'After'
                  ]}
                />
                <Bar dataKey="before" fill="#94a3b8" name="before" />
                <Bar dataKey="after" fill="#3b82f6" name="after" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Comparisons */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Improvements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {comparisons.map((comparison) => (
              <Card key={comparison.metric} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">{comparison.metric}</h4>
                    <div className="flex items-center gap-2">
                      {getImprovementIcon(comparison.improvement)}
                      <span className={`font-semibold ${getImprovementColor(comparison.improvement)}`}>
                        {comparison.improvement > 0 ? '+' : ''}{comparison.improvement.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Before</p>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold text-gray-600">
                          {comparison.before}{comparison.unit}
                        </span>
                        <Progress value={comparison.before} className="flex-1 h-2" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">After</p>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold text-blue-600">
                          {comparison.after}{comparison.unit}
                        </span>
                        <Progress value={comparison.after} className="flex-1 h-2" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">
                      {comparison.improvement > 0 ? 'Improvement: ' : 'Decline: '}
                      <strong>
                        {Math.abs(comparison.after - comparison.before)}{comparison.unit} 
                        ({Math.abs(comparison.improvement).toFixed(1)}%)
                      </strong>
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Timeline Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Progress Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value, name) => [
                    `${value}%`,
                    name === 'codeQuality' ? 'Code Quality' : 
                    name === 'security' ? 'Security' : 'Performance'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="codeQuality" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="codeQuality"
                />
                <Line 
                  type="monotone" 
                  dataKey="security" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  name="security"
                />
                <Line 
                  type="monotone" 
                  dataKey="performance" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="performance"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Impact Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Impact Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {comparisons.filter(c => c.improvement > 0).length}
                </div>
                <div className="text-sm text-muted-foreground">Metrics Improved</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {(comparisons.reduce((sum, c) => sum + Math.abs(c.improvement), 0) / comparisons.length).toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Avg Improvement</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {Math.max(...comparisons.map(c => c.improvement)).toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Best Improvement</div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

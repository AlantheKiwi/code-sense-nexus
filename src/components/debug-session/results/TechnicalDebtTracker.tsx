
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { Issue, ProjectMetrics } from './ResultsSummaryDashboard';

interface TechnicalDebtTrackerProps {
  issues: Issue[];
  metrics: ProjectMetrics;
  projectId: string;
}

export const TechnicalDebtTracker = ({ issues, metrics, projectId }: TechnicalDebtTrackerProps) => {
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d');

  // Mock historical data - in real implementation, this would come from API
  const historicalData = [
    { date: '2024-01-01', debtIndex: 45, resolvedItems: 2 },
    { date: '2024-01-08', debtIndex: 42, resolvedItems: 1 },
    { date: '2024-01-15', debtIndex: 38, resolvedItems: 3 },
    { date: '2024-01-22', debtIndex: 36, resolvedItems: 1 },
    { date: '2024-01-29', debtIndex: 34, resolvedItems: 2 },
  ];

  const totalDebtHours = issues.reduce((sum, issue) => sum + issue.estimatedTimeHours, 0);
  const avgDebtAge = 45; // Mock average age in days
  const debtTrend = -11; // Percentage change over time period

  const getCategoryDistribution = () => {
    const distribution = issues.reduce((acc, issue) => {
      acc[issue.category] = (acc[issue.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return distribution;
  };

  const categoryDistribution = getCategoryDistribution();

  return (
    <div className="space-y-6">
      {/* Technical Debt Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <AlertTriangle className="h-6 w-6 text-orange-500" />
            </div>
            <div className="text-2xl font-bold text-orange-600">{metrics.technicalDebtIndex}%</div>
            <div className="text-sm text-muted-foreground">Debt Index</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-6 w-6 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-blue-600">{totalDebtHours}h</div>
            <div className="text-sm text-muted-foreground">Total Effort</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-6 w-6 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-purple-600">{avgDebtAge}d</div>
            <div className="text-sm text-muted-foreground">Avg Age</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              {debtTrend < 0 ? (
                <TrendingDown className="h-6 w-6 text-green-500" />
              ) : (
                <TrendingUp className="h-6 w-6 text-red-500" />
              )}
            </div>
            <div className={`text-2xl font-bold ${debtTrend < 0 ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(debtTrend)}%
            </div>
            <div className="text-sm text-muted-foreground">
              {debtTrend < 0 ? 'Improvement' : 'Increase'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Debt Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Technical Debt Trend</span>
            <div className="flex gap-2">
              {['7d', '30d', '90d'].map((period) => (
                <Button
                  key={period}
                  variant={timeframe === period ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeframe(period as any)}
                >
                  {period}
                </Button>
              ))}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value, name) => [
                    `${value}${name === 'debtIndex' ? '%' : ''}`,
                    name === 'debtIndex' ? 'Debt Index' : 'Resolved Items'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="debtIndex" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  name="debtIndex"
                />
                <Line 
                  type="monotone" 
                  dataKey="resolvedItems" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="resolvedItems"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Debt by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(categoryDistribution).map(([category, count]) => {
              const percentage = (count / issues.length) * 100;
              return (
                <div key={category}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium capitalize">
                      {category.replace('_', ' ')}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {count} item{count !== 1 ? 's' : ''} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Debt Items List */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Debt Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {issues.map((issue) => (
              <Card key={issue.id} className="border-l-4 border-l-orange-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{issue.title}</h4>
                        <Badge variant="outline">
                          {issue.category.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline">
                          {issue.estimatedTimeHours}h
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {issue.description}
                      </p>
                      <div className="bg-orange-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-orange-800 mb-1">
                          Impact on Development:
                        </p>
                        <p className="text-sm text-orange-700">
                          {issue.businessImpact}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <Button size="sm">
                        Schedule Fix
                      </Button>
                      <Button size="sm" variant="outline">
                        Add to Backlog
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Debt Management Strategy */}
      <Card>
        <CardHeader>
          <CardTitle>Debt Management Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Current Status</h4>
              <div className="space-y-2 text-sm">
                {metrics.technicalDebtIndex > 40 ? (
                  <div className="flex items-start gap-2 text-orange-700">
                    <AlertTriangle className="h-4 w-4 mt-0.5" />
                    <span>High debt level - allocate 25-30% of sprint capacity to debt reduction</span>
                  </div>
                ) : metrics.technicalDebtIndex > 20 ? (
                  <div className="flex items-start gap-2 text-yellow-700">
                    <Clock className="h-4 w-4 mt-0.5" />
                    <span>Moderate debt level - allocate 15-20% of sprint capacity</span>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 text-green-700">
                    <TrendingDown className="h-4 w-4 mt-0.5" />
                    <span>Low debt level - maintain current practices</span>
                  </div>
                )}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3">Action Plan</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Prioritize security-related debt items first</li>
                <li>Address performance issues affecting users</li>
                <li>Schedule regular debt reduction sprints</li>
                <li>Implement automated debt detection tools</li>
                <li>Set debt thresholds and monitoring alerts</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

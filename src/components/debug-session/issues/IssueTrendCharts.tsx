
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';

interface IssueTrendChartsProps {
  projectId?: string;
}

export const IssueTrendCharts = ({ projectId }: IssueTrendChartsProps) => {
  // Mock trend data - in real implementation, this would come from API
  const trendData = [
    { date: '2024-01-01', critical: 5, high: 12, medium: 23, low: 8, total: 48 },
    { date: '2024-01-08', critical: 3, high: 10, medium: 25, low: 12, total: 50 },
    { date: '2024-01-15', critical: 2, high: 8, medium: 20, low: 15, total: 45 },
    { date: '2024-01-22', critical: 1, high: 6, medium: 18, low: 18, total: 43 },
    { date: '2024-01-29', critical: 1, high: 4, medium: 15, low: 20, total: 40 },
    { date: '2024-02-05', critical: 0, high: 3, medium: 12, low: 22, total: 37 },
  ];

  const categoryData = [
    { category: 'Security', count: 8, trend: 'down' },
    { category: 'Performance', count: 15, trend: 'down' },
    { category: 'Accessibility', count: 10, trend: 'up' },
    { category: 'Code Quality', count: 4, trend: 'down' },
  ];

  const totalIssuesChange = trendData[trendData.length - 1].total - trendData[0].total;
  const isImproving = totalIssuesChange < 0;

  return (
    <div className="space-y-6">
      {/* Overall Trend Summary */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              {isImproving ? (
                <TrendingDown className="h-5 w-5 text-green-500" />
              ) : (
                <TrendingUp className="h-5 w-5 text-red-500" />
              )}
            </div>
            <div className="text-2xl font-bold mb-1">
              {Math.abs(totalIssuesChange)}
            </div>
            <div className="text-xs text-muted-foreground">
              Issues {isImproving ? 'Resolved' : 'Added'} (30 Days)
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Calendar className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-2xl font-bold mb-1">
              {trendData[trendData.length - 1].total}
            </div>
            <div className="text-xs text-muted-foreground">
              Current Open Issues
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold mb-1">
              85%
            </div>
            <div className="text-xs text-muted-foreground">
              Resolution Rate
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Issues Over Time Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Issues Trend Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => new Date(date).toLocaleDateString()}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
              />
              <Line 
                type="monotone" 
                dataKey="critical" 
                stroke="#ef4444" 
                strokeWidth={2}
                name="Critical"
              />
              <Line 
                type="monotone" 
                dataKey="high" 
                stroke="#f97316" 
                strokeWidth={2}
                name="High"
              />
              <Line 
                type="monotone" 
                dataKey="medium" 
                stroke="#eab308" 
                strokeWidth={2}
                name="Medium"
              />
              <Line 
                type="monotone" 
                dataKey="low" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Low"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Issues by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Issues by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

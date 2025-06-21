
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { StripeService } from '@/services/payments/StripeService';
import { Download, TrendingUp, DollarSign, CreditCard, Users } from 'lucide-react';
import { toast } from 'sonner';

interface RevenueData {
  total_revenue: number;
  transaction_count: number;
  average_transaction: number;
  revenue_by_type: Array<{
    transaction_type: string;
    amount: number;
    count: number;
  }>;
  daily_revenue: Array<{
    date: string;
    amount: number;
    transactions: number;
  }>;
}

export const SubsidiaryReporting: React.FC = () => {
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const loadRevenueData = async () => {
    setLoading(true);
    try {
      const data = await StripeService.getSubsidiaryRevenue(
        dateRange.startDate,
        dateRange.endDate
      );
      setRevenueData(data);
    } catch (error: any) {
      toast.error(`Failed to load revenue data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRevenueData();
  }, []);

  const exportData = () => {
    if (!revenueData) return;
    
    const csvContent = [
      ['Date Range', `${dateRange.startDate} to ${dateRange.endDate}`],
      ['Total Revenue', `$${(revenueData.total_revenue / 100).toFixed(2)}`],
      ['Transaction Count', revenueData.transaction_count.toString()],
      ['Average Transaction', `$${(revenueData.average_transaction / 100).toFixed(2)}`],
      ['Subsidiary', 'CodeSense'],
      ['Parent Company', 'Insight AI Systems Ltd'],
      [''],
      ['Transaction Type', 'Revenue', 'Count'],
      ...revenueData.revenue_by_type.map(item => [
        item.transaction_type,
        `$${(item.amount / 100).toFixed(2)}`,
        item.count.toString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `codesense-revenue-${dateRange.startDate}-${dateRange.endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">CodeSense Revenue Analytics</h2>
          <p className="text-muted-foreground">
            Financial reporting for Insight AI Systems Ltd - CodeSense subsidiary
          </p>
        </div>
        <Button onClick={exportData} disabled={!revenueData}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
          />
        </div>
        <div className="flex items-end">
          <Button onClick={loadRevenueData} disabled={loading} className="w-full">
            {loading ? 'Loading...' : 'Update Report'}
          </Button>
        </div>
      </div>

      {revenueData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${(revenueData.total_revenue / 100).toFixed(2)}
                </div>
                <Badge variant="secondary" className="mt-1">CodeSense</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{revenueData.transaction_count}</div>
                <p className="text-xs text-muted-foreground">Total payments</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Sale</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${(revenueData.average_transaction / 100).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">Per transaction</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Subsidiary</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">CodeSense</div>
                <p className="text-xs text-muted-foreground">Insight AI Systems Ltd</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Transaction Type</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={revenueData.revenue_by_type}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ transaction_type, percent }) => 
                        `${transaction_type} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="amount"
                    >
                      {revenueData.revenue_by_type.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [`$${(value / 100).toFixed(2)}`, 'Revenue']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Daily Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData.daily_revenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis tickFormatter={(value) => `$${(value / 100).toFixed(0)}`} />
                    <Tooltip formatter={(value: any) => [`$${(value / 100).toFixed(2)}`, 'Revenue']} />
                    <Bar dataKey="amount" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

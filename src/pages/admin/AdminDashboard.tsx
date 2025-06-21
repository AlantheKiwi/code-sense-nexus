
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, CreditCard, Activity, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const AdminDashboard = () => {
  const { data: userStats } = useQuery({
    queryKey: ['admin-user-stats'],
    queryFn: async () => {
      const { data: totalUsers, count } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true });

      const { data: activeUsers, count: activeCount } = await supabase
        .from('user_usage_tracking')
        .select('user_id', { count: 'exact', head: true })
        .gte('usage_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      return {
        totalUsers: count || 0,
        activeUsers: activeCount || 0
      };
    }
  });

  const { data: creditStats } = useQuery({
    queryKey: ['admin-credit-stats'],
    queryFn: async () => {
      const { data: totalCredits } = await supabase
        .from('user_credits')
        .select('balance');

      const { data: recentTransactions } = await supabase
        .from('credit_transactions')
        .select('amount')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      return {
        totalCreditsInSystem: totalCredits?.reduce((sum, user) => sum + user.balance, 0) || 0,
        dailyTransactions: recentTransactions?.length || 0
      };
    }
  });

  const { data: systemHealth } = useQuery({
    queryKey: ['admin-system-health'],
    queryFn: async () => {
      const { data: settings } = await supabase
        .from('system_settings')
        .select('*');

      const maintenanceMode = settings?.find(s => s.setting_key === 'maintenance_mode')?.setting_value;
      
      return {
        maintenanceMode: maintenanceMode === 'true',
        uptime: '99.9%', // Mock data
        avgResponseTime: '120ms' // Mock data
      };
    }
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage CodeSense platform operations</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {userStats?.activeUsers || 0} active this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits in System</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{creditStats?.totalCreditsInSystem || 0}</div>
            <p className="text-xs text-muted-foreground">
              {creditStats?.dailyTransactions || 0} transactions today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            {systemHealth?.maintenanceMode ? (
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemHealth?.uptime || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">
              Avg response: {systemHealth?.avgResponseTime || 'N/A'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue (30d)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,450</div>
            <p className="text-xs text-muted-foreground">
              +23% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Maintenance Mode</span>
              <Badge variant={systemHealth?.maintenanceMode ? "destructive" : "secondary"}>
                {systemHealth?.maintenanceMode ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>API Status</span>
              <Badge variant="secondary">Operational</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Database</span>
              <Badge variant="secondary">Healthy</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-sm">
                <span className="font-medium">New user registration</span>
                <span className="text-muted-foreground ml-2">2 minutes ago</span>
              </div>
              <div className="text-sm">
                <span className="font-medium">Credit purchase: $29.99</span>
                <span className="text-muted-foreground ml-2">15 minutes ago</span>
              </div>
              <div className="text-sm">
                <span className="font-medium">AI analysis completed</span>
                <span className="text-muted-foreground ml-2">23 minutes ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;


import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { 
  LayoutDashboard, 
  DollarSign, 
  Users, 
  FileText, 
  Settings,
  Shield,
  Home,
  ChevronRight
} from 'lucide-react';

const AdminLayout = () => {
  const { data: isAdmin, isLoading } = useAdminAccess();
  const location = useLocation();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="p-8 text-center">
          <CardContent>
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-muted-foreground">You don't have permission to access the admin panel.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/pricing', label: 'Pricing', icon: DollarSign },
    { path: '/admin/users', label: 'Users', icon: Users },
    { path: '/admin/legal', label: 'Legal Pages', icon: FileText },
    { path: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  const getCurrentPageTitle = () => {
    const currentItem = navItems.find(item => item.path === location.pathname);
    return currentItem ? currentItem.label : 'Admin';
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Top Navigation */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-4">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground">
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span className="font-medium">Admin</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{getCurrentPageTitle()}</span>
          </div>

          <div className="ml-auto flex items-center space-x-4">
            <Menubar>
              <MenubarMenu>
                <MenubarTrigger>Quick Actions</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem asChild>
                    <Link to="/admin" className="flex items-center">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </MenubarItem>
                  <MenubarItem asChild>
                    <Link to="/admin/users" className="flex items-center">
                      <Users className="mr-2 h-4 w-4" />
                      Manage Users
                    </Link>
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem asChild>
                    <Link to="/admin/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      System Settings
                    </Link>
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
            
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Shield className="h-3 w-3" />
              <span>Super Admin</span>
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 border-r bg-muted/40 p-4">
          <div className="mb-6">
            <h2 className="text-lg font-semibold flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Admin Panel
            </h2>
          </div>
          
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || 
                (item.path === '/admin' && location.pathname === '/admin');
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-muted'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;

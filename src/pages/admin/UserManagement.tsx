
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, CreditCard, UserPlus, Ban, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
}

interface UserCredit {
  user_id: string;
  balance: number;
}

interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  balance: number;
  description: string;
  created_at: string;
}

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [creditAmount, setCreditAmount] = useState(0);
  const [creditDescription, setCreditDescription] = useState('');
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users', searchTerm],
    queryFn: async () => {
      let query = supabase.from('profiles').select('*');
      
      if (searchTerm) {
        query = query.ilike('email', `%${searchTerm}%`);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false }).limit(50);
      if (error) throw error;
      return data as UserProfile[];
    }
  });

  const { data: userCredits } = useQuery({
    queryKey: ['admin-user-credits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_credits')
        .select('*');
      
      if (error) throw error;
      return data as UserCredit[];
    }
  });

  const { data: recentTransactions } = useQuery({
    queryKey: ['admin-recent-transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('credit_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data as CreditTransaction[];
    }
  });

  const addCreditsMutation = useMutation({
    mutationFn: async ({ userId, amount, description }: { userId: string, amount: number, description: string }) => {
      const { data, error } = await supabase.rpc('add_user_credits', {
        p_user_id: userId,
        p_amount: amount,
        p_description: description
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Credits added successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-user-credits'] });
      queryClient.invalidateQueries({ queryKey: ['admin-recent-transactions'] });
      setSelectedUserId(null);
      setCreditAmount(0);
      setCreditDescription('');
    },
    onError: (error: any) => {
      toast.error(`Failed to add credits: ${error.message}`);
    }
  });

  const deductCreditsMutation = useMutation({
    mutationFn: async ({ userId, amount, description }: { userId: string, amount: number, description: string }) => {
      const { data, error } = await supabase.rpc('deduct_user_credits', {
        p_user_id: userId,
        p_amount: amount,
        p_description: description
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Credits deducted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-user-credits'] });
      queryClient.invalidateQueries({ queryKey: ['admin-recent-transactions'] });
      setSelectedUserId(null);
      setCreditAmount(0);
      setCreditDescription('');
    },
    onError: (error: any) => {
      toast.error(`Failed to deduct credits: ${error.message}`);
    }
  });

  const usersWithCredits = users?.map(user => ({
    ...user,
    credits: userCredits?.find(c => c.user_id === user.id)?.balance || 0
  }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage users, credits, and permissions</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {usersWithCredits?.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">{user.full_name || 'Unnamed User'}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                      <div className="text-xs text-muted-foreground">
                        Joined: {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge variant="secondary">
                        {user.credits} credits
                      </Badge>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" onClick={() => setSelectedUserId(user.id)}>
                            <CreditCard className="h-4 w-4 mr-2" />
                            Manage Credits
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Manage Credits for {user.email}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Current Balance: {user.credits} credits</Label>
                            </div>
                            <div>
                              <Label>Amount</Label>
                              <Input
                                type="number"
                                value={creditAmount}
                                onChange={(e) => setCreditAmount(parseInt(e.target.value) || 0)}
                                placeholder="Enter amount"
                              />
                            </div>
                            <div>
                              <Label>Description</Label>
                              <Input
                                value={creditDescription}
                                onChange={(e) => setCreditDescription(e.target.value)}
                                placeholder="Reason for credit adjustment"
                              />
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => addCreditsMutation.mutate({
                                  userId: user.id,
                                  amount: creditAmount,
                                  description: creditDescription
                                })}
                                disabled={!creditAmount || !creditDescription}
                              >
                                Add Credits
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => deductCreditsMutation.mutate({
                                  userId: user.id,
                                  amount: creditAmount,
                                  description: creditDescription
                                })}
                                disabled={!creditAmount || !creditDescription}
                              >
                                Deduct Credits
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Credit Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentTransactions?.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="space-y-1">
                      <div className="text-sm">{transaction.description}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(transaction.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount} credits
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Balance: {transaction.balance}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserManagement;

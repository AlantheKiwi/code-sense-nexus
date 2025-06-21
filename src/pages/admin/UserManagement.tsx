
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Minus, Ban, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  updated_at: string;
  created_at?: string;
}

interface UserCredit {
  user_id: string;
  balance: number;
}

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [creditAmount, setCreditAmount] = useState('');
  const [creditReason, setCreditReason] = useState('');
  const [isAddCredit, setIsAddCredit] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('id, email, full_name, avatar_url, updated_at');
      
      if (searchTerm) {
        query = query.or(`email.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`);
      }
      
      const { data, error } = await query.order('updated_at', { ascending: false });
      
      if (error) throw error;
      
      // Convert the data to match UserProfile interface
      return (data || []).map(user => ({
        ...user,
        created_at: user.updated_at // Use updated_at as fallback for created_at
      })) as UserProfile[];
    }
  });

  const { data: userCredits } = useQuery({
    queryKey: ['admin-user-credits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_credits')
        .select('user_id, balance');
      
      if (error) throw error;
      return data as UserCredit[];
    }
  });

  const creditMutation = useMutation({
    mutationFn: async ({ userId, amount, description }: { userId: string; amount: number; description: string }) => {
      const functionName = amount > 0 ? 'add_user_credits' : 'deduct_user_credits';
      const { data, error } = await supabase.rpc(functionName, {
        p_user_id: userId,
        p_amount: Math.abs(amount),
        p_description: description
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User credits updated successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['admin-user-credits'] });
      setSelectedUser(null);
      setCreditAmount('');
      setCreditReason('');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update credits: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const handleCreditUpdate = () => {
    if (!selectedUser || !creditAmount || !creditReason) return;
    
    const amount = parseInt(creditAmount);
    const finalAmount = isAddCredit ? amount : -amount;
    
    creditMutation.mutate({
      userId: selectedUser.id,
      amount: finalAmount,
      description: creditReason
    });
  };

  const getUserCredits = (userId: string) => {
    const userCredit = userCredits?.find(uc => uc.user_id === userId);
    return userCredit?.balance || 0;
  };

  const filteredUsers = users || [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">Manage users, credits, and permissions</p>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          {usersLoading ? (
            <div>Loading users...</div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium">{user.full_name || 'No name'}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                    <div className="text-xs text-muted-foreground">ID: {user.id}</div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <Badge variant="secondary">
                      {getUserCredits(user.id)} credits
                    </Badge>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedUser(user)}
                        >
                          Manage Credits
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Manage Credits for {user.full_name || user.email}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Current Balance</Label>
                            <div className="text-2xl font-bold">{getUserCredits(user.id)} credits</div>
                          </div>
                          
                          <div>
                            <Label>Action</Label>
                            <Select value={isAddCredit ? "add" : "remove"} onValueChange={(value) => setIsAddCredit(value === "add")}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="add">Add Credits</SelectItem>
                                <SelectItem value="remove">Remove Credits</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label>Amount</Label>
                            <Input
                              type="number"
                              value={creditAmount}
                              onChange={(e) => setCreditAmount(e.target.value)}
                              placeholder="Enter amount"
                            />
                          </div>
                          
                          <div>
                            <Label>Reason</Label>
                            <Textarea
                              value={creditReason}
                              onChange={(e) => setCreditReason(e.target.value)}
                              placeholder="Reason for credit adjustment"
                            />
                          </div>
                          
                          <Button 
                            onClick={handleCreditUpdate}
                            disabled={!creditAmount || !creditReason || creditMutation.isPending}
                            className="w-full"
                          >
                            {creditMutation.isPending ? "Processing..." : `${isAddCredit ? "Add" : "Remove"} Credits`}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;

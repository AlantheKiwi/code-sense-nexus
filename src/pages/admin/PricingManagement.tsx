
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Edit, Plus, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PricingItem {
  id: string;
  item_type: string;
  item_name: string;
  price_cents: number;
  credits_included?: number;
  is_active: boolean;
  created_at: string;
}

const PricingManagement = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PricingItem | null>(null);
  const queryClient = useQueryClient();

  const { data: pricingItems, isLoading } = useQuery({
    queryKey: ['admin-pricing'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pricing_config')
        .select('*')
        .order('item_type', { ascending: true });
      
      if (error) throw error;
      return data as PricingItem[];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (item: Omit<PricingItem, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('pricing_config')
        .insert(item)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Pricing item created successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-pricing'] });
      setIsCreateOpen(false);
    },
    onError: (error: any) => {
      toast.error(`Failed to create pricing item: ${error.message}`);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (item: PricingItem) => {
      const { data, error } = await supabase
        .from('pricing_config')
        .update({
          item_name: item.item_name,
          price_cents: item.price_cents,
          credits_included: item.credits_included,
          is_active: item.is_active
        })
        .eq('id', item.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Pricing item updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-pricing'] });
      setEditingItem(null);
    },
    onError: (error: any) => {
      toast.error(`Failed to update pricing item: ${error.message}`);
    }
  });

  const PricingForm = ({ item, onSubmit, onCancel }: {
    item?: PricingItem;
    onSubmit: (data: any) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState({
      item_type: item?.item_type || 'credit_package',
      item_name: item?.item_name || '',
      price_cents: item?.price_cents || 0,
      credits_included: item?.credits_included || 0,
      is_active: item?.is_active ?? true
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Type</Label>
          <Select value={formData.item_type} onValueChange={(value) => setFormData({...formData, item_type: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="credit_package">Credit Package</SelectItem>
              <SelectItem value="llm_analysis">LLM Analysis</SelectItem>
              <SelectItem value="subscription">Subscription</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Name</Label>
          <Input
            value={formData.item_name}
            onChange={(e) => setFormData({...formData, item_name: e.target.value})}
            placeholder="e.g., Professional Pack"
          />
        </div>

        <div>
          <Label>Price (cents)</Label>
          <Input
            type="number"
            value={formData.price_cents}
            onChange={(e) => setFormData({...formData, price_cents: parseInt(e.target.value)})}
            placeholder="2999"
          />
        </div>

        <div>
          <Label>Credits Included</Label>
          <Input
            type="number"
            value={formData.credits_included}
            onChange={(e) => setFormData({...formData, credits_included: parseInt(e.target.value)})}
            placeholder="100"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
          />
          <Label>Active</Label>
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit">{item ? 'Update' : 'Create'}</Button>
        </div>
      </form>
    );
  };

  const groupedItems = pricingItems?.reduce((acc, item) => {
    if (!acc[item.item_type]) acc[item.item_type] = [];
    acc[item.item_type].push(item);
    return acc;
  }, {} as Record<string, PricingItem[]>) || {};

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pricing Management</h1>
          <p className="text-muted-foreground">Manage credit packages, LLM costs, and subscriptions</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Pricing Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Pricing Item</DialogTitle>
            </DialogHeader>
            <PricingForm
              onSubmit={(data) => createMutation.mutate(data)}
              onCancel={() => setIsCreateOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {Object.entries(groupedItems).map(([type, items]) => (
        <Card key={type}>
          <CardHeader>
            <CardTitle className="capitalize flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              {type.replace('_', ' ')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item) => (
                <div key={item.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">{item.item_name}</h3>
                    <Badge variant={item.is_active ? "secondary" : "outline"}>
                      {item.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold">${(item.price_cents / 100).toFixed(2)}</p>
                  {item.credits_included && (
                    <p className="text-sm text-muted-foreground">
                      {item.credits_included} credits included
                    </p>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingItem(item)}
                    className="w-full"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {editingItem && (
        <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Pricing Item</DialogTitle>
            </DialogHeader>
            <PricingForm
              item={editingItem}
              onSubmit={(data) => updateMutation.mutate({...editingItem, ...data})}
              onCancel={() => setEditingItem(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default PricingManagement;

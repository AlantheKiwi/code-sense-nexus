
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Settings, AlertTriangle, Save, Key } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  description: string;
  updated_at: string;
}

const SystemSettings = () => {
  const [editingSettings, setEditingSettings] = useState<Record<string, any>>({});
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin-system-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('setting_key', { ascending: true });
      
      if (error) throw error;
      return data as SystemSetting[];
    }
  });

  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string, value: any }) => {
      const { data, error } = await supabase
        .from('system_settings')
        .update({ 
          setting_value: value,
          updated_at: new Date().toISOString()
        })
        .eq('setting_key', key)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Setting updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-system-settings'] });
      setEditingSettings({});
    },
    onError: (error: any) => {
      toast.error(`Failed to update setting: ${error.message}`);
    }
  });

  const getSetting = (key: string) => settings?.find(s => s.setting_key === key);

  const updateSetting = (key: string, value: any) => {
    setEditingSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSetting = (key: string) => {
    const value = editingSettings[key];
    if (value !== undefined) {
      updateSettingMutation.mutate({ key, value });
    }
  };

  const getSettingValue = (key: string) => {
    if (editingSettings[key] !== undefined) {
      return editingSettings[key];
    }
    const setting = getSetting(key);
    return setting?.setting_value;
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Settings</h1>
        <p className="text-muted-foreground">Configure system-wide settings and feature flags</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Maintenance Mode */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Maintenance Mode
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Enable Maintenance Mode</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={getSettingValue('maintenance_mode') === 'true'}
                  onCheckedChange={(checked) => updateSetting('maintenance_mode', checked ? 'true' : 'false')}
                />
                <Button
                  size="sm"
                  onClick={() => saveSetting('maintenance_mode')}
                  disabled={editingSettings['maintenance_mode'] === undefined}
                >
                  <Save className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              When enabled, users will see a maintenance message and most features will be disabled.
            </p>
          </CardContent>
        </Card>

        {/* Rate Limiting */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Rate Limiting
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Max Analyses per Hour</Label>
              <div className="flex space-x-2">
                <Input
                  type="number"
                  value={getSettingValue('max_analyses_per_hour') || ''}
                  onChange={(e) => updateSetting('max_analyses_per_hour', e.target.value)}
                  placeholder="50"
                />
                <Button
                  size="sm"
                  onClick={() => saveSetting('max_analyses_per_hour')}
                  disabled={editingSettings['max_analyses_per_hour'] === undefined}
                >
                  <Save className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Maximum number of analyses a user can perform per hour.
            </p>
          </CardContent>
        </Card>

        {/* Feature Flags */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Feature Flags
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(() => {
              const featureFlags = getSettingValue('feature_flags') || {};
              const isObject = typeof featureFlags === 'object';
              
              return (
                <div className="space-y-3">
                  {isObject && Object.entries(featureFlags).map(([feature, enabled]) => (
                    <div key={feature} className="flex items-center justify-between">
                      <Label className="capitalize">{feature.replace('_', ' ')}</Label>
                      <Switch
                        checked={enabled as boolean}
                        onCheckedChange={(checked) => {
                          const newFlags = { ...featureFlags, [feature]: checked };
                          updateSetting('feature_flags', newFlags);
                        }}
                      />
                    </div>
                  ))}
                  <Button
                    size="sm"
                    onClick={() => saveSetting('feature_flags')}
                    disabled={editingSettings['feature_flags'] === undefined}
                    className="w-full"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Feature Flags
                  </Button>
                </div>
              );
            })()}
          </CardContent>
        </Card>

        {/* System Message */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              System Message
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Global Message to Users</Label>
              <Textarea
                value={getSettingValue('system_message') || ''}
                onChange={(e) => updateSetting('system_message', e.target.value)}
                placeholder="Enter a message to display to all users..."
                className="min-h-[100px]"
              />
            </div>
            <Button
              size="sm"
              onClick={() => saveSetting('system_message')}
              disabled={editingSettings['system_message'] === undefined}
              className="w-full"
            >
              <Save className="h-4 w-4 mr-2" />
              Update System Message
            </Button>
            <p className="text-sm text-muted-foreground">
              This message will be displayed prominently to all users across the platform.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* API Keys Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Key className="h-5 w-5 mr-2" />
            API Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>OpenAI API Status</Label>
              <Badge variant="secondary">Configured</Badge>
            </div>
            <div className="space-y-2">
              <Label>Supabase Status</Label>
              <Badge variant="secondary">Connected</Badge>
            </div>
            <div className="space-y-2">
              <Label>Snyk Token Status</Label>
              <Badge variant="secondary">Configured</Badge>
            </div>
            <div className="space-y-2">
              <Label>PageSpeed API Status</Label>
              <Badge variant="secondary">Configured</Badge>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            API keys are managed in the Supabase Edge Functions secrets. Contact your system administrator to update them.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemSettings;


import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Settings, Clock, Zap, Shield, Code, Target } from 'lucide-react';

export interface AutomationSettings {
  allAutomatic: boolean;
  smartAnalysis: boolean;
  toolSettings: {
    [toolId: string]: {
      enabled: boolean;
      frequency: 'on-change' | 'daily' | 'weekly' | 'manual';
      lastRun?: string;
    };
  };
  activePreset?: 'development' | 'production' | 'security' | 'custom';
}

interface AutomationControlPanelProps {
  projectId?: string;
  availableTools: string[];
  onSettingsChange: (settings: AutomationSettings) => void;
}

const automationPresets = {
  development: {
    name: 'Development Mode',
    description: 'Frequent analysis with focus on code quality',
    icon: Code,
    settings: {
      eslint: { enabled: true, frequency: 'on-change' as const },
      lighthouse: { enabled: true, frequency: 'daily' as const },
      accessibility: { enabled: true, frequency: 'on-change' as const },
      snyk: { enabled: false, frequency: 'manual' as const },
      sonarqube: { enabled: false, frequency: 'manual' as const },
      'bundle-analyzer': { enabled: true, frequency: 'daily' as const },
    }
  },
  production: {
    name: 'Production Monitoring',
    description: 'Regular monitoring with performance focus',
    icon: Target,
    settings: {
      eslint: { enabled: true, frequency: 'daily' as const },
      lighthouse: { enabled: true, frequency: 'daily' as const },
      accessibility: { enabled: true, frequency: 'weekly' as const },
      snyk: { enabled: true, frequency: 'daily' as const },
      sonarqube: { enabled: true, frequency: 'weekly' as const },
      'bundle-analyzer': { enabled: true, frequency: 'weekly' as const },
    }
  },
  security: {
    name: 'Security Focus',
    description: 'Enhanced security scanning and monitoring',
    icon: Shield,
    settings: {
      eslint: { enabled: true, frequency: 'daily' as const },
      lighthouse: { enabled: false, frequency: 'manual' as const },
      accessibility: { enabled: false, frequency: 'manual' as const },
      snyk: { enabled: true, frequency: 'on-change' as const },
      sonarqube: { enabled: true, frequency: 'daily' as const },
      'bundle-analyzer': { enabled: false, frequency: 'manual' as const },
    }
  }
};

const frequencyLabels = {
  'on-change': 'On Every Change',
  'daily': 'Daily',
  'weekly': 'Weekly',
  'manual': 'Manual Only'
};

const getFrequencyColor = (frequency: string) => {
  switch (frequency) {
    case 'on-change':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'daily':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'weekly':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'manual':
      return 'bg-gray-100 text-gray-600 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-600 border-gray-200';
  }
};

export const AutomationControlPanel = ({ 
  projectId, 
  availableTools, 
  onSettingsChange 
}: AutomationControlPanelProps) => {
  const [settings, setSettings] = useState<AutomationSettings>({
    allAutomatic: false,
    smartAnalysis: true,
    toolSettings: {},
    activePreset: 'development'
  });

  // Initialize tool settings
  useEffect(() => {
    const initialToolSettings = availableTools.reduce((acc, toolId) => {
      acc[toolId] = {
        enabled: false,
        frequency: 'manual' as const,
        lastRun: undefined
      };
      return acc;
    }, {} as AutomationSettings['toolSettings']);

    setSettings(prev => ({
      ...prev,
      toolSettings: { ...initialToolSettings, ...prev.toolSettings }
    }));
  }, [availableTools]);

  const handleSettingsChange = (newSettings: AutomationSettings) => {
    setSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const handleAllAutomaticToggle = (enabled: boolean) => {
    const updatedToolSettings = { ...settings.toolSettings };
    
    availableTools.forEach(toolId => {
      if (updatedToolSettings[toolId]) {
        updatedToolSettings[toolId] = {
          ...updatedToolSettings[toolId],
          enabled,
          frequency: enabled ? 'daily' : 'manual'
        };
      }
    });

    handleSettingsChange({
      ...settings,
      allAutomatic: enabled,
      toolSettings: updatedToolSettings,
      activePreset: enabled ? 'development' : 'custom'
    });
  };

  const handleToolToggle = (toolId: string, enabled: boolean) => {
    const updatedSettings = {
      ...settings,
      toolSettings: {
        ...settings.toolSettings,
        [toolId]: {
          ...settings.toolSettings[toolId],
          enabled,
          frequency: enabled ? 'daily' : 'manual'
        }
      },
      activePreset: 'custom' as const,
      allAutomatic: enabled && Object.values(settings.toolSettings).every(tool => 
        tool.enabled || toolId === Object.keys(settings.toolSettings).find(id => id === toolId)
      )
    };

    handleSettingsChange(updatedSettings);
  };

  const handleFrequencyChange = (toolId: string, frequency: string) => {
    handleSettingsChange({
      ...settings,
      toolSettings: {
        ...settings.toolSettings,
        [toolId]: {
          ...settings.toolSettings[toolId],
          frequency: frequency as any
        }
      },
      activePreset: 'custom'
    });
  };

  const applyPreset = (presetKey: keyof typeof automationPresets) => {
    const preset = automationPresets[presetKey];
    const updatedToolSettings = { ...settings.toolSettings };

    availableTools.forEach(toolId => {
      const presetSetting = preset.settings[toolId as keyof typeof preset.settings];
      if (presetSetting && updatedToolSettings[toolId]) {
        updatedToolSettings[toolId] = {
          ...updatedToolSettings[toolId],
          ...presetSetting
        };
      }
    });

    handleSettingsChange({
      ...settings,
      toolSettings: updatedToolSettings,
      activePreset: presetKey,
      allAutomatic: Object.values(updatedToolSettings).some(tool => tool.enabled)
    });
  };

  const formatLastRun = (lastRun?: string) => {
    if (!lastRun) return 'Never';
    const date = new Date(lastRun);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 168) return `${Math.floor(diffHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Automation Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Master Controls */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Set All to Automatic</h3>
              <p className="text-sm text-gray-600">Enable automation for all available tools</p>
            </div>
            <Switch
              checked={settings.allAutomatic}
              onCheckedChange={handleAllAutomaticToggle}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Smart Analysis
              </h3>
              <p className="text-sm text-gray-600">Automatically select relevant tools based on project type</p>
            </div>
            <Switch
              checked={settings.smartAnalysis}
              onCheckedChange={(enabled) => handleSettingsChange({ ...settings, smartAnalysis: enabled })}
            />
          </div>
        </div>

        <Separator />

        {/* Automation Presets */}
        <div>
          <h3 className="font-medium mb-3">Quick Presets</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {Object.entries(automationPresets).map(([key, preset]) => {
              const IconComponent = preset.icon;
              const isActive = settings.activePreset === key;
              
              return (
                <Button
                  key={key}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => applyPreset(key as keyof typeof automationPresets)}
                  className="h-auto p-3 flex flex-col items-start gap-1"
                >
                  <div className="flex items-center gap-2 w-full">
                    <IconComponent className="h-4 w-4" />
                    <span className="font-medium">{preset.name}</span>
                  </div>
                  <span className="text-xs text-left opacity-80">{preset.description}</span>
                </Button>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Individual Tool Settings */}
        <div>
          <h3 className="font-medium mb-3">Individual Tool Settings</h3>
          <div className="space-y-3">
            {availableTools.map((toolId) => {
              const toolSetting = settings.toolSettings[toolId];
              if (!toolSetting) return null;

              return (
                <div key={toolId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={toolSetting.enabled}
                      onCheckedChange={(enabled) => handleToolToggle(toolId, enabled)}
                    />
                    <div>
                      <h4 className="font-medium capitalize">
                        {toolId.replace('-', ' ')}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-3 w-3" />
                        Last run: {formatLastRun(toolSetting.lastRun)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getFrequencyColor(toolSetting.frequency)}`}
                    >
                      {frequencyLabels[toolSetting.frequency]}
                    </Badge>
                    
                    {toolSetting.enabled && (
                      <Select
                        value={toolSetting.frequency}
                        onValueChange={(value) => handleFrequencyChange(toolId, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="on-change">On Change</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="manual">Manual Only</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Save Settings */}
        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" size="sm">
            Save Automation Preferences
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

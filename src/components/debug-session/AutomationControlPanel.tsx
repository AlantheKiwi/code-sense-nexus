
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Settings } from 'lucide-react';
import { AutomationMasterControls } from './automation/AutomationMasterControls';
import { AutomationPresets, automationPresets } from './automation/AutomationPresets';
import { ToolSettingsList } from './automation/ToolSettingsList';

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
    const allToolsEnabled = enabled && availableTools.every(id => {
      if (id === toolId) return true;
      return settings.toolSettings[id]?.enabled || false;
    });

    const updatedSettings: AutomationSettings = {
      ...settings,
      toolSettings: {
        ...settings.toolSettings,
        [toolId]: {
          ...settings.toolSettings[toolId],
          enabled,
          frequency: enabled ? 'daily' : 'manual'
        }
      },
      activePreset: 'custom',
      allAutomatic: allToolsEnabled
    };

    handleSettingsChange(updatedSettings);
  };

  const handleFrequencyChange = (toolId: string, frequency: string) => {
    const validFrequencies = ['on-change', 'daily', 'weekly', 'manual'] as const;
    if (!validFrequencies.includes(frequency as any)) {
      return;
    }

    handleSettingsChange({
      ...settings,
      toolSettings: {
        ...settings.toolSettings,
        [toolId]: {
          ...settings.toolSettings[toolId],
          frequency: frequency as 'on-change' | 'daily' | 'weekly' | 'manual'
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Automation Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <AutomationMasterControls
          allAutomatic={settings.allAutomatic}
          smartAnalysis={settings.smartAnalysis}
          onAllAutomaticToggle={handleAllAutomaticToggle}
          onSmartAnalysisToggle={(enabled) => handleSettingsChange({ ...settings, smartAnalysis: enabled })}
        />

        <Separator />

        <AutomationPresets
          activePreset={settings.activePreset}
          onApplyPreset={applyPreset}
        />

        <Separator />

        <ToolSettingsList
          availableTools={availableTools}
          toolSettings={settings.toolSettings}
          onToolToggle={handleToolToggle}
          onFrequencyChange={handleFrequencyChange}
        />

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" size="sm">
            Save Automation Preferences
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

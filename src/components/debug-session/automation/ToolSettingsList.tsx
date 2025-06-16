
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock } from 'lucide-react';

interface ToolSetting {
  enabled: boolean;
  frequency: 'on-change' | 'daily' | 'weekly' | 'manual';
  lastRun?: string;
}

interface ToolSettingsListProps {
  availableTools: string[];
  toolSettings: { [toolId: string]: ToolSetting };
  onToolToggle: (toolId: string, enabled: boolean) => void;
  onFrequencyChange: (toolId: string, frequency: string) => void;
}

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

export const ToolSettingsList = ({
  availableTools,
  toolSettings,
  onToolToggle,
  onFrequencyChange
}: ToolSettingsListProps) => (
  <div>
    <h3 className="font-medium mb-3">Individual Tool Settings</h3>
    <div className="space-y-3">
      {availableTools.map((toolId) => {
        const toolSetting = toolSettings[toolId];
        if (!toolSetting) return null;

        return (
          <div key={toolId} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <Switch
                checked={toolSetting.enabled}
                onCheckedChange={(enabled) => onToolToggle(toolId, enabled)}
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
                  onValueChange={(value) => onFrequencyChange(toolId, value)}
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
);

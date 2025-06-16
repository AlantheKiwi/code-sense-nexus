
import { Switch } from '@/components/ui/switch';
import { Zap } from 'lucide-react';

interface AutomationMasterControlsProps {
  allAutomatic: boolean;
  smartAnalysis: boolean;
  onAllAutomaticToggle: (enabled: boolean) => void;
  onSmartAnalysisToggle: (enabled: boolean) => void;
}

export const AutomationMasterControls = ({
  allAutomatic,
  smartAnalysis,
  onAllAutomaticToggle,
  onSmartAnalysisToggle
}: AutomationMasterControlsProps) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="font-medium">Set All to Automatic</h3>
        <p className="text-sm text-gray-600">Enable automation for all available tools</p>
      </div>
      <Switch
        checked={allAutomatic}
        onCheckedChange={onAllAutomaticToggle}
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
        checked={smartAnalysis}
        onCheckedChange={onSmartAnalysisToggle}
      />
    </div>
  </div>
);

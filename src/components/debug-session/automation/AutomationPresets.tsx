
import { Button } from '@/components/ui/button';
import { Code, Target, Shield } from 'lucide-react';

const automationPresets = {
  development: {
    name: 'Development Mode',
    description: 'Frequent analysis for code quality',
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
    description: 'Regular monitoring for performance',
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
    description: 'Enhanced security scanning',
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

interface AutomationPresetsProps {
  activePreset?: string;
  onApplyPreset: (presetKey: keyof typeof automationPresets) => void;
}

export const AutomationPresets = ({ activePreset, onApplyPreset }: AutomationPresetsProps) => (
  <div>
    <h3 className="font-medium mb-3">Quick Presets</h3>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
      {Object.entries(automationPresets).map(([key, preset]) => {
        const IconComponent = preset.icon;
        const isActive = activePreset === key;
        
        return (
          <Button
            key={key}
            variant={isActive ? "default" : "outline"}
            onClick={() => onApplyPreset(key as keyof typeof automationPresets)}
            className="h-16 p-3 flex flex-col items-start justify-center gap-1 text-left whitespace-normal min-w-0"
          >
            <div className="flex items-center gap-2 w-full min-w-0">
              <IconComponent className="h-4 w-4 flex-shrink-0" />
              <span className="font-medium text-sm truncate">{preset.name}</span>
            </div>
            <span className="text-xs opacity-80 leading-tight line-clamp-2 w-full text-left">
              {preset.description}
            </span>
          </Button>
        );
      })}
    </div>
  </div>
);

export { automationPresets };

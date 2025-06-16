
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ToolConfig } from './types';

interface ToolItemProps {
  tool: ToolConfig;
  isSelected: boolean;
  isDisabled: boolean;
  onToggle: (toolId: string) => void;
}

const getStatusColor = (status: ToolConfig['status']) => {
  switch (status) {
    case 'available':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'running':
      return 'bg-blue-100 text-blue-800 border-blue-200 animate-pulse';
    case 'completed':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'error':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'disabled':
      return 'bg-gray-100 text-gray-600 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-600 border-gray-200';
  }
};

export const ToolItem = ({ tool, isSelected, isDisabled, onToggle }: ToolItemProps) => {
  const IconComponent = tool.icon;
  
  return (
    <div
      className={`relative p-4 border rounded-lg transition-all duration-200 ${
        isSelected && !isDisabled
          ? 'border-blue-300 bg-blue-50'
          : isDisabled
          ? 'border-gray-200 bg-gray-50 opacity-60'
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <IconComponent className="h-6 w-6 mt-1 text-gray-600" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-gray-900">{tool.name}</h4>
              <Badge 
                variant="outline" 
                className={`text-xs ${getStatusColor(tool.status)}`}
              >
                {tool.status}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              {tool.description}
            </p>
            <div className="text-xs text-gray-500">
              Est. time: {tool.estimatedTime}
            </div>
          </div>
        </div>
        <Switch
          checked={isSelected}
          onCheckedChange={() => onToggle(tool.id)}
          disabled={isDisabled}
          className="ml-2"
        />
      </div>
    </div>
  );
};

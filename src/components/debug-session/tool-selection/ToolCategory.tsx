
import { Separator } from '@/components/ui/separator';
import { ToolItem } from './ToolItem';
import { ToolConfig } from './types';
import { categoryLabels } from './toolConfig';

interface ToolCategoryProps {
  category: keyof typeof categoryLabels;
  tools: ToolConfig[];
  selectedTools: string[];
  isAnalyzing: boolean;
  onToolToggle: (toolId: string) => void;
}

export const ToolCategory = ({ 
  category, 
  tools, 
  selectedTools, 
  isAnalyzing, 
  onToolToggle 
}: ToolCategoryProps) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3 text-gray-800">
        {categoryLabels[category]}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tools.map((tool) => {
          const isSelected = selectedTools.includes(tool.id);
          const isDisabled = tool.status === 'disabled' || isAnalyzing;
          
          return (
            <ToolItem
              key={tool.id}
              tool={tool}
              isSelected={isSelected}
              isDisabled={isDisabled}
              onToggle={onToolToggle}
            />
          );
        })}
      </div>
      <Separator className="mt-4" />
    </div>
  );
};

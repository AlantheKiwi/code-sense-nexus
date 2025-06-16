
import { Button } from '@/components/ui/button';

interface ToolSelectionActionsProps {
  selectedTools: string[];
  isAnalyzing: boolean;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onAnalyze: () => void;
  calculateTotalTime: () => string;
}

export const ToolSelectionActions = ({
  selectedTools,
  isAnalyzing,
  onSelectAll,
  onDeselectAll,
  onAnalyze,
  calculateTotalTime
}: ToolSelectionActionsProps) => {
  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onSelectAll}
          disabled={isAnalyzing}
        >
          Select All
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onDeselectAll}
          disabled={isAnalyzing}
        >
          Deselect All
        </Button>
      </div>
      
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="text-sm text-gray-600">
          {selectedTools.length > 0 && (
            <>
              {selectedTools.length} tool{selectedTools.length !== 1 ? 's' : ''} selected
              {' • '}
              Est. total time: {calculateTotalTime()}
            </>
          )}
        </div>
        <Button
          onClick={onAnalyze}
          disabled={selectedTools.length === 0 || isAnalyzing}
          className="min-w-[140px]"
        >
          {isAnalyzing ? 'Analyzing...' : `Analyze with ${selectedTools.length} tool${selectedTools.length !== 1 ? 's' : ''}`}
        </Button>
      </div>
    </>
  );
};


import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Play, Clock } from 'lucide-react';

interface DemoControlsProps {
  currentStep: number;
  totalSteps: number;
  readingTime: string;
  onStartDemo: () => void;
  onPrevStep: () => void;
  onNextStep: () => void;
}

export const DemoControls: React.FC<DemoControlsProps> = ({
  currentStep,
  totalSteps,
  readingTime,
  onStartDemo,
  onPrevStep,
  onNextStep
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
      <div className="flex items-center gap-4">
        <Button 
          onClick={onStartDemo}
          className="flex items-center gap-2"
        >
          <Play className="h-4 w-4" />
          Start Demo
        </Button>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{readingTime}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onPrevStep}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onNextStep}
          disabled={currentStep === totalSteps - 1}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

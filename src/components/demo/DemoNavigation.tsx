
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DemoNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevStep: () => void;
  onNextStep: () => void;
}

export const DemoNavigation: React.FC<DemoNavigationProps> = ({
  currentStep,
  totalSteps,
  onPrevStep,
  onNextStep
}) => {
  return (
    <div className="mt-8 flex justify-between items-center">
      <Button 
        variant="outline" 
        onClick={onPrevStep}
        disabled={currentStep === 0}
        className="flex items-center gap-2"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous Step
      </Button>
      
      {currentStep === totalSteps - 1 ? (
        <Button size="lg" className="bg-brand hover:bg-brand/90">
          Get Started Free
        </Button>
      ) : (
        <Button 
          onClick={onNextStep}
          className="flex items-center gap-2"
        >
          Next Step
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

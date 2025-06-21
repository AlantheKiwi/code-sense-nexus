
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface DemoProgressProps {
  currentStep: number;
  totalSteps: number;
  onGoToStep: (stepIndex: number) => void;
}

export const DemoProgress: React.FC<DemoProgressProps> = ({
  currentStep,
  totalSteps,
  onGoToStep
}) => {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <>
      {/* Step Indicators */}
      <div className="flex justify-center mb-6">
        <div className="flex gap-2">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <button
              key={index}
              onClick={() => onGoToStep(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentStep 
                  ? 'bg-brand' 
                  : index < currentStep 
                    ? 'bg-brand/60' 
                    : 'bg-gray-300'
              }`}
              aria-label={`Go to step ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Step {currentStep + 1} of {totalSteps}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
    </>
  );
};

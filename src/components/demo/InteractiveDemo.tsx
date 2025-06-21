
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DemoStep } from './DemoStep';
import { DemoNavigation } from './DemoNavigation';
import { DemoProgress } from './DemoProgress';
import { DemoControls } from './DemoControls';
import { demoSteps } from './DemoData';

export const InteractiveDemo: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < demoSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  const startDemo = () => {
    setCurrentStep(0);
  };

  const step = demoSteps[currentStep];

  return (
    <div className="w-full max-w-6xl mx-auto">
      <DemoControls
        currentStep={currentStep}
        totalSteps={demoSteps.length}
        readingTime={step.readingTime}
        onStartDemo={startDemo}
        onPrevStep={prevStep}
        onNextStep={nextStep}
      />

      <DemoProgress
        currentStep={currentStep}
        totalSteps={demoSteps.length}
        onGoToStep={goToStep}
      />

      {/* User Guidance */}
      <div className="text-center mb-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700">
          📖 Take your time reading each step. Use the Previous/Next buttons or click the dots above to navigate at your own pace.
        </p>
      </div>

      <DemoStep step={step} />

      <DemoNavigation
        currentStep={currentStep}
        totalSteps={demoSteps.length}
        onPrevStep={prevStep}
        onNextStep={nextStep}
      />

      {/* Call to Action */}
      {currentStep === demoSteps.length - 1 && (
        <div className="mt-8 text-center">
          <Card className="p-6 bg-brand-light">
            <h3 className="text-xl font-bold mb-2">Ready to optimize your Lovable projects?</h3>
            <p className="text-muted-foreground mb-4">Start debugging smarter, not harder</p>
            <Button size="lg" className="bg-brand hover:bg-brand/90">
              Get Started Free
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
};

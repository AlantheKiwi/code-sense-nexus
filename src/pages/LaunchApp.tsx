
import React, { useState } from 'react';
import { TypeScriptFixerHeader } from '@/components/launch/TypeScriptFixerHeader';
import { FixingProgress } from '@/components/launch/FixingProgress';
import { ResultsSection } from '@/components/launch/ResultsSection';
import { PricingSection } from '@/components/launch/PricingSection';
import { CodeDiffDialog } from '@/components/diff/CodeDiffDialog';
import { TypeScriptFixer } from '@/services/typescript/TypeScriptFixer';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { GitHubFile } from '@/services/github/GitHubConnector';
import { toast } from 'sonner';
import { WhyItWorks } from '@/components/confidence/WhyItWorks';
import { FAQ } from '@/components/confidence/FAQ';

interface FixResult {
  originalCode: string;
  fixedCode: string;
  errorsFixed: number;
  description: string[];
}

interface MultiFileResult {
  files: Array<{
    path: string;
    originalCode: string;
    fixedCode: string;
    errorsFixed: number;
    description: string[];
  }>;
  totalErrorsFixed: number;
}

const LaunchApp = () => {
  const [isFixing, setIsFixing] = useState(false);
  const [singleResult, setSingleResult] = useState<FixResult | null>(null);
  const [multiResult, setMultiResult] = useState<MultiFileResult | null>(null);
  const [step, setStep] = useState<'input' | 'fixing' | 'results'>('input');
  const [diffDialogOpen, setDiffDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<MultiFileResult['files'][0] | null>(null);
  const { incrementUsage, checkUsageLimit } = useUsageTracking();

  const handleFilesDetected = async (files: GitHubFile[]) => {
    // Check usage limit
    const usageCheck = await checkUsageLimit('basic');
    if (!usageCheck.allowed) {
      toast.error('Daily limit reached. Upgrade to continue fixing TypeScript errors.');
      return;
    }

    setIsFixing(true);
    setStep('fixing');

    try {
      const fixer = new TypeScriptFixer();
      const results = [];
      let totalErrors = 0;

      for (const file of files) {
        const fixResult = await fixer.fixTypeScriptErrors(file.content);
        results.push({
          path: file.path,
          originalCode: fixResult.originalCode,
          fixedCode: fixResult.fixedCode,
          errorsFixed: fixResult.errorsFixed,
          description: fixResult.description
        });
        totalErrors += fixResult.errorsFixed;
      }

      setMultiResult({
        files: results,
        totalErrorsFixed: totalErrors
      });
      
      setStep('results');
      await incrementUsage('basic');
      toast.success(`Fixed ${totalErrors} TypeScript errors across ${files.length} files!`);
    } catch (error) {
      console.error('TypeScript fixing error:', error);
      toast.error('Failed to fix TypeScript errors. Please try again.');
      setStep('input');
    } finally {
      setIsFixing(false);
    }
  };

  const handleSingleCodeInput = async (code: string) => {
    // Check usage limit
    const usageCheck = await checkUsageLimit('basic');
    if (!usageCheck.allowed) {
      toast.error('Daily limit reached. Upgrade to continue fixing TypeScript errors.');
      return;
    }

    setIsFixing(true);
    setStep('fixing');

    try {
      const fixer = new TypeScriptFixer();
      const fixResult = await fixer.fixTypeScriptErrors(code);
      
      if (fixResult.errorsFixed > 0) {
        setSingleResult(fixResult);
        setStep('results');
        await incrementUsage('basic');
        toast.success(`Fixed ${fixResult.errorsFixed} TypeScript errors!`);
      } else {
        toast.success('No TypeScript errors found - your code is ready to deploy!');
        setStep('input');
      }
    } catch (error) {
      console.error('TypeScript fixing error:', error);
      toast.error('Failed to fix TypeScript errors. Please try again.');
      setStep('input');
    } finally {
      setIsFixing(false);
    }
  };

  const handleStartOver = () => {
    setSingleResult(null);
    setMultiResult(null);
    setStep('input');
  };

  const openDiffDialog = (file: MultiFileResult['files'][0]) => {
    setSelectedFile(file);
    setDiffDialogOpen(true);
  };

  const closeDiffDialog = () => {
    setDiffDialogOpen(false);
    setSelectedFile(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 max-w-5xl py-8">
        {step === 'input' && (
          <>
            <TypeScriptFixerHeader
              onFilesDetected={handleFilesDetected}
              onSingleCodeInput={handleSingleCodeInput}
            />

            {/* Why It Works Section */}
            <div className="mb-16">
              <WhyItWorks />
            </div>

            {/* FAQ Section */}
            <div className="mb-16">
              <FAQ />
            </div>
          </>
        )}

        {step === 'fixing' && <FixingProgress />}

        {step === 'results' && (singleResult || multiResult) && (
          <div className="space-y-6">
            <ResultsSection
              singleResult={singleResult}
              multiResult={multiResult}
              onStartOver={handleStartOver}
              onOpenDiffDialog={openDiffDialog}
            />
          </div>
        )}

        <PricingSection />

        <CodeDiffDialog
          isOpen={diffDialogOpen}
          onClose={closeDiffDialog}
          file={selectedFile}
        />
      </div>
    </div>
  );
};

export default LaunchApp;

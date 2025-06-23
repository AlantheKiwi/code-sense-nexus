
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Rocket, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { SeamlessFileInput } from '@/components/input/SeamlessFileInput';
import { SimpleResults } from '@/components/simple/SimpleResults';
import { SimpleProgress } from '@/components/simple/SimpleProgress';
import { TypeScriptFixer } from '@/services/typescript/TypeScriptFixer';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { GitHubFile } from '@/services/github/GitHubConnector';
import { toast } from 'sonner';

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

  const downloadAllFiles = () => {
    if (!multiResult) return;

    multiResult.files.forEach(file => {
      const blob = new Blob([file.fixedCode], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.path;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });

    toast.success('All fixed files downloaded!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Zap className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">TypeScript Fixer</h1>
          </div>
          <p className="text-xl text-gray-600 mb-2">
            Fix TypeScript errors automatically - No coding knowledge required
          </p>
          <p className="text-lg text-blue-600 font-medium">
            Get your Lovable project ready to launch in seconds
          </p>
        </div>

        {/* Main Content */}
        {step === 'input' && (
          <Card className="mb-8">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                <AlertCircle className="h-6 w-6 text-orange-500" />
                Connect Your Lovable Project
              </CardTitle>
              <p className="text-gray-600">
                Choose the easiest way to import your TypeScript files
              </p>
            </CardHeader>
            <CardContent>
              <SeamlessFileInput
                onFilesDetected={handleFilesDetected}
                onSingleCodeInput={handleSingleCodeInput}
              />
            </CardContent>
          </Card>
        )}

        {step === 'fixing' && (
          <SimpleProgress />
        )}

        {step === 'results' && (singleResult || multiResult) && (
          <div className="space-y-6">
            <Card className="border-green-200 bg-green-50">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl flex items-center justify-center gap-2 text-green-800">
                  <CheckCircle className="h-6 w-6" />
                  Success! Fixed {singleResult?.errorsFixed || multiResult?.totalErrorsFixed} Errors
                  {multiResult && ` Across ${multiResult.files.length} Files`}
                </CardTitle>
                <p className="text-green-700">
                  Your TypeScript code is now ready to deploy
                </p>
              </CardHeader>
            </Card>

            {singleResult && <SimpleResults result={singleResult} />}

            {multiResult && (
              <Card>
                <CardHeader>
                  <CardTitle>Fixed Files Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {multiResult.files.map((file, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium font-mono text-sm">{file.path}</h4>
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            {file.errorsFixed} errors fixed
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          {file.description.map((desc, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              {desc}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-4 justify-center">
              <Button
                onClick={handleStartOver}
                variant="outline"
                size="lg"
                className="px-8"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Fix More Files
              </Button>
              {multiResult && (
                <Button
                  onClick={downloadAllFiles}
                  variant="outline"
                  size="lg"
                  className="px-8"
                >
                  Download All Fixed Files
                </Button>
              )}
              <Button
                onClick={() => window.open('https://lovable.app', '_blank')}
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white px-8"
              >
                <Rocket className="h-5 w-5 mr-2" />
                Deploy Now in Lovable
              </Button>
            </div>

            {/* Instructions for copying back to Lovable */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-800">How to Apply These Fixes</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal list-inside space-y-2 text-blue-700">
                  <li>Download the fixed files using the button above</li>
                  <li>Open your Lovable project and enable Dev Mode</li>
                  <li>Replace the original files with the fixed versions</li>
                  <li>Your project should now deploy without TypeScript errors!</li>
                </ol>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Pricing Info */}
        <Card className="mt-12 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Launch Special: 50% Off First Year!
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h4 className="text-lg font-semibold mb-2">Free Tier</h4>
                <p className="text-3xl font-bold text-blue-600 mb-2">$0</p>
                <p className="text-gray-600 mb-4">3 fixes per day</p>
                <p className="text-sm text-gray-500">Perfect for trying out the tool</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm border-2 border-purple-200">
                <div className="bg-purple-100 text-purple-800 text-xs font-semibold px-2 py-1 rounded-full inline-block mb-2">
                  EARLY ADOPTER
                </div>
                <h4 className="text-lg font-semibold mb-2">Premium</h4>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-lg text-gray-400 line-through">$19</span>
                  <span className="text-3xl font-bold text-purple-600">$9.50</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="text-gray-600 mb-4">Unlimited TypeScript fixes</p>
                <p className="text-sm text-gray-500">50% off first year - Limited time!</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LaunchApp;


import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Rocket, CheckCircle, AlertCircle } from 'lucide-react';
import { SimpleUpload } from '@/components/simple/SimpleUpload';
import { SimpleResults } from '@/components/simple/SimpleResults';
import { SimpleProgress } from '@/components/simple/SimpleProgress';
import { TypeScriptFixer } from '@/services/typescript/TypeScriptFixer';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { toast } from 'sonner';

interface FixResult {
  originalCode: string;
  fixedCode: string;
  errorsFixed: number;
  description: string[];
}

const LaunchApp = () => {
  const [code, setCode] = useState('');
  const [isFixing, setIsFixing] = useState(false);
  const [result, setResult] = useState<FixResult | null>(null);
  const [step, setStep] = useState<'upload' | 'fixing' | 'results'>('upload');
  const { incrementUsage, checkUsageLimit } = useUsageTracking();

  const handleFixTypeScript = async () => {
    if (!code.trim()) {
      toast.error('Please upload or paste your TypeScript code first');
      return;
    }

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
        setResult(fixResult);
        setStep('results');
        await incrementUsage('basic');
        toast.success(`Fixed ${fixResult.errorsFixed} TypeScript errors!`);
      } else {
        toast.success('No TypeScript errors found - your code is ready to deploy!');
        setStep('upload');
      }
    } catch (error) {
      console.error('TypeScript fixing error:', error);
      toast.error('Failed to fix TypeScript errors. Please try again.');
      setStep('upload');
    } finally {
      setIsFixing(false);
    }
  };

  const handleStartOver = () => {
    setCode('');
    setResult(null);
    setStep('upload');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
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
        {step === 'upload' && (
          <Card className="mb-8">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                <AlertCircle className="h-6 w-6 text-orange-500" />
                Upload Your TypeScript Code
              </CardTitle>
              <p className="text-gray-600">
                Paste your code or upload files with TypeScript errors
              </p>
            </CardHeader>
            <CardContent>
              <SimpleUpload
                code={code}
                onCodeChange={setCode}
                onFileUpload={setCode}
              />
              
              <div className="mt-8 text-center">
                <Button
                  onClick={handleFixTypeScript}
                  disabled={!code.trim() || isFixing}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 text-xl font-semibold rounded-lg shadow-lg"
                >
                  <Zap className="h-6 w-6 mr-2" />
                  Fix My TypeScript Errors
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'fixing' && (
          <SimpleProgress />
        )}

        {step === 'results' && result && (
          <div className="space-y-6">
            <Card className="border-green-200 bg-green-50">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl flex items-center justify-center gap-2 text-green-800">
                  <CheckCircle className="h-6 w-6" />
                  Success! Fixed {result.errorsFixed} Errors
                </CardTitle>
                <p className="text-green-700">
                  Your TypeScript code is now ready to deploy
                </p>
              </CardHeader>
            </Card>

            <SimpleResults result={result} />

            <div className="flex gap-4 justify-center">
              <Button
                onClick={handleStartOver}
                variant="outline"
                size="lg"
                className="px-8"
              >
                Fix Another File
              </Button>
              <Button
                onClick={() => window.open('https://lovable.app', '_blank')}
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white px-8"
              >
                <Rocket className="h-5 w-5 mr-2" />
                Deploy Now in Lovable
              </Button>
            </div>
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

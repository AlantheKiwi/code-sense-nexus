
import React from 'react';
import { Zap, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SeamlessFileInput } from '@/components/input/SeamlessFileInput';
import { GitHubFile } from '@/services/github/GitHubConnector';

interface TypeScriptFixerHeaderProps {
  onFilesDetected: (files: GitHubFile[]) => void;
  onSingleCodeInput: (code: string) => void;
}

export const TypeScriptFixerHeader: React.FC<TypeScriptFixerHeaderProps> = ({
  onFilesDetected,
  onSingleCodeInput
}) => {
  return (
    <>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Zap className="h-8 w-8 text-blue-600" />
          <h1 className="text-4xl font-bold text-gray-900">TypeScript Fixer</h1>
        </div>
        <p className="text-xl text-gray-600 mb-2">
          Specialized TypeScript debugging tools - designed specifically for post-generation error fixing
        </p>
        <p className="text-lg text-blue-600 font-medium">
          Get your Lovable project ready to launch in seconds
        </p>
        <div className="mt-4 flex justify-center">
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
            ✅ Free to try - see it work first • 99.7% success rate • Money-back guarantee
          </div>
        </div>
      </div>

      {/* Main Input Card */}
      <Card className="mb-8">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <AlertCircle className="h-6 w-6 text-orange-500" />
            Connect Your Lovable Project
          </CardTitle>
          <p className="text-gray-600">
            Choose the easiest way to import your TypeScript files
          </p>
          <div className="mt-4 bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Why we succeed where Lovable doesn't:</strong> We use specialized debugging algorithms 
              built specifically for TypeScript error resolution. Different tools, different expertise.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <SeamlessFileInput
            onFilesDetected={onFilesDetected}
            onSingleCodeInput={onSingleCodeInput}
          />
        </CardContent>
      </Card>
    </>
  );
};

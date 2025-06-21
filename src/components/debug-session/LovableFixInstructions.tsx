
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Copy, 
  CheckCircle, 
  ArrowRight, 
  Code, 
  MessageSquare,
  FileText,
  Lightbulb
} from 'lucide-react';
import { LovableFixInstruction } from '@/services/LovableCodeFixer';

interface LovableFixInstructionsProps {
  instructions: LovableFixInstruction[];
  copyableCode: string;
  lovablePrompt: string;
  issueTitle: string;
}

export const LovableFixInstructions: React.FC<LovableFixInstructionsProps> = ({
  instructions,
  copyableCode,
  lovablePrompt,
  issueTitle
}) => {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(type);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium text-purple-700 mb-2">
        Fix Instructions for: {issueTitle}
      </div>

      {/* Quick Lovable Prompt */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2 text-green-800">
            <MessageSquare className="h-4 w-4" />
            Quick Fix: Ask Lovable
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-green-700 italic">
            "{lovablePrompt}"
          </p>
          <Button
            size="sm"
            onClick={() => handleCopy(lovablePrompt, 'prompt')}
            className="bg-green-600 hover:bg-green-700"
          >
            {copiedItem === 'prompt' ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-3 w-3 mr-1" />
                Copy Prompt for Lovable
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Step-by-Step Instructions */}
      {instructions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Step-by-Step Instructions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {instructions.map((instruction, index) => (
              <div key={index} className="border-l-2 border-blue-200 pl-3">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs">
                    Step {instruction.step}
                  </Badge>
                  <span className="text-sm font-medium">{instruction.action}</span>
                </div>
                
                <p className="text-xs text-gray-600 mb-2">
                  Location: {instruction.fileLocation}
                  {instruction.lineNumber && ` (around line ${instruction.lineNumber})`}
                </p>

                {instruction.codeToAdd && (
                  <div className="bg-gray-50 p-2 rounded text-xs font-mono mb-2">
                    {instruction.codeToReplace && (
                      <div className="text-red-600 mb-1">
                        - {instruction.codeToReplace}
                      </div>
                    )}
                    <div className="text-green-600">
                      + {instruction.codeToAdd}
                    </div>
                  </div>
                )}

                <div className="text-xs text-blue-600 italic">
                  💡 Ask Lovable: "{instruction.lovablePrompt}"
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Copy-Paste Ready Code */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2 text-blue-800">
            <Code className="h-4 w-4" />
            Ready-to-Copy Code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
            <code>{copyableCode}</code>
          </pre>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleCopy(copyableCode, 'code')}
            className="border-blue-300 text-blue-700"
          >
            {copiedItem === 'code' ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-3 w-3 mr-1" />
                Copy Code
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Success Tips */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-2">
            <Lightbulb className="h-4 w-4 text-yellow-600 mt-0.5" />
            <div className="text-xs text-yellow-700">
              <strong>Pro Tip:</strong> After applying this fix, run the health check again to see your improvement score and get suggestions for the next enhancement!
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

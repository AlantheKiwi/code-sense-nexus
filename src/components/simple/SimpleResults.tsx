
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface FixResult {
  originalCode: string;
  fixedCode: string;
  errorsFixed: number;
  description: string[];
}

interface SimpleResultsProps {
  result: FixResult;
}

export const SimpleResults: React.FC<SimpleResultsProps> = ({ result }) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [showFullCode, setShowFullCode] = useState(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(result.fixedCode);
      setCopiedCode(true);
      toast.success('Fixed code copied to clipboard!');
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (error) {
      toast.error('Failed to copy code');
    }
  };

  const formatCodePreview = (code: string, maxLines: number = 10) => {
    const lines = code.split('\n');
    if (lines.length <= maxLines) return code;
    return lines.slice(0, maxLines).join('\n') + '\n\n// ... and more';
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800">Fixes Applied</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {result.description.map((desc, index) => (
              <div key={index} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-green-700">{desc}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Code Comparison */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Your Fixed Code</CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowFullCode(!showFullCode)}
              variant="outline"
              size="sm"
            >
              {showFullCode ? (
                <>
                  <EyeOff className="h-4 w-4 mr-1" />
                  Show Preview
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-1" />
                  Show Full Code
                </>
              )}
            </Button>
            <Button
              onClick={handleCopyCode}
              variant="outline"
              size="sm"
              className={copiedCode ? 'bg-green-50 border-green-200' : ''}
            >
              {copiedCode ? (
                <>
                  <Check className="h-4 w-4 mr-1 text-green-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy Fixed Code
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="fixed" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="fixed" className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                  Fixed
                </Badge>
                New Code
              </TabsTrigger>
              <TabsTrigger value="original" className="flex items-center gap-2">
                <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                  Original
                </Badge>
                Old Code
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="fixed" className="mt-4">
              <div className="bg-gray-50 rounded-lg p-4 border">
                <pre className="text-sm font-mono whitespace-pre-wrap overflow-x-auto">
                  <code>
                    {showFullCode ? result.fixedCode : formatCodePreview(result.fixedCode)}
                  </code>
                </pre>
              </div>
            </TabsContent>
            
            <TabsContent value="original" className="mt-4">
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <pre className="text-sm font-mono whitespace-pre-wrap overflow-x-auto">
                  <code>
                    {showFullCode ? result.originalCode : formatCodePreview(result.originalCode)}
                  </code>
                </pre>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-blue-700">
            <li>Copy the fixed code above</li>
            <li>Replace your original code in Lovable</li>
            <li>Your project should now deploy without TypeScript errors!</li>
            <li>Test your app to make sure everything still works</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

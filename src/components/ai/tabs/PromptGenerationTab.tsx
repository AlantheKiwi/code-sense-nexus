
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Code, Loader2, Crown, Copy, CheckCircle } from 'lucide-react';

interface PromptGenerationTabProps {
  isAnalyzing: boolean;
  analysis: any;
  copiedPrompt: string | null;
  canUseFeature: (feature: string) => boolean;
  onGeneratePrompts: () => void;
  onCopyPrompt: (prompt: string) => void;
}

export const PromptGenerationTab: React.FC<PromptGenerationTabProps> = ({
  isAnalyzing,
  analysis,
  copiedPrompt,
  canUseFeature,
  onGeneratePrompts,
  onCopyPrompt
}) => {
  return (
    <div className="space-y-3">
      <Button
        onClick={onGeneratePrompts}
        disabled={isAnalyzing || !canUseFeature('prompt-generation')}
        className="w-full bg-purple-600 hover:bg-purple-700"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Code className="h-4 w-4 mr-2" />
            Generate Perfect Prompts
          </>
        )}
      </Button>

      {!canUseFeature('prompt-generation') && (
        <Alert className="border-orange-200 bg-orange-50">
          <Crown className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-700">
            Upgrade to Premium for AI-generated Lovable prompts
          </AlertDescription>
        </Alert>
      )}

      {analysis?.lovablePrompts && (
        <div className="space-y-3">
          <h4 className="font-medium text-purple-800">Perfect Lovable Prompts</h4>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {analysis.lovablePrompts.map((prompt: string, index: number) => (
              <Card key={index} className="p-3 border border-purple-200 hover:border-purple-300 transition-colors">
                <CardContent className="p-0">
                  <div className="space-y-2">
                    <p className="text-sm">{prompt}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onCopyPrompt(prompt)}
                      className="w-full text-xs"
                    >
                      {copiedPrompt === prompt ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3 mr-1" />
                          Copy for Lovable
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

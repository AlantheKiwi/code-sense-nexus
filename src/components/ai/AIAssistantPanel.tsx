
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Crown } from 'lucide-react';
import { SmartAnalysisTab } from './tabs/SmartAnalysisTab';
import { PromptGenerationTab } from './tabs/PromptGenerationTab';
import { ChatInterfaceTab } from './tabs/ChatInterfaceTab';
import { CodeReviewTab } from './tabs/CodeReviewTab';
import { useAIAssistant } from '@/hooks/useAIAssistant';

interface AIAssistantPanelProps {
  code: string;
  filePath?: string;
  projectType?: 'lovable' | 'react' | 'typescript';
  userTier?: 'free' | 'premium' | 'enterprise';
  onApplyPrompt?: (prompt: string) => void;
}

export const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({
  code,
  filePath,
  projectType = 'react',
  userTier = 'free',
  onApplyPrompt
}) => {
  const {
    activeTab,
    setActiveTab,
    isAnalyzing,
    analysis,
    chatMessage,
    setChatMessage,
    chatHistory,
    copiedPrompt,
    handleSmartAnalysis,
    handleGenerateLovablePrompts,
    handleChatMessage,
    handleCopyPrompt
  } = useAIAssistant(code);

  const canUseFeature = (feature: string) => {
    if (userTier === 'enterprise') return true;
    if (userTier === 'premium') return feature !== 'architecture-advisor';
    return feature === 'basic-analysis';
  };

  const handleCopyPromptWithApply = (prompt: string) => {
    handleCopyPrompt(prompt);
    onApplyPrompt?.(prompt);
  };

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Brain className="h-5 w-5" />
          CodeSense AI Assistant
          {userTier !== 'free' && <Crown className="h-4 w-4 text-gold-500" />}
        </CardTitle>
        <p className="text-sm text-blue-600">
          Powered by advanced AI for intelligent code analysis and optimization
        </p>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="smart">Smart Analysis</TabsTrigger>
            <TabsTrigger value="prompts">Lovable Prompts</TabsTrigger>
            <TabsTrigger value="chat">Ask AI</TabsTrigger>
            <TabsTrigger value="review">Code Review</TabsTrigger>
          </TabsList>

          <TabsContent value="smart" className="space-y-4">
            <SmartAnalysisTab
              isAnalyzing={isAnalyzing}
              analysis={analysis}
              onAnalyze={handleSmartAnalysis}
            />
          </TabsContent>

          <TabsContent value="prompts" className="space-y-4">
            <PromptGenerationTab
              isAnalyzing={isAnalyzing}
              analysis={analysis}
              copiedPrompt={copiedPrompt}
              canUseFeature={canUseFeature}
              onGeneratePrompts={handleGenerateLovablePrompts}
              onCopyPrompt={handleCopyPromptWithApply}
            />
          </TabsContent>

          <TabsContent value="chat" className="space-y-4">
            <ChatInterfaceTab
              chatMessage={chatMessage}
              chatHistory={chatHistory}
              canUseFeature={canUseFeature}
              onChatMessageChange={setChatMessage}
              onSendMessage={handleChatMessage}
            />
          </TabsContent>

          <TabsContent value="review" className="space-y-4">
            <CodeReviewTab
              canUseFeature={canUseFeature}
              onStartReview={handleSmartAnalysis}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

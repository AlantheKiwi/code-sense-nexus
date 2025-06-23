
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Crown } from 'lucide-react';
import { SmartAnalysisTab } from './tabs/SmartAnalysisTab';
import { PromptGenerationTab } from './tabs/PromptGenerationTab';
import { ChatInterfaceTab } from './tabs/ChatInterfaceTab';
import { CodeReviewTab } from './tabs/CodeReviewTab';
import { useAIAssistant } from '@/hooks/useAIAssistant';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
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
      <CardHeader className={isMobile ? 'pb-3' : undefined}>
        <CardTitle className={`flex items-center gap-2 text-blue-800 ${isMobile ? 'text-lg' : ''}`}>
          <Brain className="h-5 w-5" />
          CodeSense AI Assistant
          {userTier !== 'free' && <Crown className="h-4 w-4 text-gold-500" />}
        </CardTitle>
        <p className={`text-blue-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>
          Powered by advanced AI for intelligent code analysis and optimization
        </p>
      </CardHeader>
      <CardContent className={isMobile ? 'px-3' : undefined}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className={`grid w-full ${isMobile ? 'grid-cols-2 h-20' : 'grid-cols-4'}`}>
            <TabsTrigger 
              value="smart" 
              className={isMobile ? 'text-xs flex-col gap-1 py-2' : ''}
            >
              <span>Smart Analysis</span>
            </TabsTrigger>
            <TabsTrigger 
              value="prompts"
              className={isMobile ? 'text-xs flex-col gap-1 py-2' : ''}
            >
              <span>Lovable Prompts</span>
            </TabsTrigger>
            {!isMobile && (
              <>
                <TabsTrigger value="chat">Ask AI</TabsTrigger>
                <TabsTrigger value="review">Code Review</TabsTrigger>
              </>
            )}
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

          {!isMobile && (
            <>
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
            </>
          )}
        </Tabs>
        
        {/* Mobile-specific chat and review in separate cards */}
        {isMobile && (
          <div className="mt-4 space-y-3">
            <Card className="border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Quick Chat</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ChatInterfaceTab
                  chatMessage={chatMessage}
                  chatHistory={chatHistory}
                  canUseFeature={canUseFeature}
                  onChatMessageChange={setChatMessage}
                  onSendMessage={handleChatMessage}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

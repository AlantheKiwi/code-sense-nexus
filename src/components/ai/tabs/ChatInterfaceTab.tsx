
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MessageSquare, Crown } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
}

interface ChatInterfaceTabProps {
  chatMessage: string;
  chatHistory: ChatMessage[];
  canUseFeature: (feature: string) => boolean;
  onChatMessageChange: (message: string) => void;
  onSendMessage: () => void;
}

export const ChatInterfaceTab: React.FC<ChatInterfaceTabProps> = ({
  chatMessage,
  chatHistory,
  canUseFeature,
  onChatMessageChange,
  onSendMessage
}) => {
  return (
    <div className="space-y-3">
      <ScrollArea className="h-64 w-full border rounded p-3 bg-white">
        <div className="space-y-3">
          {chatHistory.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Ask CodeSense AI anything about your code!</p>
            </div>
          )}
          {chatHistory.map((message, index) => (
            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-2 rounded text-sm ${
                message.role === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {message.content}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      
      <div className="flex gap-2">
        <Input
          value={chatMessage}
          onChange={(e) => onChatMessageChange(e.target.value)}
          placeholder="Ask about your code..."
          onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
          disabled={!canUseFeature('ai-chat')}
        />
        <Button onClick={onSendMessage} disabled={!canUseFeature('ai-chat')}>
          <MessageSquare className="h-4 w-4" />
        </Button>
      </div>

      {!canUseFeature('ai-chat') && (
        <Alert className="border-orange-200 bg-orange-50">
          <Crown className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-700">
            Upgrade to Premium for AI chat assistance
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

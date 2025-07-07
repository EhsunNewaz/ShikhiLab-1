'use client';

import { useState, useRef, useEffect } from 'react';
import { askAiMentor, type AskAiMentorOutput } from '@/ai/flows/ask-ai-mentor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Loader2, Sparkles } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/use-auth-hook';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
}

export default function MentorClient() {
  const [messages, setMessages] = useState<Message[]>([
      {
          id: 'initial-message',
          role: 'model',
          content: 'Hello! I am your ShikhiLab AI Mentor. How can I help you with your IELTS preparation today? (আপনার আইইএলটিএস প্রস্তুতিতে আমি আজ কীভাবে সাহায্য করতে পারি?)',
      }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: crypto.randomUUID(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const result: AskAiMentorOutput = await askAiMentor({ prompt: currentInput });
      const modelMessage: Message = { id: crypto.randomUUID(), role: 'model', content: result.response };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error('AI Mentor Error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Sorry, I couldn\'t get a response. Please try again.',
      });
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto w-full h-[calc(100vh-8rem)] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="text-primary" />
          <span>ShikhiLab AI Mentor</span>
        </CardTitle>
        <CardDescription>আপনার আইইএলটিএস সম্পর্কিত যেকোনো প্রশ্ন করুন।</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden p-4">
        <ScrollArea className="flex-1 pr-4 -mr-4">
          <div className="space-y-6">
            {messages.map((message) => (
              <div key={message.id} className={cn('flex items-start gap-3', { 'justify-end': message.role === 'user' })}>
                {message.role === 'model' && (
                  <Avatar className="h-9 w-9 border border-primary/20 shrink-0">
                     <div className="h-full w-full flex items-center justify-center bg-primary/10">
                        <Sparkles className="h-5 w-5 text-primary" />
                     </div>
                  </Avatar>
                )}
                <div className={cn('max-w-[80%] rounded-lg p-3 text-sm shadow-sm', {
                  'bg-primary text-primary-foreground': message.role === 'user',
                  'bg-muted': message.role === 'model',
                })}>
                  <p className="whitespace-pre-wrap font-body">{message.content}</p>
                </div>
                {message.role === 'user' && (
                   <Avatar className="h-9 w-9 shrink-0">
                    <AvatarImage src={user?.photoURL || ''} alt={user?.name || ''} />
                    <AvatarFallback>{user?.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
             {isLoading && (
              <div className="flex items-start gap-3">
                 <Avatar className="h-9 w-9 border border-primary/20 shrink-0">
                    <div className="h-full w-full flex items-center justify-center bg-primary/10">
                        <Sparkles className="h-5 w-5 text-primary" />
                     </div>
                  </Avatar>
                <div className="bg-muted rounded-lg p-3 flex items-center space-x-2 text-sm text-muted-foreground shadow-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-4 border-t">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g., How can I improve my Task 2 essay writing?"
            disabled={isLoading}
            className="flex-1"
            autoComplete="off"
          />
          <Button type="submit" disabled={isLoading || !input.trim()} size="icon">
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

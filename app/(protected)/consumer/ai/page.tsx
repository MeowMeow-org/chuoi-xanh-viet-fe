"use client";

import { useState, useRef, useEffect } from 'react';
import ConsumerLayout from '@/components/layout/ConsumerLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Bot, User, ImagePlus } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: string;
}

const suggestions = [
  'Cách chọn rau muống sạch?',
  'Giá cà chua hôm nay bao nhiêu?',
  'VietGAP là gì?',
  'Rau nào tốt cho sức khỏe?',
];

const mockReplies: Record<string, string> = {
  'rau muống': 'Rau muống sạch thường có lá nhỏ, xanh đều, cuống hơi cứng. Rau dùng nhiều phân hóa học thì lá to mướt, bóng. Mua từ nguồn có truy xuất nguồn gốc QR là cách an toàn nhất.',
  'giá': 'Giá nông sản hôm nay (tham khảo): Rau muống 20-25k/bó, Cà chua 30-40k/kg, Xà lách 18-22k/bó, Dưa leo 25-35k/kg. Giá có thể thay đổi tùy vùng và mùa vụ.',
  'vietgap': 'VietGAP (Vietnamese Good Agricultural Practices) là quy trình thực hành sản xuất nông nghiệp tốt. Đảm bảo: an toàn thực phẩm, an toàn môi trường, sức khỏe người lao động, truy xuất nguồn gốc.',
  'sức khỏe': 'Các loại rau tốt cho sức khỏe: Rau muống (giàu sắt), Cà chua (lycopene chống oxy hóa), Rau dền (canxi), Rau ngót (protein thực vật). Nên ăn đa dạng và chọn rau có nguồn gốc rõ ràng.',
};

export default function ConsumerAIPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'ai', content: 'Xin chào! Mình là trợ lý AI của Chuỗi Xanh Việt. Mình có thể giúp bạn:\n\n🥬 Tư vấn chọn rau sạch\n💰 Tra giá nông sản\n📋 Giải thích chứng nhận VietGAP, GlobalGAP\n🌱 Kiến thức dinh dưỡng\n\nBạn muốn hỏi gì?', timestamp: new Date().toISOString() },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getReply = (text: string): string => {
    const lower = text.toLowerCase();
    for (const [key, reply] of Object.entries(mockReplies)) {
      if (lower.includes(key)) return reply;
    }
    return 'Cảm ơn câu hỏi của bạn! Tính năng AI đang được phát triển. Hiện tại bạn có thể hỏi về: cách chọn rau sạch, giá nông sản, chứng nhận VietGAP, hoặc dinh dưỡng rau củ.';
  };

  const sendMessage = (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;

    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', content: msg, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      const aiMsg: Message = { id: `a-${Date.now()}`, role: 'ai', content: getReply(msg), timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, aiMsg]);
      setLoading(false);
    }, 800);
  };

  return (
    <ConsumerLayout>
      <div className="container max-w-2xl flex flex-col h-[calc(100vh-7rem)] md:h-[calc(100vh-3.5rem)]">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'ai' && (
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line ${
                msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-muted rounded-bl-md'
              }`}>
                {msg.content}
              </div>
              {msg.role === 'user' && (
                <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center shrink-0">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  <span className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {suggestions.map(s => (
              <Button key={s} variant="outline" size="sm" className="shrink-0 text-xs" onClick={() => sendMessage(s)}>
                {s}
              </Button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="border-t bg-card py-3 flex gap-2">
          <Button variant="ghost" size="icon" className="shrink-0 h-10 w-10">
            <ImagePlus className="h-5 w-5 text-muted-foreground" />
          </Button>
          <Input
            placeholder="Hỏi về nông sản, dinh dưỡng, VietGAP..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            className="h-10"
          />
          <Button size="icon" className="shrink-0 h-10 w-10" onClick={() => sendMessage()} disabled={!input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </ConsumerLayout>
  );
}

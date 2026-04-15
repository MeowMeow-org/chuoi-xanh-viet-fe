"use client";

import { useState } from "react";
import { ArrowLeft, Send, User } from "lucide-react";

import FarmerLayout from "@/components/layout/FarmerLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { conversations, type ChatMessage, type Conversation } from "@/data/marketplaceData";

function formatDateDDMMYYYY(iso: string) {
    const [year, month, day] = iso.slice(0, 10).split("-");
    return `${day}/${month}/${year}`;
}

export default function FarmerMessagesPage() {
    const [convList, setConvList] = useState(conversations);
    const [activeConv, setActiveConv] = useState<string | null>(null);
    const [input, setInput] = useState("");

    const active = convList.find((conversation) => conversation.id === activeConv);

    const sendMsg = () => {
        if (!input.trim() || !activeConv) return;

        const newMsg: ChatMessage = {
            id: `msg-${crypto.randomUUID()}`,
            senderId: "farmer-001",
            senderName: "Nguyễn Văn Minh",
            senderRole: "farmer",
            content: input.trim(),
            timestamp: new Date().toISOString(),
        };

        setConvList((prev) =>
            prev.map((conversation) => {
                if (conversation.id !== activeConv) return conversation;

                return {
                    ...conversation,
                    messages: [...conversation.messages, newMsg],
                    lastMessage: newMsg.content,
                    lastTimestamp: newMsg.timestamp,
                    unread: 0,
                };
            })
        );

        setInput("");
    };

    if (active) {
        return (
            <FarmerLayout>
                <div className="flex h-[calc(100vh-3.5rem-3.5rem)] flex-col md:h-[calc(100vh-3.5rem)]">
                    <div className="flex items-center gap-3 border-b bg-white px-4 py-3">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setActiveConv(null)}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(142,71%,45%)]/10">
                            <User className="h-4 w-4 text-[hsl(142,71%,45%)]" />
                        </div>
                        <span className="text-sm font-semibold">{active.buyerName}</span>
                    </div>

                    <div className="flex-1 space-y-3 overflow-y-auto p-4">
                        {active.messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.senderRole === "farmer" ? "justify-end" : "justify-start"}`}>
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${msg.senderRole === "farmer"
                                            ? "rounded-tr-md bg-[hsl(142,71%,45%)] text-white"
                                            : "rounded-tl-md bg-[hsl(120,20%,95%)] text-[hsl(150,10%,18%)]"
                                        }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="border-t bg-white p-3">
                        <div className="mx-auto flex max-w-2xl gap-2">
                            <Input
                                value={input}
                                onChange={(e) => setInput((e.target as HTMLInputElement).value)}
                                placeholder="Nhắn tin..."
                                className="h-11"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") sendMsg();
                                }}
                            />
                            <Button size="icon" className="h-11 w-11" onClick={sendMsg} disabled={!input.trim()}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </FarmerLayout>
        );
    }

    return (
        <FarmerLayout>
            <div className="mx-auto max-w-2xl space-y-4 px-4 py-4 pb-20 sm:px-6 md:pb-8">
                <h1 className="text-xl font-bold">Tin nhắn</h1>

                {convList.length === 0 ? (
                    <p className="py-8 text-center text-sm text-[hsl(150,7%,45%)]">Chưa có cuộc trò chuyện nào</p>
                ) : (
                    <div className="space-y-2">
                        {convList.map((conversation: Conversation) => (
                            <Card
                                key={conversation.id}
                                className="cursor-pointer transition-colors hover:border-[hsl(142,71%,45%)]/40"
                                onClick={() => setActiveConv(conversation.id)}
                            >
                                <CardContent className="flex items-center gap-3 p-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[hsl(142,71%,45%)]/10">
                                        <User className="h-5 w-5 text-[hsl(142,71%,45%)]" />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold">{conversation.buyerName}</span>
                                            <span className="text-xs text-[hsl(150,7%,45%)]">{formatDateDDMMYYYY(conversation.lastTimestamp)}</span>
                                        </div>
                                        <p className="truncate text-sm text-[hsl(150,7%,45%)]">{conversation.lastMessage}</p>
                                    </div>

                                    {conversation.unread > 0 && (
                                        <Badge className="flex h-5 w-5 items-center justify-center p-0 text-[10px]">{conversation.unread}</Badge>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </FarmerLayout>
    );
}

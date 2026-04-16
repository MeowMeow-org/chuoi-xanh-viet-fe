"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, Camera, Send, User } from "lucide-react";

import FarmerLayout from "@/components/layout/FarmerLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Message = {
    id: string;
    role: "user" | "assistant";
    content: string;
};

const quickQuestions = [
    "Quy trình bón phân VietGAP?",
    "Cách phòng trừ sâu bệnh hữu cơ?",
    "Kỹ thuật tưới tiết kiệm nước?",
    "Tiêu chuẩn VietGAP cần đạt?",
    "Giá rau muống hôm nay?",
];

const mockResponses: Record<string, string> = {
    default:
        "Xin chào! Tôi là trợ lý AI của Chuỗi Xanh Việt. Tôi có thể giúp bạn về kỹ thuật canh tác, tiêu chuẩn VietGAP, và chẩn đoán bệnh cây. Hãy đặt câu hỏi hoặc gửi ảnh cây trồng nhé! 🌿",
    vietgap:
        "Theo tiêu chuẩn VietGAP, quy trình bón phân cần:\n\n1️⃣ Phân tích đất trước khi bón\n2️⃣ Bón lót phân hữu cơ hoai mục 2-3 tấn/1000m²\n3️⃣ Bón thúc NPK theo đúng liều lượng khuyến cáo\n4️⃣ Ghi nhật ký đầy đủ loại phân, liều lượng, ngày bón\n5️⃣ Thời gian cách ly tối thiểu 7-14 ngày trước thu hoạch\n\n⚠️ Không sử dụng phân tươi chưa xử lý!",
    sau:
        "Các biện pháp phòng trừ sâu bệnh hữu cơ:\n\n🌿 Sinh học: Dùng chế phẩm Bt, Trichoderma, nấm xanh Metarhizium\n🪤 Bẫy: Bẫy dính vàng, bẫy pheromone\n🌱 Canh tác: Luân canh, xen canh, vệ sinh đồng ruộng\n🧄 Thảo mộc: Dung dịch tỏi-ớt, neem (xoan Ấn Độ)\n\n📌 Ưu tiên IPM (Quản lý dịch hại tổng hợp) theo VietGAP.",
    tuoi:
        "Kỹ thuật tưới tiết kiệm nước:\n\n💧 Tưới nhỏ giọt: Tiết kiệm 40-60% nước, phù hợp rau ăn quả\n🌧️ Tưới phun mưa: Cho rau ăn lá, phun sương cho vườn ươm\n⏰ Thời điểm: Tưới sáng sớm (6-7h) hoặc chiều mát (17-18h)\n📊 Lượng nước: 3-5 lít/m²/lần tùy loại cây\n\n💡 Phủ rơm/màng PE giữ ẩm đất, giảm bốc hơi.",
    tieuChuan:
        "📋 Tiêu chuẩn VietGAP gồm 4 nhóm:\n\n1️⃣ An toàn thực phẩm: Không tồn dư thuốc BVTV, vi sinh vật\n2️⃣ An toàn môi trường: Xử lý rác, bao bì thuốc đúng cách\n3️⃣ Sức khỏe người lao động: Trang bị bảo hộ, tập huấn\n4️⃣ Truy xuất nguồn gốc: Ghi chép nhật ký đầy đủ\n\n✅ Chuỗi Xanh Việt giúp bạn đạt tiêu chuẩn nhóm 4 dễ dàng!",
    gia:
        "📊 Giá nông sản tham khảo hôm nay (08/04/2026):\n\n🥬 Rau muống: 20.000 - 28.000đ/bó (500g)\n🍅 Cà chua: 30.000 - 40.000đ/kg\n🥒 Dưa leo: 25.000 - 35.000đ/kg\n\n📈 Xu hướng: Giá rau xanh đang tăng nhẹ do nhu cầu mùa hè. Khuyến nghị bán rau muống trong 3-5 ngày tới khi giá ổn định ở mức cao.\n\n💡 Gợi ý: Đăng bán trên Gian hàng với giá 25.000đ/bó để cạnh tranh.",
};

function getResponse(text: string): string {
    const lower = text.toLowerCase();

    if (lower.includes("bón phân") || lower.includes("vietgap")) return mockResponses.vietgap;
    if (lower.includes("sâu") || lower.includes("bệnh") || lower.includes("phòng trừ")) return mockResponses.sau;
    if (lower.includes("tưới") || lower.includes("nước")) return mockResponses.tuoi;
    if (lower.includes("tiêu chuẩn") || lower.includes("đạt")) return mockResponses.tieuChuan;
    if (lower.includes("giá") || lower.includes("bán") || lower.includes("thị trường")) return mockResponses.gia;

    return "Cảm ơn bạn đã hỏi! Đây là tính năng demo. Trong phiên bản chính thức, AI sẽ phân tích câu hỏi và hình ảnh của bạn để đưa ra tư vấn chính xác. 🌿";
}

export default function FarmerAIAssistantPage() {
    const initialMessages = useMemo<Message[]>(
        () => [
            {
                id: "assistant-welcome",
                role: "assistant",
                content: mockResponses.default,
            },
        ],
        []
    );

    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [input, setInput] = useState("");
    const [isThinking, setIsThinking] = useState(false);
    const chatScrollRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!chatScrollRef.current) return;
        chatScrollRef.current.scrollTo({
            top: chatScrollRef.current.scrollHeight,
            behavior: "smooth",
        });
    }, [messages, isThinking]);

    const sendMessage = (text: string) => {
        const trimmed = text.trim();
        if (!trimmed) return;

        const userMsg: Message = {
            id: `u-${crypto.randomUUID()}`,
            role: "user",
            content: trimmed,
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsThinking(true);

        window.setTimeout(() => {
            const botMsg: Message = {
                id: `b-${crypto.randomUUID()}`,
                role: "assistant",
                content: getResponse(trimmed),
            };
            setMessages((prev) => [...prev, botMsg]);
            setIsThinking(false);
        }, 800);
    };

    return (
        <FarmerLayout>
            <div className="flex h-[calc(100vh-3.5rem-3.5rem)] flex-col md:h-[calc(100vh-3.5rem)]">
                <div
                    ref={chatScrollRef}
                    className="flex-1 overflow-y-scroll pr-1 [scrollbar-gutter:stable] [scrollbar-color:hsl(142_20%_70%)_hsl(120_20%_95%)] [scrollbar-width:thin] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[hsl(142,20%,70%)] [&::-webkit-scrollbar-track]:bg-[hsl(120,20%,95%)] [&::-webkit-scrollbar]:w-2"
                >
                    <div className="mx-auto max-w-2xl space-y-3 px-4 py-4 sm:px-6">
                        {messages.map((msg, index) => (
                            <div
                                key={msg.id}
                                className={`animate-in fade-in-0 slide-in-from-bottom-2 flex gap-2 duration-300 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                style={{ animationDelay: `${index * 40}ms` }}
                            >
                                {msg.role === "assistant" && (
                                    <div className="animate-in zoom-in-95 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(142,71%,45%)]/10 duration-300">
                                        <Bot className="h-4 w-4 text-[hsl(142,71%,45%)]" />
                                    </div>
                                )}

                                <div
                                    className={`max-w-[80%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === "user"
                                        ? "rounded-tr-md bg-[hsl(142,71%,45%)] text-white"
                                        : "rounded-tl-md bg-[hsl(120,20%,95%)] text-[hsl(150,10%,18%)]"
                                        }`}
                                >
                                    {msg.content}
                                </div>

                                {msg.role === "user" && (
                                    <div className="animate-in zoom-in-95 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(142,71%,45%)]/10 duration-300">
                                        <User className="h-4 w-4 text-[hsl(142,71%,45%)]" />
                                    </div>
                                )}
                            </div>
                        ))}

                        {isThinking && (
                            <div className="animate-in fade-in-0 slide-in-from-bottom-2 flex gap-2 duration-300">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(142,71%,45%)]/10">
                                    <Bot className="h-4 w-4 text-[hsl(142,71%,45%)]" />
                                </div>
                                <div className="rounded-2xl rounded-tl-md bg-[hsl(120,20%,95%)] px-4 py-3 text-sm text-[hsl(150,10%,18%)]">
                                    <div className="flex items-center gap-1.5">
                                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[hsl(142,71%,45%)] [animation-delay:-0.2s]" />
                                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[hsl(142,71%,45%)] [animation-delay:-0.1s]" />
                                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[hsl(142,71%,45%)]" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="border-t bg-white/60">
                    <div className="mx-auto max-w-2xl px-4 py-2 sm:px-6">
                        <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-color:hsl(142_20%_70%)_hsl(120_20%_95%)] [scrollbar-width:thin] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[hsl(142,20%,70%)] [&::-webkit-scrollbar-track]:bg-[hsl(120,20%,95%)] [&::-webkit-scrollbar]:h-1.5">
                            {quickQuestions.map((question) => (
                                <Button
                                    key={question}
                                    variant="outline"
                                    size="sm"
                                    className="h-8 shrink-0 rounded-full text-xs"
                                    onClick={() => sendMessage(question)}
                                >
                                    {question}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="border-t bg-white">
                    <div className="mx-auto max-w-2xl px-4 py-3 sm:px-6">
                        <div className="flex gap-2">
                            <Button variant="outline" size="icon" className="h-12 w-12 shrink-0">
                                <Camera className="h-5 w-5" />
                            </Button>

                            <Input
                                value={input}
                                onChange={(e) => setInput((e.target as HTMLInputElement).value)}
                                placeholder="Hỏi về kỹ thuật canh tác..."
                                className="h-12 text-base"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") sendMessage(input);
                                }}
                            />

                            <Button
                                size="icon"
                                className="h-12 w-12 shrink-0"
                                onClick={() => sendMessage(input)}
                                disabled={!input.trim()}
                            >
                                <Send className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </FarmerLayout>
    );
}

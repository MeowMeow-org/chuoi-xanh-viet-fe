"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, ImagePlus, Loader2, Mic, Send, User, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { chatbotService, type ConversationTurn } from "@/services/chatbot";
import { clientRandomUUID, cn } from "@/lib/utils";
import { toast } from "sonner";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  /** Blob URL for ảnh chẩn đoán — revoke khi reset */
  imageSrc?: string;
};

type TextIntent = "farming" | "market";

const WELCOME_TEXT = `Xin chào! Trong **một khung chat** này bạn có thể:

**Kỹ thuật canh tác** — hỏi về VietGAP/GlobalGAP, sâu bệnh, bón phân, tưới tiêu…

**Giá và thị trường** — hỏi giá nông sản, xu hướng, khu vực (vd: giá chuối hôm nay, cà rốt miền Tây). Hệ thống **tự nhận** từ câu bạn gõ.

**Chẩn đoán qua ảnh** — chạm **biểu tượng ảnh** bên trái để đính ảnh lá / quả / cây, có thể ghi chú triệu chứng (gợi ý tham khảo).

**Nói để nhập** — bấm **micro** cạnh nút gửi (Chrome / Edge, tiếng Việt); phần nhận diện do trình duyệt xử lý.`;

/**
 * Chọn API: kỹ thuật vs giá thị trường.
 * Lưu ý: trong JS, `\b` (word boundary) CHỈ khớp [A-Za-z0-9_], nên **không** dùng `\b` với
 * tiếng Việt có dấu (vd. "giá", "đầu") — nếu không "Giá xoài…" sẽ **không** vào market.
 */
function inferTextIntent(text: string): TextIntent {
  const raw = text.trim();
  if (!raw) return "farming";

  const t = raw.toLowerCase().normalize("NFC");

  /** Cụm gợi ý giá / thị trường (includes — an toàn với Unicode). Không thêm tên địa danh đơn thuần — tránh nhầm câu hỏi kỹ thuật tại địa phương. */
  const marketPhrases = [
    "giá",
    "thị trường",
    "chợ đầu mối",
    "đầu mối",
    "cung cầu",
    "khớp giá",
    "bình ổn giá",
    "giá cả",
    "giá bán",
    "giá mua",
    "xu hướng giá",
    "biến động giá",
    "tư vấn giá",
    "dao động giá",
    "hoa quả giá",
    "rau củ giá",
    "nông sản hôm nay",
    "bao nhiêu tiền",
    "bao nhiêu 1kg",
    "thanh khoản",
    "chợ bình điền",
    "triệu/tấn",
    "nghìn/kg",
    "ngàn/kg",
    "đồng/kg",
  ];
  if (marketPhrases.some((p) => t.includes(p))) {
    return "market";
  }

  /** Mẫu regex không dùng \b cho từ tiếng Việt có dấu */
  const marketPatterns: RegExp[] = [
    /thị\s*trường/i,
    /chợ\s*đầu\s*mối/i,
    /xu\s*hướng(\s+giá)?/i,
    /mua\s*vào/i,
    /\d[\d.,]*\s*(nghìn|ngàn|triệu|đ)\s*\/?\s*kg/i,
    /\/\s*kg/i,
    /sàn\s*giao\s*dịch/i,
    /giá\s*(chuối|củ|cà|xoài|rau|quả|khoai|nông\s*sản|hôm\s*nay|hiện\s*nay)/i,
    /(xuất|nhập)\s*khẩu.*(giá|thị\s*trường)/i,
  ];

  if (marketPatterns.some((re) => re.test(raw))) {
    return "market";
  }

  return "farming";
}

function getSpeechRecognitionConstructor(): typeof SpeechRecognition | null {
  if (typeof window === "undefined") return null;
  return (
    window.SpeechRecognition ??
    (
      window as unknown as {
        webkitSpeechRecognition?: typeof SpeechRecognition;
      }
    ).webkitSpeechRecognition ??
    null
  );
}

export default function FarmerAIAssistantPage() {
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const initialMessages = useMemo<Message[]>(
    () => [
      {
        id: "assistant-welcome",
        role: "assistant",
        content: WELCOME_TEXT,
      },
    ],
    [],
  );

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingRoute, setThinkingRoute] = useState<
    "farming" | "market" | "image" | null
  >(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setVoiceSupported(getSpeechRecognitionConstructor() != null);
  }, []);

  useEffect(() => {
    return () => {
      try {
        speechRecognitionRef.current?.stop();
      } catch {
        /* ignore */
      }
      speechRecognitionRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!pendingImage) {
      queueMicrotask(() => setPreviewUrl(null));
      return;
    }
    const url = URL.createObjectURL(pendingImage);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- object URL tied to effect cleanup revoke
    setPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [pendingImage]);

  useEffect(() => {
    if (!chatScrollRef.current) return;
    chatScrollRef.current.scrollTo({
      top: chatScrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isThinking]);

  const toHistory = (msgs: Message[]): ConversationTurn[] =>
    msgs.map((m) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.content,
    }));

  const sendFarming = async (trimmed: string) => {
    const prior = messages.filter((m) => m.id !== "assistant-welcome");
    const history = toHistory(prior);
    const res = await chatbotService.chat(trimmed, history);
    const content = res.reply?.trim() || "(Không có nội dung trả lời)";
    setMessages((prev) => [
      ...prev,
      {
        id: `b-${clientRandomUUID()}`,
        role: "assistant",
        content,
      },
    ]);
  };

  const sendMarket = async (trimmed: string) => {
    const prior = messages.filter((m) => m.id !== "assistant-welcome");
    const history = toHistory(prior);
    const res = await chatbotService.market(trimmed, {}, history);
    let content = res.advice?.trim() || "(Không có nội dung tư vấn)";
    if (res.sources?.length) {
      content += "\n\nNguồn tham khảo:\n";
      res.sources.forEach((s, i) => {
        content += `${i + 1}. ${s.title}\n   ${s.url}\n`;
      });
    }
    setMessages((prev) => [
      ...prev,
      {
        id: `b-${clientRandomUUID()}`,
        role: "assistant",
        content,
      },
    ]);
  };

  const sendTextByIntent = async (trimmed: string, intent: TextIntent) => {
    if (intent === "market") await sendMarket(trimmed);
    else await sendFarming(trimmed);
  };

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isThinking) return;

    const intent = inferTextIntent(trimmed);
    const userMsg: Message = {
      id: `u-${clientRandomUUID()}`,
      role: "user",
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setThinkingRoute(intent);
    setIsThinking(true);

    try {
      await sendTextByIntent(trimmed, intent);
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
    } finally {
      setIsThinking(false);
      setThinkingRoute(null);
    }
  };

  const pickFile = () => fileInputRef.current?.click();

  const stopListening = () => {
    try {
      speechRecognitionRef.current?.stop();
    } catch {
      /* ignore */
    }
    speechRecognitionRef.current = null;
    setIsListening(false);
  };

  const toggleVoiceInput = () => {
    if (!voiceSupported || isThinking) return;
    if (isListening) {
      stopListening();
      return;
    }
    const SR = getSpeechRecognitionConstructor();
    if (!SR) {
      toast.error("Trình duyệt không hỗ trợ nhận diện giọng nói.");
      return;
    }
    const rec = new SR();
    rec.lang = "vi-VN";
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (event: SpeechRecognitionEvent) => {
      const piece = event.results[0]?.[0]?.transcript?.trim();
      if (piece) {
        setInput((prev) => {
          const sep = prev && !/\s$/.test(prev) ? " " : "";
          return (prev + sep + piece).trim();
        });
      }
    };
    rec.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "aborted") return;
      speechRecognitionRef.current = null;
      setIsListening(false);
      if (event.error === "not-allowed") {
        toast.error("Cần cho phép micro trong trình duyệt.");
      } else if (
        event.error !== "no-speech" &&
        event.error !== "network"
      ) {
        toast.error("Không nhận diện được giọng nói. Thử lại.");
      }
    };
    rec.onend = () => {
      speechRecognitionRef.current = null;
      setIsListening(false);
    };
    speechRecognitionRef.current = rec;
    setIsListening(true);
    try {
      rec.start();
    } catch {
      speechRecognitionRef.current = null;
      setIsListening(false);
      toast.error("Không bật được micro.");
    }
  };

  const clearPendingImage = () => {
    setPendingImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const ok = ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
      f.type,
    );
    if (!ok) {
      toast.error("Chỉ chấp nhận JPG, PNG, WebP hoặc GIF.");
      e.target.value = "";
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error("Ảnh tối đa 10MB.");
      e.target.value = "";
      return;
    }
    setPendingImage(f);
  };

  const submitDiagnose = async () => {
    const file = pendingImage;
    if (!file || isThinking) {
      if (!file) toast.error("Chọn ảnh bằng nút đính ảnh trước khi gửi.");
      return;
    }
    const note = input.trim();

    const displayUrl = URL.createObjectURL(file);
    const userMsg: Message = {
      id: `u-${clientRandomUUID()}`,
      role: "user",
      content: note ? note : "Ảnh gửi chẩn đoán",
      imageSrc: displayUrl,
    };

    setMessages((prev) => [...prev, userMsg]);
    setPendingImage(null);
    setInput("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    setThinkingRoute("image");
    setIsThinking(true);

    try {
      const res = await chatbotService.diagnose(file, note);
      const content = res.diagnosis?.trim() || "(Không có kết quả chẩn đoán)";
      setMessages((prev) => [
        ...prev,
        {
          id: `b-${clientRandomUUID()}`,
          role: "assistant",
          content,
        },
      ]);
    } catch {
      setMessages((prev) => {
        const next = prev.filter((m) => m.id !== userMsg.id);
        if (displayUrl.startsWith("blob:")) URL.revokeObjectURL(displayUrl);
        return next;
      });
    } finally {
      setIsThinking(false);
      setThinkingRoute(null);
    }
  };

  const submitComposer = async () => {
    if (isThinking) return;
    if (pendingImage) {
      await submitDiagnose();
      return;
    }
    await sendMessage(input);
  };

  const inputPlaceholder = pendingImage
    ? "Ghi chú triệu chứng, giai đoạn cây… (tuỳ chọn)"
    : "Hỏi kỹ thuật, giá thị trường, hoặc đính ảnh…";

  const sendDisabled = isThinking || (!pendingImage && !input.trim());

  const thinkingLabel =
    thinkingRoute === "image"
      ? "Đang phân tích ảnh…"
      : thinkingRoute === "market"
        ? "Đang tư vấn giá & thị trường…"
        : thinkingRoute === "farming"
          ? "Đang trả lời…"
          : "Đang xử lý…";

  return (
    <div className="flex h-[calc(100vh-3.5rem-3.5rem)] flex-col md:h-[calc(100vh-3.5rem)]">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={onFileInput}
      />

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
                className={cn(
                  "max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  msg.role === "user"
                    ? "rounded-tr-md bg-[hsl(142,71%,45%)] text-white"
                    : "rounded-tl-md bg-[hsl(120,20%,95%)] text-[hsl(150,10%,18%)]",
                )}
              >
                {msg.imageSrc && (
                  <div className="mb-2 overflow-hidden rounded-lg border border-white/20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={msg.imageSrc}
                      alt="Ảnh chẩn đoán"
                      className="max-h-52 w-full bg-black/10 object-contain"
                    />
                  </div>
                )}
                {msg.id === "assistant-welcome" && msg.content.includes("**")
                  ? msg.content
                      .split(/(\*\*[^*]+\*\*)/g)
                      .map((part, i) =>
                        part.startsWith("**") && part.endsWith("**") ? (
                          <strong key={i}>{part.slice(2, -2)}</strong>
                        ) : (
                          <span key={i}>{part}</span>
                        ),
                      )
                  : msg.content}
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
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-[hsl(142,71%,45%)]" />
                  <span>{thinkingLabel}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-zinc-200/80 bg-white px-4 py-3 sm:px-6">
        <div className="mx-auto max-w-2xl space-y-2">
          {previewUrl && (
            <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50/80 px-2 py-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt=""
                className="h-11 w-11 shrink-0 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-zinc-800">
                  {pendingImage?.name ?? "Ảnh đính kèm"}
                </p>
                <p className="text-[11px] text-zinc-500">
                  Sẽ gửi chẩn đoán khi bấm gửi
                </p>
              </div>
              <button
                type="button"
                onClick={clearPendingImage}
                className="rounded-full p-1.5 text-zinc-500 transition-colors hover:bg-zinc-200/80 hover:text-zinc-900"
                aria-label="Bỏ ảnh"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div
            className={cn(
              "flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-1.5 py-1.5 shadow-sm",
              "ring-offset-white focus-within:ring-2 focus-within:ring-[hsl(142,71%,45%)]/35 focus-within:ring-offset-2",
            )}
          >
            <button
              type="button"
              onClick={pickFile}
              disabled={isThinking}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-50"
              aria-label="Đính ảnh"
            >
              <ImagePlus className="h-5 w-5 stroke-[2]" />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={inputPlaceholder}
              disabled={isThinking}
              className="min-w-0 flex-1 border-0 bg-transparent py-2 pr-2 text-[15px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-0 disabled:opacity-60"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void submitComposer();
                }
              }}
            />
            <Button
              type="button"
              size="icon"
              disabled={sendDisabled}
              className="h-10 w-10 shrink-0 rounded-full bg-[hsl(142,71%,45%)] text-white hover:bg-[hsl(142,71%,40%)] disabled:opacity-40"
              onClick={() => void submitComposer()}
              aria-label="Gửi"
            >
              {isThinking ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
            <button
              type="button"
              onClick={toggleVoiceInput}
              disabled={isThinking || !voiceSupported}
              title={
                !voiceSupported
                  ? "Trình duyệt không hỗ trợ (thử Chrome hoặc Edge)"
                  : isListening
                    ? "Dừng nghe"
                    : "Nói để điền ô chat (tiếng Việt)"
              }
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors",
                !voiceSupported || isThinking
                  ? "cursor-not-allowed text-zinc-400"
                  : isListening
                    ? "bg-red-500 text-white shadow-md hover:bg-red-600"
                    : "text-zinc-700 hover:bg-zinc-100",
              )}
              aria-label={isListening ? "Dừng ghi âm" : "Nói để nhập"}
              aria-pressed={isListening}
            >
              <Mic
                className={cn("h-5 w-5", isListening && "animate-pulse")}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

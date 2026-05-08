"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { useAdminBroadcastMutation } from "@/hooks/useAdmin";
import type { BroadcastAudience } from "@/services/admin";

const AUDIENCE_OPTIONS: { value: BroadcastAudience; label: string }[] = [
  { value: "all", label: "Tất cả người dùng đang hoạt động" },
  { value: "consumers", label: "Khách hàng (consumer)" },
  { value: "farmers", label: "Nông hộ (farmer)" },
  { value: "cooperatives", label: "HTX (cooperative)" },
];

export default function AdminBroadcastPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<BroadcastAudience>("all");
  const [linkPath, setLinkPath] = useState("");
  const [lastResult, setLastResult] = useState<{
    sentCount: number;
    recipientTotal: number;
  } | null>(null);

  const broadcast = useAdminBroadcastMutation();

  const submit = async () => {
    setLastResult(null);
    try {
      const res = await broadcast.mutateAsync({
        title: title.trim(),
        body: body.trim(),
        audience,
        ...(linkPath.trim() ? { linkPath: linkPath.trim() } : {}),
      });
      setLastResult({
        sentCount: res.sentCount,
        recipientTotal: res.recipientTotal,
      });
    } catch {
      /* axios toast */
    }
  };

  const disabled =
    broadcast.isPending ||
    title.trim().length === 0 ||
    body.trim().length === 0;

  return (
    <main className="bg-[hsl(120,20%,98%)] px-4 py-6 text-[hsl(150,10%,15%)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <header className="rounded-2xl border border-[hsl(142,15%,88%)] bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-[hsl(142,50%,35%)]">
            Quản trị
          </p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight">Gửi thông báo hệ thống</h1>
          <p className="mt-2 text-sm text-[hsl(150,5%,45%)]">
            Tạo thông báo loại hệ thống cho nhóm người dùng đang hoạt động. Mỗi người nhận một bản
            ghi; trùng lặp theo đợt được tránh bằng khóa trên máy chủ.
          </p>
        </header>

        <section className="space-y-4 rounded-xl border border-[hsl(142,15%,88%)] bg-white p-6 shadow-sm">
          <div className="space-y-1">
            <Label htmlFor="bc-title">Tiêu đề (tối đa 240 ký tự)</Label>
            <Input
              id="bc-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={240}
              placeholder="Ví dụ: Thông báo bảo trì hệ thống"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="bc-body">Nội dung</Label>
            <Textarea
              id="bc-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              placeholder="Nội dung hiển thị trong thông báo trong app…"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="bc-audience">Đối tượng nhận</Label>
            <Select
              id="bc-audience"
              value={audience}
              onChange={(e) => setAudience(e.target.value as BroadcastAudience)}
            >
              {AUDIENCE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="bc-link">Đường dẫn khi mở thông báo (tuỳ chọn)</Label>
            <Input
              id="bc-link"
              value={linkPath}
              onChange={(e) => setLinkPath(e.target.value)}
              placeholder="Ví dụ: /consumer hoặc /farmer/certificates"
            />
            <p className="text-xs text-[hsl(150,6%,45%)]">
              Đường dẫn tương đối trong ứng dụng; nếu để trống, người xem được đưa về trang mặc định
              theo vai trò.
            </p>
          </div>

          <Button
            type="button"
            className="w-full sm:w-auto"
            disabled={disabled}
            onClick={() => void submit()}
          >
            {broadcast.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang gửi…
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Gửi thông báo
              </>
            )}
          </Button>

          {lastResult && (
            <div
              className="rounded-lg border border-[hsl(142,40%,80%)] bg-[hsl(142,40%,96%)] px-4 py-3 text-sm"
              role="status"
            >
              <p className="font-semibold text-[hsl(142,71%,28%)]">Đã xử lý xong</p>
              <p className="mt-1 text-[hsl(150,8%,30%)]">
                Đã tạo {lastResult.sentCount} thông báo cho tối đa {lastResult.recipientTotal}{" "}
                người nhận trong đối tượng (bản ghi trùng dedupe có thể bỏ qua).
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

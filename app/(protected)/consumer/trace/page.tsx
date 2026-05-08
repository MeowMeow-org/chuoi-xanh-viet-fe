"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QrCode, Search } from "lucide-react";

import ConsumerLayout from "@/components/layout/ConsumerLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ConsumerTracePage() {
  const router = useRouter();
  const [code, setCode] = useState("");

  const handleSearch = () => {
    const value = code.trim();
    if (!value) return;
    router.push(`/truy-xuat/${encodeURIComponent(value)}`);
  };

  return (
    <ConsumerLayout>
      <div className="container mx-auto max-w-2xl space-y-4 py-4 pb-20 md:pb-8">
        <div>
          <h1 className="text-xl font-bold">Truy xuất nguồn gốc</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Nhập mã truy xuất (in trên bao bì) hoặc quét mã QR để xem toàn bộ
            hành trình canh tác của sản phẩm.
          </p>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="VD: CXV-001 hoặc mã đầy đủ"
              className="h-12 pl-10"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <Button className="h-12 gap-2" onClick={handleSearch}>
            <QrCode className="h-4 w-4" /> Tra cứu
          </Button>
        </div>

        <Button variant="outline" className="h-12 w-full gap-2" disabled>
          <QrCode className="h-5 w-5" />
          Quét mã QR bằng camera (sắp có)
        </Button>

        <div className="rounded-lg border border-dashed bg-muted/30 p-4 text-xs text-muted-foreground">
          <p className="mb-1 font-semibold text-foreground">Mẹo tra cứu</p>
          <ul className="list-disc space-y-0.5 pl-4">
            <li>
              Mỗi lô bán có một mã ngắn dạng <code>CXV-xxx</code> in kèm QR.
            </li>
            <li>Quét QR trên bao bì sẽ đưa thẳng tới trang truy xuất.</li>
            <li>
              Nếu nhập tay, có thể nhập mã ngắn <em>hoặc</em> mã đầy đủ của lô.
            </li>
          </ul>
        </div>
      </div>
    </ConsumerLayout>
  );
}

"use client";

import * as React from "react";
import { ShieldCheck, BadgeCheck, Leaf, FileText, ExternalLink } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CERT_TYPE_LABEL,
  type CertType,
  type CertificateBadge as CertificateBadgeData,
} from "@/services/certificate";
import { useFarmBadgesQuery } from "@/hooks/useCertificate";

type Props = {
  /** Đã có sẵn mảng badge (ưu tiên). Nếu không có, truyền farmId để tự fetch */
  badges?: CertificateBadgeData[] | null;
  farmId?: string | null;
  /** Chỉ hiển thị loại này (mặc định: vietgap) */
  filterType?: CertType | "any";
  /** Style hiển thị */
  variant?: "corner" | "inline";
  className?: string;
};

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function useResolvedBadges(props: Props): CertificateBadgeData[] {
  const hasProp = Array.isArray(props.badges);
  const shouldFetch = !hasProp && !!props.farmId;
  const query = useFarmBadgesQuery(shouldFetch ? props.farmId : null);
  if (hasProp) return (props.badges as CertificateBadgeData[]) ?? [];
  return query.data?.badges ?? [];
}

function filterBadges(
  badges: CertificateBadgeData[],
  filterType: Props["filterType"],
): CertificateBadgeData[] {
  if (!filterType || filterType === "any") {
    return badges.filter((b) => b.active && b.sources.length > 0);
  }
  return badges.filter(
    (b) => b.type === filterType && b.active && b.sources.length > 0,
  );
}

export function CertificateBadge(props: Props) {
  const {
    variant = "corner",
    filterType = "vietgap",
    className,
  } = props;
  const badges = filterBadges(useResolvedBadges(props), filterType);

  if (badges.length === 0) return null;

  const mainType = badges[0].type;
  const label = CERT_TYPE_LABEL[mainType];

  return (
    <Dialog>
      <DialogTrigger
        render={
          variant === "corner" ? (
            <button
              type="button"
              aria-label={`Chứng chỉ ${label}`}
              className={cn(
                "absolute -bottom-1 -right-1 inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-primary text-white shadow-md transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                className,
              )}
            />
          ) : (
            <button
              type="button"
              className={cn(
                "inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary hover:bg-primary/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                className,
              )}
              aria-label={`Chứng chỉ ${label}`}
            />
          )
        }
      >
        {variant === "corner" ? (
          <BadgeCheck className="h-4 w-4" />
        ) : (
          <>
            <ShieldCheck className="h-3 w-3" />
            <span>{label}</span>
          </>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-primary" />
            Chứng chỉ đã xác thực
          </DialogTitle>
          <DialogDescription>
            Các chứng chỉ đang còn hiệu lực cho gian hàng này.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {badges.map((b) => (
            <BadgeDetailBlock key={b.type} badge={b} />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function BadgeDetailBlock({ badge }: { badge: CertificateBadgeData }) {
  return (
    <div className="space-y-2 rounded-lg border border-border/60 p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span className="font-semibold">{CERT_TYPE_LABEL[badge.type]}</span>
        </div>
        <Badge variant="default">Đang hiệu lực</Badge>
      </div>
      <div className="space-y-2">
        {badge.sources.map((s, idx) => (
          <div
            key={`${s.kind}-${s.certificateId}-${idx}`}
            className="rounded-md bg-muted/40 p-2 text-xs"
          >
            <div className="mb-1 flex items-center gap-1 font-medium">
              {s.kind === "own" ? (
                <>
                  <BadgeCheck className="h-3 w-3 text-primary" />
                  Chứng chỉ của nông hộ
                </>
              ) : (
                <>
                  <BadgeCheck className="h-3 w-3 text-primary" />
                  Kế thừa qua HTX: {s.cooperativeName ?? "—"}
                </>
              )}
            </div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 text-muted-foreground">
              <dt>Số giấy:</dt>
              <dd className="text-foreground">{s.certificateNo ?? "—"}</dd>
              <dt>Đơn vị cấp:</dt>
              <dd className="text-foreground">{s.issuer ?? "—"}</dd>
              <dt>Ngày cấp:</dt>
              <dd className="text-foreground">{formatDate(s.issuedAt)}</dd>
              <dt>Hiệu lực đến:</dt>
              <dd className="text-foreground">{formatDate(s.expiresAt)}</dd>
            </dl>
            {s.fileUrl && (
              <a
                href={s.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-primary hover:underline"
              >
                <FileText className="h-3 w-3" />
                Xem giấy chứng nhận
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

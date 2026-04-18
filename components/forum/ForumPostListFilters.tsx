"use client";

import type { ReactNode } from "react";
import { useId } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  FORUM_LABEL_OPTIONS,
  type ForumLabelSlug,
} from "@/constants/forum-labels";
import { cn } from "@/lib/utils";

function FilterChip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        active
          ? "border-primary bg-primary/12 text-primary shadow-sm ring-1 ring-primary/25"
          : "border-border bg-background text-foreground hover:border-primary/35 hover:bg-muted/60",
      )}
    >
      {children}
    </button>
  );
}

export function ForumPostListFilters({
  labelFilter,
  onLabelChange,
  searchDraft,
  onSearchDraftChange,
  searchClassName,
  chipsClassName,
  className,
}: {
  labelFilter: ForumLabelSlug | undefined;
  onLabelChange: (slug: ForumLabelSlug | undefined) => void;
  searchDraft: string;
  onSearchDraftChange: (value: string) => void;
  searchClassName?: string;
  chipsClassName?: string;
  className?: string;
}) {
  const searchId = useId();
  return (
    <div className={cn("space-y-3", className)}>
      <div className={cn("space-y-1.5", searchClassName)}>
        <label
          htmlFor={searchId}
          className="text-sm font-medium text-foreground"
        >
          Tìm kiếm bài viết
        </label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            id={searchId}
            type="search"
            placeholder="Gõ từ khóa trong tiêu đề hoặc nội dung…"
            value={searchDraft}
            onChange={(e) => onSearchDraftChange(e.target.value)}
            maxLength={200}
            className="h-11 w-full border-2 bg-background pl-9 pr-3 shadow-sm"
            autoComplete="off"
          />
        </div>
      </div>
      <div
        className={cn(
          "flex flex-wrap gap-2",
          chipsClassName,
        )}
        role="group"
        aria-label="Lọc theo chủ đề"
      >
        <FilterChip
          active={labelFilter == null}
          onClick={() => onLabelChange(undefined)}
        >
          Tất cả
        </FilterChip>
        {FORUM_LABEL_OPTIONS.map(({ value, label }) => (
          <FilterChip
            key={value}
            active={labelFilter === value}
            onClick={() =>
              onLabelChange(labelFilter === value ? undefined : value)
            }
          >
            {label}
          </FilterChip>
        ))}
      </div>
    </div>
  );
}

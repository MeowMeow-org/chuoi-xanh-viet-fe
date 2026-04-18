"use client";

import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export type FancyOption = { value: string; label: string };

export function FancySelect({
  value,
  onChange,
  options,
  placeholder,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  options: FancyOption[];
  placeholder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState<number>(-1);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const current = options.find((o) => o.value === value) ?? null;

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      const idx = options.findIndex((o) => o.value === value);
      setHighlight(idx >= 0 ? idx : 0);
    }
  }, [open, options, value]);

  const commit = (v: string) => {
    onChange(v);
    setOpen(false);
  };

  const handleKey = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) setOpen(true);
      else
        setHighlight((i) => {
          const max = Math.max(0, options.length - 1);
          return Math.min(max, i + 1);
        });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) setOpen(true);
      else setHighlight((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter" && open) {
      e.preventDefault();
      const opt = options[highlight];
      if (opt) commit(opt.value);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={handleKey}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "flex h-10 w-full items-center justify-between gap-2 rounded-md border bg-background px-3 text-left text-sm shadow-sm transition",
          "hover:border-primary/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          open ? "border-primary ring-2 ring-primary/30" : "border-input",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        <span
          className={cn(
            "truncate",
            current ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {current?.label ?? placeholder ?? "Chọn…"}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition",
            open && !disabled && "rotate-180 text-primary",
          )}
        />
      </button>

      {open && !disabled && (
        <div
          ref={listRef}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-64 overflow-y-auto rounded-md border border-border/60 bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-black/5 animate-in fade-in-0 zoom-in-95"
        >
          {options.length === 0 && (
            <div className="px-3 py-2 text-xs text-muted-foreground">
              Không có lựa chọn
            </div>
          )}
          {options.map((opt, idx) => {
            const selected = opt.value === value;
            const hl = idx === highlight;
            return (
              <button
                type="button"
                key={opt.value}
                role="option"
                aria-selected={selected}
                onMouseEnter={() => setHighlight(idx)}
                onClick={() => commit(opt.value)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-sm px-2.5 py-2 text-left text-sm transition",
                  hl
                    ? "bg-primary/10 text-foreground"
                    : "text-foreground hover:bg-accent hover:text-accent-foreground",
                  selected && "font-medium text-primary",
                )}
              >
                <Check
                  className={cn(
                    "h-4 w-4 shrink-0",
                    selected ? "text-primary" : "text-transparent",
                  )}
                />
                <span className="truncate">{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

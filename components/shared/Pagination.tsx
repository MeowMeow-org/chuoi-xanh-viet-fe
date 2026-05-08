import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { PaginationMeta } from "@/types";
import { cn } from "@/lib/utils";

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination = ({
  meta,
  onPageChange,
  className,
}: PaginationProps) => {
  const currentPage = meta.page;
  const totalPages = meta.totalPages;
  const hasPreviousPage = meta.previousPage !== null;
  const hasNextPage = meta.nextPage !== null;

  if (totalPages <= 1) return null;

  const getPageNumbers = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1);
    if (currentPage > 3) pages.push("...");

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) pages.push(i);

    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);

    return pages;
  };

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex items-center justify-center gap-2", className)}
    >
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPreviousPage}
        aria-label="Go to previous page"
      >
        <ChevronLeftIcon className="size-4" />
      </Button>

      <div className="flex items-center gap-1">
        {getPageNumbers().map((pageItem, index) =>
          pageItem === "..." ? (
            <span key={`ellipsis-${index}`} className="px-2 text-sm text-muted-foreground">
              ...
            </span>
          ) : (
            <Button
              key={pageItem}
              variant={pageItem === currentPage ? "default" : "outline"}
              size="icon"
              onClick={() => onPageChange(pageItem)}
              aria-current={pageItem === currentPage ? "page" : undefined}
            >
              {pageItem}
            </Button>
          ),
        )}
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNextPage}
        aria-label="Go to next page"
      >
        <ChevronRightIcon className="size-4" />
      </Button>
    </nav>
  );
};

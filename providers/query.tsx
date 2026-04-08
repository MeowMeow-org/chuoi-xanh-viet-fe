"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  // Tạo QueryClient instance một lần duy nhất cho mỗi quá trình render (giúp tránh re-render lặp lại client instance ở React 18+)
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false, // Vô hiệu hóa refetch khi chuyển tab
            staleTime: 60 * 1000, // 1 phút
            retry: 1, // Tối đa 1 lần nếu gặp lỗi
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

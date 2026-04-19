// Các trang trong route group (public) đều phụ thuộc vào auth state phía client
// (qua ConsumerLayout / useRequireAuth -> useSearchParams), nên không thể prerender
// tĩnh. Ép render dynamic theo request để tránh lỗi "useSearchParams() should be
// wrapped in a suspense boundary" khi build.
export const dynamic = "force-dynamic";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

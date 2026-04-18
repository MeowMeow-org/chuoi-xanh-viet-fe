/** Khớp whitelist BE `ALLOWED_FORUM_LABELS` — dùng slug khi gọi API */
export const FORUM_LABEL_SLUGS = [
  "ky-thuat-trong",
  "phan-bon",
  "sau-benh",
  "tuoi-nuoc",
  "thu-hoach",
  "bao-quan",
  "thi-truong",
  "khac",
] as const;

export type ForumLabelSlug = (typeof FORUM_LABEL_SLUGS)[number];

export const FORUM_LABEL_OPTIONS: { value: ForumLabelSlug; label: string }[] = [
  { value: "ky-thuat-trong", label: "Kỹ thuật trồng" },
  { value: "phan-bon", label: "Phân bón" },
  { value: "sau-benh", label: "Sâu bệnh" },
  { value: "tuoi-nuoc", label: "Tưới nước" },
  { value: "thu-hoach", label: "Thu hoạch" },
  { value: "bao-quan", label: "Bảo quản" },
  { value: "thi-truong", label: "Thị trường" },
  { value: "khac", label: "Khác" },
];

export function forumSlugToLabel(slug: string): string {
  return (
    FORUM_LABEL_OPTIONS.find((o) => o.value === slug)?.label ?? slug
  );
}

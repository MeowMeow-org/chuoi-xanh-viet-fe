import { z } from "zod";

/** `YYYY-MM-DD` (input type=date) → UTC midnight, so sánh ngày không lệch múi giờ. */
function utcDayFromYmd(ymd: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd.trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (!Number.isFinite(y) || !Number.isFinite(mo) || !Number.isFinite(d))
    return null;
  return Date.UTC(y, mo - 1, d);
}

/** Ngày hôm nay theo lịch local (YYYY-MM-DD), khớp input type=date của trình duyệt. */
function todayLocalYmd(): string {
  const d = new Date();
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${day}`;
}

export const certTypeEnum = z.enum([
  "vietgap",
  "globalgap",
  "organic",
  "other",
]);

export const coopCertCreateSchema = z
  .object({
    type: certTypeEnum,
    certificate_no: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập số giấy")
      .max(120, "Số giấy tối đa 120 ký tự"),
    issuer: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập đơn vị cấp")
      .max(240, "Đơn vị cấp tối đa 240 ký tự"),
    issued_at: z.string().min(1, "Vui lòng chọn ngày cấp"),
    expires_at: z.string().min(1, "Vui lòng chọn ngày hết hiệu lực"),
    file: z.optional(z.instanceof(File)),
  })
  .superRefine((data, ctx) => {
    if (!(data.file instanceof File) || data.file.size === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Vui lòng tải lên file chứng chỉ (PDF hoặc ảnh)",
        path: ["file"],
      });
    }
    const tIssued = utcDayFromYmd(data.issued_at);
    const tExpires = utcDayFromYmd(data.expires_at);
    if (
      tIssued != null &&
      tExpires != null &&
      tExpires < tIssued
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Ngày hết hiệu lực phải sau hoặc trùng ngày cấp",
        path: ["expires_at"],
      });
      return;
    }
    if (tExpires != null) {
      const tToday = utcDayFromYmd(todayLocalYmd());
      if (tToday != null && tExpires < tToday) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Ngày hiệu lực đến không được trước hôm nay (chứng chỉ đã hết hạn).",
          path: ["expires_at"],
        });
      }
    }
  });

export type CoopCertCreateFormValues = z.infer<typeof coopCertCreateSchema>;

/** Form nộp chứng chỉ nông trại (dialog farmer) — chặt hơn BE để UX rõ ràng. */
export const MAX_CERT_FILE_BYTES = 15 * 1024 * 1024; // 15 MB

export function isAllowedCertFileMime(file: File): boolean {
  if (file.type === "application/pdf") return true;
  if (file.type.startsWith("image/")) return true;
  const name = file.name.toLowerCase();
  return /\.(pdf|jpe?g|png|webp|gif)$/i.test(name);
}

export const farmCertUploadFormSchema = z
  .object({
    certNo: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập số giấy")
      .max(120, "Số giấy tối đa 120 ký tự"),
    issuer: z
      .string()
      .trim()
      .min(2, "Vui lòng nhập đơn vị cấp")
      .max(240, "Đơn vị cấp tối đa 240 ký tự"),
    issuedAt: z.string().min(1, "Vui lòng chọn ngày cấp"),
    expiresAt: z.string().min(1, "Vui lòng chọn ngày hết hiệu lực"),
    file: z.union([z.instanceof(File), z.null()]),
  })
  .superRefine((data, ctx) => {
    const f = data.file;
    if (!(f instanceof File) || f.size === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Vui lòng chọn file PDF hoặc ảnh (tối đa 15 MB)",
        path: ["file"],
      });
    } else {
      if (f.size > MAX_CERT_FILE_BYTES) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "File quá lớn (tối đa 15 MB)",
          path: ["file"],
        });
      }
      if (!isAllowedCertFileMime(f)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Chỉ chấp nhận PDF hoặc ảnh (JPEG, PNG, WebP, GIF)",
          path: ["file"],
        });
      }
    }

    const tIssued = utcDayFromYmd(data.issuedAt);
    const tExpires = utcDayFromYmd(data.expiresAt);
    if (tIssued == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Ngày cấp không hợp lệ",
        path: ["issuedAt"],
      });
    }
    if (tExpires == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Ngày hết hiệu lực không hợp lệ",
        path: ["expiresAt"],
      });
    }
    if (tIssued == null || tExpires == null) return;
    if (tExpires < tIssued) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Ngày hết hiệu lực phải sau hoặc cùng ngày cấp",
        path: ["expiresAt"],
      });
      return;
    }
    const tToday = utcDayFromYmd(todayLocalYmd());
    if (tToday != null && tExpires < tToday) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Ngày hiệu lực đến không được trước hôm nay (chứng chỉ đã hết hạn).",
        path: ["expiresAt"],
      });
    }
  });

export type FarmCertUploadFormValues = z.infer<typeof farmCertUploadFormSchema>;

export const farmCertUploadDefaults: FarmCertUploadFormValues = {
  certNo: "",
  issuer: "",
  issuedAt: "",
  expiresAt: "",
  file: null,
};

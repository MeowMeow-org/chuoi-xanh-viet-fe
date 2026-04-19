import { z } from "zod";

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
    const issued = new Date(data.issued_at);
    const expires = new Date(data.expires_at);
    if (
      !Number.isNaN(issued.getTime()) &&
      !Number.isNaN(expires.getTime()) &&
      expires < issued
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Ngày hết hiệu lực phải sau hoặc trùng ngày cấp",
        path: ["expires_at"],
      });
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
      .min(3, "Số giấy tối thiểu 3 ký tự")
      .max(120, "Số giấy tối đa 120 ký tự"),
    issuer: z
      .string()
      .trim()
      .min(2, "Vui lòng nhập đơn vị cấp (tối thiểu 2 ký tự)")
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
      return;
    }
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
    const issued = new Date(data.issuedAt);
    const expires = new Date(data.expiresAt);
    if (Number.isNaN(issued.getTime()) || Number.isNaN(expires.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Ngày không hợp lệ",
        path: ["issuedAt"],
      });
      return;
    }
    if (expires < issued) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Ngày hết hiệu lực phải sau hoặc cùng ngày cấp",
        path: ["expiresAt"],
      });
    }
  });

export type FarmCertUploadFormValues = z.infer<typeof farmCertUploadFormSchema>;

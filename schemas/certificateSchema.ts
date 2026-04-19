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

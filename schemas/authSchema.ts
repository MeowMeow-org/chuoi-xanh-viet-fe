import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Email không hợp lệ").min(1, "Email không được để trống"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    full_name: z.string().min(1, "Họ và tên không được để trống"),
    email: z.email("Email không hợp lệ").min(1, "Email không được để trống"),
    phone: z.string().min(1, "Số điện thoại không được để trống"),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirm_password: z
      .string()
      .min(1, "Xác nhận mật khẩu không được để trống"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirm_password"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

"use client";

import { type FormEvent, useEffect, useState } from "react";
import { CircleAlert, Eye, EyeOff, Leaf, Loader2 } from "lucide-react";

export type AuthView = "login" | "register";

export type LoginCredentials = {
    identifier: string;
    password: string;
};

export type RegisterCredentials = {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
};

type AuthModalProps = {
    open: boolean;
    view: AuthView;
    onClose: () => void;
    onChange: (view: AuthView) => void;
    onLogin: (credentials: LoginCredentials) => Promise<void>;
    onRegister: (credentials: RegisterCredentials) => Promise<void>;
};

export default function AuthModal({ open, view, onClose, onChange, onLogin, onRegister }: AuthModalProps) {
    const [loginCredentials, setLoginCredentials] = useState<LoginCredentials>({
        identifier: "",
        password: "",
    });
    const [registerCredentials, setRegisterCredentials] = useState<RegisterCredentials>({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });
    const [loginError, setLoginError] = useState("");
    const [registerError, setRegisterError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showRegisterPassword, setShowRegisterPassword] = useState(false);
    const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);

    useEffect(() => {
        if (open && view === "login") {
            setLoginError("");
        }

        if (open && view === "register") {
            setRegisterError("");
        }
    }, [open, view]);

    const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        setLoginError("");

        try {
            await onLogin(loginCredentials);
        } catch (error) {
            setLoginError(
                error instanceof Error ? error.message : "Đăng nhập thất bại. Vui lòng thử lại."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRegisterSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setRegisterError("");

        if (!registerCredentials.fullName.trim()) {
            setRegisterError("Vui lòng nhập họ và tên.");
            return;
        }

        if (!registerCredentials.email.trim()) {
            setRegisterError("Vui lòng nhập email.");
            return;
        }

        if (!registerCredentials.phone.trim()) {
            setRegisterError("Vui lòng nhập số điện thoại.");
            return;
        }

        if (registerCredentials.password.length < 6) {
            setRegisterError("Mật khẩu phải có ít nhất 6 ký tự.");
            return;
        }

        if (registerCredentials.password !== registerCredentials.confirmPassword) {
            setRegisterError("Mật khẩu xác nhận không khớp.");
            return;
        }

        setIsSubmitting(true);

        try {
            await onRegister(registerCredentials);
        } catch (error) {
            setRegisterError(
                error instanceof Error ? error.message : "Đăng ký thất bại. Vui lòng thử lại."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
            <div className="auth-modal w-full max-w-3xl overflow-hidden rounded-2xl border border-[hsl(142,15%,88%)] bg-white shadow-xl">
                <div className="grid lg:grid-cols-[1fr_1fr]">
                    <div className="relative overflow-hidden bg-[#0d2a1c] p-8 text-white sm:p-10">
                        <button
                            type="button"
                            onClick={onClose}
                            className="absolute right-4 top-4 h-9 w-9 rounded-full bg-white/10 text-lg leading-none hover:bg-white/20 transition-colors"
                        >
                            ×
                        </button>
                        <div className="inline-flex items-center justify-center gap-2 rounded-xl bg-[hsl(142,71%,45%)]/20 px-3 py-1.5 text-[hsl(142,71%,45%)]">
                            <Leaf className="h-4 w-4" />
                            <span className="text-xs font-bold uppercase tracking-widest">Chuỗi Xanh Việt</span>
                        </div>
                        <h2 className="mt-5 text-2xl font-bold leading-snug">
                            {view === "login"
                                ? "Quay lại để tiếp tục mùa vụ và gian hàng của bạn."
                                : "Tạo tài khoản để bắt đầu hành trình truy xuất minh bạch."}
                        </h2>
                        <div className="mt-8 space-y-3 text-sm text-[hsl(120,10%,95%)]">
                            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[hsl(142,71%,45%)]/20 text-[hsl(142,71%,45%)]">
                                    ✓
                                </span>
                                <span>Đăng nhập bằng email</span>
                            </div>
                            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[hsl(142,71%,45%)]/20 text-[hsl(142,71%,45%)]">
                                    ✓
                                </span>
                                <span>Quản lý nhật ký, truy xuất và đơn hàng</span>
                            </div>
                            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[hsl(142,71%,45%)]/20 text-[hsl(142,71%,45%)]">
                                    ✓
                                </span>
                                <span>Luồng dùng đơn giản cho chuyển đổi số</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 sm:p-8 lg:p-10">
                        <div className="inline-flex rounded-full bg-[hsl(120,10%,95%)] p-1 text-sm font-medium text-[hsl(150,5%,45%)]">
                            <button
                                type="button"
                                onClick={() => onChange("login")}
                                className={`inline-flex h-9 items-center justify-center whitespace-nowrap rounded-full px-5 text-sm font-bold transition-all duration-300 ${view === "login"
                                    ? "bg-[hsl(142,71%,45%)] text-white shadow-md"
                                    : "hover:text-[hsl(150,10%,15%)]"
                                    }`}
                            >
                                Đăng nhập
                            </button>
                            <button
                                type="button"
                                onClick={() => onChange("register")}
                                className={`inline-flex h-9 items-center justify-center whitespace-nowrap rounded-full px-5 text-sm font-bold transition-all duration-300 ${view === "register"
                                    ? "bg-[hsl(142,71%,45%)] text-white shadow-md"
                                    : "hover:text-[hsl(150,10%,15%)]"
                                    }`}
                            >
                                Đăng ký
                            </button>
                        </div>

                        <div className="mt-6 space-y-2">
                            <h3 className="text-xl font-bold text-[hsl(150,10%,15%)]">
                                {view === "login" ? "Đăng nhập vào nền tảng" : "Tạo tài khoản mới"}
                            </h3>
                            <p className="text-sm leading-relaxed text-[hsl(150,5%,45%)]">
                                {view === "login"
                                    ? "Theo dõi mùa vụ, truy xuất và đơn hàng chỉ trong vài bước."
                                    : "Bắt đầu số hóa bằng thao tác tối ưu cho mọi người dùng."}
                            </p>
                        </div>

                        {view === "login" ? (
                            <form className="mt-6 space-y-4" onSubmit={handleLoginSubmit}>
                                <div className="space-y-2">
                                    <input
                                        type="email"
                                        value={loginCredentials.identifier}
                                        onChange={(event) =>
                                            setLoginCredentials((current) => ({
                                                ...current,
                                                identifier: event.target.value,
                                            }))
                                        }
                                        placeholder="Email"
                                        autoComplete="username"
                                        className="w-full rounded-xl border border-[hsl(142,15%,88%)] bg-[hsl(120,20%,98%)] px-4 py-3 text-sm outline-none focus:border-[hsl(142,71%,45%)] focus:bg-white"
                                    />
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={loginCredentials.password}
                                            onChange={(event) =>
                                                setLoginCredentials((current) => ({
                                                    ...current,
                                                    password: event.target.value,
                                                }))
                                            }
                                            placeholder="Mật khẩu"
                                            autoComplete="current-password"
                                            className="w-full rounded-xl border border-[hsl(142,15%,88%)] bg-[hsl(120,20%,98%)] px-4 py-3 pr-11 text-sm outline-none focus:border-[hsl(142,71%,45%)] focus:bg-white"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((current) => !current)}
                                            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(150,5%,45%)] hover:text-[hsl(150,10%,20%)]"
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                {loginError && (
                                    <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                        <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                                        <span>{loginError}</span>
                                    </div>
                                )}

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[hsl(142,71%,45%)] px-5 py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                                    >
                                        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                        {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <form className="mt-6 space-y-4" onSubmit={handleRegisterSubmit}>
                                <input
                                    type="text"
                                    value={registerCredentials.fullName}
                                    onChange={(event) =>
                                        setRegisterCredentials((current) => ({
                                            ...current,
                                            fullName: event.target.value,
                                        }))
                                    }
                                    placeholder="Họ và tên"
                                    autoComplete="name"
                                    className="w-full rounded-xl border border-[hsl(142,15%,88%)] bg-[hsl(120,20%,98%)] px-4 py-3 text-sm outline-none focus:border-[hsl(142,71%,45%)] focus:bg-white"
                                />
                                <input
                                    type="email"
                                    value={registerCredentials.email}
                                    onChange={(event) =>
                                        setRegisterCredentials((current) => ({
                                            ...current,
                                            email: event.target.value,
                                        }))
                                    }
                                    placeholder="Email"
                                    autoComplete="email"
                                    className="w-full rounded-xl border border-[hsl(142,15%,88%)] bg-[hsl(120,20%,98%)] px-4 py-3 text-sm outline-none focus:border-[hsl(142,71%,45%)] focus:bg-white"
                                />
                                <input
                                    type="tel"
                                    value={registerCredentials.phone}
                                    onChange={(event) =>
                                        setRegisterCredentials((current) => ({
                                            ...current,
                                            phone: event.target.value,
                                        }))
                                    }
                                    placeholder="Số điện thoại"
                                    autoComplete="tel"
                                    className="w-full rounded-xl border border-[hsl(142,15%,88%)] bg-[hsl(120,20%,98%)] px-4 py-3 text-sm outline-none focus:border-[hsl(142,71%,45%)] focus:bg-white"
                                />
                                <div className="relative">
                                    <input
                                        type={showRegisterPassword ? "text" : "password"}
                                        value={registerCredentials.password}
                                        onChange={(event) =>
                                            setRegisterCredentials((current) => ({
                                                ...current,
                                                password: event.target.value,
                                            }))
                                        }
                                        placeholder="Mật khẩu"
                                        autoComplete="new-password"
                                        className="w-full rounded-xl border border-[hsl(142,15%,88%)] bg-[hsl(120,20%,98%)] px-4 py-3 pr-11 text-sm outline-none focus:border-[hsl(142,71%,45%)] focus:bg-white"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowRegisterPassword((current) => !current)}
                                        aria-label={showRegisterPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(150,5%,45%)] hover:text-[hsl(150,10%,20%)]"
                                    >
                                        {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                <div className="relative">
                                    <input
                                        type={showRegisterConfirmPassword ? "text" : "password"}
                                        value={registerCredentials.confirmPassword}
                                        onChange={(event) =>
                                            setRegisterCredentials((current) => ({
                                                ...current,
                                                confirmPassword: event.target.value,
                                            }))
                                        }
                                        placeholder="Xác nhận mật khẩu"
                                        autoComplete="new-password"
                                        className="w-full rounded-xl border border-[hsl(142,15%,88%)] bg-[hsl(120,20%,98%)] px-4 py-3 pr-11 text-sm outline-none focus:border-[hsl(142,71%,45%)] focus:bg-white"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowRegisterConfirmPassword((current) => !current)}
                                        aria-label={showRegisterConfirmPassword ? "Ẩn xác nhận mật khẩu" : "Hiện xác nhận mật khẩu"}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(150,5%,45%)] hover:text-[hsl(150,10%,20%)]"
                                    >
                                        {showRegisterConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>

                                {registerError && (
                                    <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                        <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                                        <span>{registerError}</span>
                                    </div>
                                )}

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[hsl(142,71%,45%)] px-5 py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                                    >
                                        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                        {isSubmitting ? "Đang tạo tài khoản..." : "Tạo tài khoản và bắt đầu"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
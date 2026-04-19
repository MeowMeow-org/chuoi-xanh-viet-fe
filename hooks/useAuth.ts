import {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  User,
} from "@/services/auth";
import { authService } from "@/services/auth/authService";
import { clearAuthCookies, saveAuthCookies } from "@/services/auth/storage";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "@/components/ui/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";

const resolveRoleRoute = (role: string | undefined): string | null => {
  const normalizedRole = role?.trim().toLowerCase();

  if (normalizedRole === "admin") return "/admin";
  if (normalizedRole === "farmer") return "/farmer";
  if (normalizedRole === "consumer") return "/consumer";
  if (normalizedRole === "cooperative") {
    return "/cooperative";
  }

  return null;
};

/** Chỉ cho phép redirect về path nội bộ (không host ngoài) để tránh open redirect. */
const sanitizeNext = (value: string | null): string | null => {
  if (!value) return null;
  try {
    const decoded = decodeURIComponent(value);
    if (!decoded.startsWith("/")) return null;
    if (decoded.startsWith("//")) return null;
    return decoded;
  } catch {
    return null;
  }
};

export const useRegisterMutation = () => {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  return useMutation<AuthResponse, Error, RegisterPayload>({
    mutationFn: (data) => authService.register(data),

    onSuccess: (res) => {
      setAuth({
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
        user: res.user,
      });
      saveAuthCookies({ accessToken: res.accessToken, role: res.user.role });
      toast.success("Đăng ký thành công");
      const roleRoute = resolveRoleRoute(res.user.role);
      router.replace(roleRoute ?? "/");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useLoginMutation = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();

  return useMutation<AuthResponse, Error, LoginPayload>({
    mutationFn: (data) => authService.login(data),
    onSuccess: (res) => {
      setAuth({
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
        user: res.user,
      });
      saveAuthCookies({ accessToken: res.accessToken, role: res.user.role });
      toast.success("Đăng nhập thành công");
      const next = sanitizeNext(searchParams?.get("next") ?? null);
      const roleRoute = resolveRoleRoute(res.user.role);
      router.replace(next ?? roleRoute ?? "/");
    },
    onError: () => {
      // error toast handled globally
    },
  });
};

export const useLogoutMutation = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { clearAuth } = useAuthStore();

  return useMutation<void, Error, void>({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      clearAuth();
      void useAuthStore.persist.clearStorage();
      clearAuthCookies();
      queryClient.removeQueries();
      router.replace("/login");
      toast.success("Đăng xuất thành công");
    },
    onError: (error) => {
      clearAuth();
      void useAuthStore.persist.clearStorage();
      clearAuthCookies();
      queryClient.removeQueries();
      router.replace("/login");
      toast.error(error.message);
    },
  });
};

export const authQueryKeys = {
  me: ["auth", "me"] as const,
};

export const useMeQuery = (enabled = true) => {
  return useQuery({
    queryKey: authQueryKeys.me,
    queryFn: () => authService.getMe(),
    enabled,
  });
};

export const usePatchMeMutation = () => {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation<
    User,
    Error,
    { avatarUrl?: string | null; fullName?: string; phone?: string }
  >({
    mutationFn: (payload) => authService.patchMe(payload),
    onSuccess: (user) => {
      const { accessToken, refreshToken } = useAuthStore.getState();
      setAuth({
        accessToken,
        refreshToken,
        user,
      });
      void queryClient.invalidateQueries({ queryKey: authQueryKeys.me });
      toast.success("Đã cập nhật hồ sơ");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useChangePasswordMutation = () => {
  return useMutation<
    void,
    Error,
    { currentPassword: string; newPassword: string; confirm_password: string }
  >({
    mutationFn: (payload) => authService.changePassword(payload),
    onSuccess: () => {
      toast.success("Đã đổi mật khẩu");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

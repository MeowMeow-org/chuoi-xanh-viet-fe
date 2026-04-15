import { AuthResponse, LoginPayload, RegisterPayload } from "@/services/auth";
import { authService } from "@/services/auth/authService";
import { clearAuthCookies, saveAuthCookies } from "@/services/auth/storage";
import { useAuthStore } from "@/store/useAuthStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";

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

export const useRegisterMutation = () => {
  const nav = useNavigate();
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
      toast.success("Register successfully");
      const roleRoute = resolveRoleRoute(res.user.role);
      nav(roleRoute ?? "/", { replace: true });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useLoginMutation = () => {
  const nav = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuthStore();

  // Lấy pathname từ location state, nếu không có thì dùng "/"
  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/";

  return useMutation<AuthResponse, Error, LoginPayload>({
    mutationFn: (data) => authService.login(data),
    onSuccess: (res) => {
      setAuth({
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
        user: res.user,
      });
      saveAuthCookies({ accessToken: res.accessToken, role: res.user.role });
      toast.success("Login successfully");
      const roleRoute = resolveRoleRoute(res.user.role);
      nav(roleRoute ?? from, { replace: true });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useLogoutMutation = () => {
  const nav = useNavigate();
  const queryClient = useQueryClient();

  const { clearAuth } = useAuthStore();

  return useMutation<void, Error, void>({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      clearAuth();
      clearAuthCookies();
      queryClient.removeQueries();
      nav("/login", { replace: true });
      toast.success("Logout successfully");
    },
    onError: (error) => {
      clearAuthCookies();
      toast.error(error.message);
    },
  });
};

import { AuthResponse, LoginPayload, RegisterPayload, User } from "@/services/auth";
import { authService } from "@/services/auth/authService";
import { clearAuthCookies, saveAuthCookies } from "@/services/auth/storage";
import { useAuthStore } from "@/store/useAuthStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
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
      toast.success("Register successfully");
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
      toast.success("Login successfully");
      const roleRoute = resolveRoleRoute(res.user.role);
      router.replace(roleRoute ?? "/");
    },
    onError: (error) => {
      toast.error(error.message);
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
      toast.success("Logout successfully");
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

  return useMutation<User, Error, { avatarUrl: string | null }>({
    mutationFn: (payload) => authService.patchMe(payload),
    onSuccess: (user) => {
      const { accessToken, refreshToken } = useAuthStore.getState();
      setAuth({
        accessToken,
        refreshToken,
        user,
      });
      void queryClient.invalidateQueries({ queryKey: authQueryKeys.me });
      toast.success("Đã cập nhật ảnh đại diện");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

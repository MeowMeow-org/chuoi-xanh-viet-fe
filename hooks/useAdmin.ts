"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  adminService,
  type AdminAccountStatus,
  type AdminUserRole,
} from "@/services/admin";

export const adminQueryKeys = {
  dashboardSummary: ["admin", "dashboard-summary"] as const,
  users: (q?: {
    page?: number;
    limit?: number;
    q?: string;
    role?: AdminUserRole;
    status?: AdminAccountStatus;
  }) => ["admin", "users", q] as const,
  user: (id: string) => ["admin", "user", id] as const,
};

export function useAdminDashboardSummaryQuery() {
  return useQuery({
    queryKey: adminQueryKeys.dashboardSummary,
    queryFn: () => adminService.getDashboardSummary(),
    staleTime: 60 * 1000,
  });
}

export function useAdminUsersQuery(q?: {
  page?: number;
  limit?: number;
  q?: string;
  role?: AdminUserRole;
  status?: AdminAccountStatus;
}) {
  return useQuery({
    queryKey: adminQueryKeys.users(q),
    queryFn: () => adminService.listUsers(q),
    staleTime: 30 * 1000,
  });
}

export function useAdminUserQuery(userId: string | null) {
  return useQuery({
    queryKey: adminQueryKeys.user(userId ?? ""),
    queryFn: () => adminService.getUser(userId as string),
    enabled: !!userId,
  });
}

export function useAdminPatchUserStatusMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      status,
    }: {
      userId: string;
      status: "active" | "suspended";
    }) => adminService.patchUserStatus(userId, { status }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "users"] });
      void qc.invalidateQueries({ queryKey: ["admin", "user"] });
      void qc.invalidateQueries({ queryKey: adminQueryKeys.dashboardSummary });
    },
  });
}

export function useAdminBroadcastMutation() {
  return useMutation({
    mutationFn: adminService.broadcast,
  });
}

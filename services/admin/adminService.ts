import { axiosInstance } from "@/lib/axios";
import type { PaginatedResponse } from "@/types";

export type AdminUserRole = "consumer" | "farmer" | "cooperative" | "admin";
export type AdminAccountStatus = "active" | "pending" | "suspended";

export type AdminDashboardSummary = {
  users: {
    total: number;
    byRole: Record<AdminUserRole, number>;
    byStatus: Record<AdminAccountStatus, number>;
  };
  orders: {
    byStatus: Record<string, number>;
  };
  pendingFarmCertificatesAdminScope: number;
  last7Days: {
    newUsers: number;
    newOrders: number;
  };
};

export type AdminUserListItem = {
  id: string;
  phone: string;
  email: string | null;
  full_name: string;
  role: AdminUserRole;
  status: AdminAccountStatus;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type AdminUserDetail = AdminUserListItem & {
  zalo_user_id: string | null;
};

export type BroadcastAudience = "all" | "consumers" | "farmers" | "cooperatives";

export type BroadcastResult = {
  sentCount: number;
  recipientTotal: number;
  batchId: string;
};

export const adminService = {
  getDashboardSummary: async (): Promise<AdminDashboardSummary> => {
    return axiosInstance.get<AdminDashboardSummary, AdminDashboardSummary>(
      "/admin/dashboard/summary",
    );
  },

  listUsers: async (params?: {
    page?: number;
    limit?: number;
    q?: string;
    role?: AdminUserRole;
    status?: AdminAccountStatus;
  }): Promise<PaginatedResponse<AdminUserListItem>> => {
    return axiosInstance.get<
      PaginatedResponse<AdminUserListItem>,
      PaginatedResponse<AdminUserListItem>
    >("/admin/users", { params });
  },

  getUser: async (userId: string): Promise<AdminUserDetail> => {
    return axiosInstance.get<AdminUserDetail, AdminUserDetail>(
      `/admin/users/${userId}`,
    );
  },

  patchUserStatus: async (
    userId: string,
    body: { status: "active" | "suspended" },
  ): Promise<AdminUserListItem> => {
    return axiosInstance.patch<AdminUserListItem, AdminUserListItem>(
      `/admin/users/${userId}/status`,
      body,
    );
  },

  broadcast: async (body: {
    title: string;
    body: string;
    audience: BroadcastAudience;
    linkPath?: string;
  }): Promise<BroadcastResult> => {
    return axiosInstance.post<BroadcastResult, BroadcastResult>(
      "/admin/notifications/broadcast",
      body,
    );
  },
};

export const ADMIN_ROLE_LABEL: Record<AdminUserRole, string> = {
  consumer: "Khách hàng",
  farmer: "Nông hộ",
  cooperative: "HTX",
  admin: "Quản trị",
};

export const ADMIN_STATUS_LABEL: Record<AdminAccountStatus, string> = {
  active: "Hoạt động",
  pending: "Chờ xử lý",
  suspended: "Đã khóa",
};

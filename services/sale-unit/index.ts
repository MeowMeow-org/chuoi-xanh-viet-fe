export type SaleUnitStatus = "active" | "sold" | "disabled";

export interface SaleUnit {
  id: string;
  seasonId: string;
  code: string;
  quantity: string;
  unit: string;
  qrToken: string;
  qrUrl: string;
  shortCode: string | null;
  status: SaleUnitStatus;
  createdAt: string;
}

export interface CreateSaleUnitPayload {
  seasonId: string;
  quantity: number;
  unit?: string;
  shortCode?: string;
}

export interface SaleUnitTotals {
  actualYield: number;
  yieldUnit: string | null;
  /** Quy đổi sản lượng mùa về kg (để cộng với các lô tấn/kg/gam). */
  actualYieldKg: number;
  allocatedKg: number;
  remainingKg: number;
}

export interface SaleUnitListResponse {
  items: SaleUnit[];
  totals: SaleUnitTotals;
}

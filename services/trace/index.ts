import type { SeasonStatus } from "@/services/season";
import type { SaleUnit } from "@/services/sale-unit";
import type { InspectionAttachment } from "@/services/inspection";

export interface TraceFarmInfo {
  id: string;
  name: string;
  areaHa: string | null;
  cropMain: string | null;
  province: string | null;
  district: string | null;
  ward: string | null;
  address: string | null;
  latitude: string | null;
  longitude: string | null;
  inCooperative: boolean;
}

export interface TraceOwnerInfo {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
}

export interface TraceCooperativeInfo {
  verifiedAt: string | null;
  cooperativeUser: {
    id: string;
    fullName: string;
    email: string | null;
    avatarUrl: string | null;
  };
}

/** Payload lưu trong `diary_entries.extra_data` khi chạy scan AI (xem diary-scan.service BE). */
export interface TraceAiScanExtraData {
  type: "ai_scan_result";
  scannedAt: string;
  overallRisk: "safe" | "warning" | "critical";
  violations: Array<{
    severity: "info" | "warning" | "critical";
    code: string;
    title: string;
    detail: string;
    relatedEntryIds: string[];
    recommendation: string;
  }>;
  summary: string;
}

export interface TraceDiaryEntry {
  id: string;
  seasonId: string;
  farmId: string;
  actorUserId: string;
  eventType: string;
  eventDate: string;
  serverTimestamp: string;
  description: string | null;
  extraData: unknown;
  createdAt: string;
  attachments: InspectionAttachment[];
  actor: {
    id: string;
    fullName: string;
    role: string;
  } | null;
}

export interface TraceAnchor {
  id: string;
  checkpointNo: number;
  checkpointType: string;
  isFinal: boolean;
  dataHash: string;
  chainNetwork: string | null;
  txHash: string | null;
  txUrl: string | null;
  status: "pending" | "anchored" | "failed";
  anchoredAt: string | null;
  anchorMeta: unknown;
  createdAt: string;
}

export interface TraceSeasonDetail {
  season: {
    id: string;
    farmId: string;
    code: string;
    cropName: string;
    startDate: string;
    harvestStartDate: string | null;
    harvestEndDate: string | null;
    estimatedYield: string | null;
    actualYield: string | null;
    yieldUnit: string | null;
    status: SeasonStatus;
    sealedAt: string | null;
    createdAt: string;
    updatedAt: string;
  };
  farm: TraceFarmInfo;
  owner: TraceOwnerInfo | null;
  cooperative: TraceCooperativeInfo | null;
  diaries: TraceDiaryEntry[];
  saleUnits: SaleUnit[];
  anchors: TraceAnchor[];
}

export interface TraceVerifyResult {
  currentHash: string;
  onChainHash: string | null;
  match: boolean | null;
  anchor: TraceAnchor | null;
}

export type TraceResolveResult = SaleUnit;

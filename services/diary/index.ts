/** Khớp Prisma / POST /diary */
export type DiaryEventType =
  | "land_prep"
  | "sowing"
  | "fertilizing"
  | "pesticide"
  | "irrigation"
  | "harvesting"
  | "packing"
  | "inspection"
  | "other";

export interface DiaryAttachment {
  id: string;
  diaryEntryId: string;
  fileUrl: string;
  mimeType: string | null;
  sortOrder: number;
  meta: unknown;
  createdAt: string;
}

export interface DiaryEntry {
  id: string;
  seasonId: string;
  farmId: string;
  actorUserId: string;
  eventType: DiaryEventType;
  eventDate: string;
  serverTimestamp: string;
  description: string | null;
  extraData: unknown;
  createdAt: string;
  /** Có từ GET /diary và GET /diary/:id (BE include); create trả về có thể chưa có. */
  attachments?: DiaryAttachment[];
}

export interface AddDiaryAttachmentPayload {
  fileUrl: string;
  mimeType?: string | null;
  sortOrder?: number;
  meta?: Record<string, unknown> | null;
}

export interface CreateDiaryPayload {
  seasonId: string;
  farmId: string;
  eventType: DiaryEventType;
  eventDate: string;
  description?: string;
  extraData?: Record<string, unknown> | null;
}

export interface GetDiariesQuery {
  seasonId?: string;
  farmId?: string;
  eventType?: DiaryEventType;
  page?: number;
  limit?: number;
}

export type ScanSeverity = "info" | "warning" | "critical";
export type OverallRisk = "safe" | "warning" | "critical";

export interface ScanViolation {
  severity: ScanSeverity;
  code: string;
  title: string;
  detail: string;
  relatedEntryIds: string[];
  recommendation: string;
}

export interface DiaryScanResult {
  seasonId: string;
  scannedAt: string;
  overallRisk: OverallRisk;
  violations: ScanViolation[];
  summary: string;
}

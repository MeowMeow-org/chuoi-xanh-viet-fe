/** Khớp Prisma / POST /diary */
export type DiaryEventType =
  | "land_prep"
  | "sowing"
  | "fertilizing"
  | "pesticide"
  | "irrigation"
  | "harvesting"
  | "packing"
  | "other";

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

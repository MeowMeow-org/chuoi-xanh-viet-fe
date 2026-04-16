export type DiaryEventType =
  | "prepare_soil"
  | "seed_sowing"
  | "transplanting"
  | "irrigation"
  | "fertilizing"
  | "pesticide"
  | "weed_control"
  | "harvest"
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

export interface GetDiariesQuery {
  seasonId?: string;
  farmId?: string;
  eventType?: DiaryEventType;
  page?: number;
  limit?: number;
}

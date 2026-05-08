export type InspectionVerdict = "pass" | "fail" | "needs_work";

export interface InspectionAttachment {
  id: string;
  fileUrl: string;
  objectKey: string | null;
  mimeType: string | null;
  sortOrder: number;
  meta: unknown;
}

export interface InspectionEntry {
  id: string;
  seasonId: string;
  farmId: string;
  actorUserId: string;
  eventType: string;
  eventDate: string;
  serverTimestamp: string;
  description: string | null;
  extraData: {
    verdict?: InspectionVerdict;
    summary?: string | null;
    inspectorRole?: string;
  } | null;
  createdAt: string;
  attachments: InspectionAttachment[];
  inspector: {
    id: string;
    fullName: string;
    email: string | null;
  } | null;
}

export interface CreateInspectionPayload {
  seasonId: string;
  verdict: InspectionVerdict;
  summary?: string;
  eventDate?: string;
  attachments?: Array<{
    objectKey?: string;
    fileUrl: string;
    mimeType?: string | null;
    sortOrder?: number;
  }>;
}

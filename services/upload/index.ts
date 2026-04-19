export interface UploadedImageItem {
  success: boolean;
  url: string;
  thumb: string;
  id: string;
  size: number;
  aspect_ratio: number;
  forumImage: {
    objectKey: string;
    url: string;
  };
}

export interface UploadImagesResponse {
  items: UploadedImageItem[];
}

export interface UploadedDocumentItem {
  success: boolean;
  url: string;
  id: string;
  name: string;
  size: number;
  mimeType: string;
}

export interface UploadDocumentsResponse {
  items: UploadedDocumentItem[];
}

import { axiosInstance } from "@/lib/axios";
import type {
  UploadDocumentsResponse,
  UploadImagesResponse,
} from "./index";

export const uploadService = {
  uploadImages: async (files: File[]): Promise<UploadImagesResponse> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("images", file);
    });
    return axiosInstance.post<UploadImagesResponse, UploadImagesResponse>(
      "/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
  },

  uploadDocuments: async (
    files: File[],
  ): Promise<UploadDocumentsResponse> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("documents", file);
    });
    return axiosInstance.post<UploadDocumentsResponse, UploadDocumentsResponse>(
      "/upload/documents",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
  },
};

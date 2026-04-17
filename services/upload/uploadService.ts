import { axiosInstance } from "@/lib/axios";
import type { UploadImagesResponse } from "./index";

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
};

// lib/types/upload.ts
export interface UploadState {
  currentStep: UploadStep;
  videoFile: File | null;
  preview: string | null;
  thumbnails: string[];
  selectedThumbnail: string | null;
  videoId: string;
  title: string;
  description: string;
  tags: string[];
  categoryId: string;
  upload: {
    bytesUploaded: number;
    bytesTotal: number;
    bytePercentage: number;
    speed: number; // bytes per second
    timeRemaining: number | null; // seconds
  };
  isUploading: boolean;
  isProcessing: boolean;
  uploadError: Error | null;
  validationErrors: Record<string, string>;
  dragActive: boolean;
}

export type UploadStep =
  | "select"
  | "upload"
  | "details"
  | "processing"
  | "complete";

export const initialUploadState: UploadState = {
  currentStep: "select",
  videoFile: null,
  preview: null,
  thumbnails: [],
  selectedThumbnail: null,
  videoId: "",
  title: "",
  description: "",
  tags: [],
  categoryId: "",
  upload: {
    bytesUploaded: 0,
    bytesTotal: 0,
    bytePercentage: 0,
    speed: 0,
    timeRemaining: null,
  },
  isUploading: false,
  isProcessing: false,
  uploadError: null,
  validationErrors: {},
  dragActive: false,
};

export interface LocalState {
  title: string;
  description: string;
  categoryId: string;
  tags: string[];
  thumbnail?: string;
  videoFile?: File;
  videoUrl?: string;
  videoId?: string;
  visibility: 'PUBLIC' | 'PRIVATE' | 'UNLISTED';
  dragActive?: boolean;
}

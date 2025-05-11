"use client";

import type React from "react";
import { useRef, useState } from "react";
import { X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import * as tus from "tus-js-client";
import { nanoid } from "nanoid";
import {
  createVideo,
  getPresignedSignature,
  uploadVideoThumbnail,
} from "@/lib/actions/bunny";
import { createVideoRecord } from "@/lib/actions/stream";
import type { UploadState } from "@/lib/types/upload";
import ThumbnailSelector from "./thumbnail-selector";
import { getReliableTimestamp } from "@/lib/utils/time";

interface VideoPreviewProps {
  state: UploadState;
  setState: React.Dispatch<React.SetStateAction<UploadState>>;
  userId: string;
  isUploading: boolean;
  setIsUploading: React.Dispatch<React.SetStateAction<boolean>>;
  setVideoUploaded: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function VideoPreview({
  state,
  setState,
  userId,
  isUploading,
  setIsUploading,
  setVideoUploaded,
}: VideoPreviewProps) {
  const photoRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [uploadStarted, setUploadStarted] = useState(false);
  const uploadRef = useRef<tus.Upload | null>(null);
  const [videoUploaded, setVideoUploadedState] = useState(false);
  const [uploadError, setUploadError] = useState(false);
  const uploadInitiatedRef = useRef(false); // Ref to track if upload has been initiated

  const getVideoId = async (title: string) => {
    if (state.videoId) return state.videoId;
    const result = await createVideo(title);
    if (!result.data) throw new Error(result.message);
    setState((prev) => ({ ...prev, videoId: result.data.guid }));
    return result.data.guid;
  };

  const handleThumbnailUpload = async (
    file: File,
    selectedThumbnail?: string
  ) => {
    try {
      const filename = getFilename(file);
      const videoId =
        state.videoId || (await getVideoId(state.title || "Untitled"));

      const result = await uploadVideoThumbnail(
        file,
        videoId,
        filename
      );

      if (!result.data) {
        toast({
          variant: "destructive",
          title: "Thumbnail upload failed",
          description: "Failed to upload thumbnail.",
        });
        return;
      }

      setState((prev: UploadState) => ({
        ...prev,
        selectedThumbnail: selectedThumbnail || result.data.url,
        thumbnails: selectedThumbnail
          ? prev.thumbnails
          : [result.data.url, ...prev.thumbnails.filter((item) => item.startsWith("https"))],
      }));
    } catch (error) {
      console.error("Error uploading thumbnail:", error);
      toast({
        variant: "destructive",
        title: "Thumbnail upload failed",
        description: "An error occurred while uploading the thumbnail.",
      });
    }
  };

  const changeVideoThumbnail = async (data: string) => {
    if (data === state.selectedThumbnail) return;
    const filename = `thumbnail_vt_${nanoid(10)}.jpg`;

    setState((prev: UploadState) => ({ ...prev, selectedThumbnail: data }));
    
    if (data.startsWith("data:image")) {
      const file = base64ToFile(data, filename);
      await handleThumbnailUpload(file, data);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please select a video file.",
      });
      return;
    }

    setState((prev: UploadState) => ({
      ...prev,
      videoFile: file,
      preview: URL.createObjectURL(file),
      title: file.name.split(".").slice(0, -1).join("."),
      thumbnails: [],
      selectedThumbnail: null,
      videoId: "",
      upload: {
        bytesUploaded: 0,
        bytesTotal: 0,
        bytePercentage: 0,
        speed: 0,
        timeRemaining: null,
      },
      dragActive: false,
    }));
  };

  const removeFile = () => {
    if (state.preview) {
      URL.revokeObjectURL(state.preview);
    }
    setState((prev: UploadState) => ({
      ...prev,
      videoFile: null,
      preview: null,
      title: "",
      thumbnails: [],
      selectedThumbnail: null,
      videoId: "",
      upload: {
        bytesUploaded: 0,
        bytesTotal: 0,
        bytePercentage: 0,
        speed: 0,
        timeRemaining: null,
      },
      dragActive: false,
    }));
  };

  const startUpload = async () => {
    // Guard against multiple upload initiations
    if (uploadInitiatedRef.current || !state.videoFile) return;
    uploadInitiatedRef.current = true;

    try {
      setIsUploading(true);
      setUploadStarted(true);
      setVideoUploaded(false);
      setVideoUploadedState(false);
      setUploadError(false);
      setState((prev: UploadState) => ({ ...prev, loading: true }));

      // Get reliable timestamp
      const timestamp = await getReliableTimestamp();
      
      // Set expiry time with extra buffer
      const expiresIn = timestamp + 10800; // 3 hours
      
      const title = state.title.trim().length > 0 ? state.title : "Untitled";
      const videoId = await getVideoId(title);
      const signature = await getPresignedSignature(videoId, expiresIn);

      const upload = new tus.Upload(state.videoFile, {
        endpoint: process.env.NEXT_PUBLIC_BUNNY_TUS_ENDPOINT!,
        retryDelays: [0, 3000, 5000, 10000, 20000],
        headers: {
          AuthorizationSignature: signature,
          AuthorizationExpire: expiresIn.toString(),
          VideoId: videoId,
          LibraryId: process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID!,
        },
        metadata: {
          filename: state.videoFile.name,
          filetype: state.videoFile.type,
          title,
          thumbnailTime: "2",
        },
        onError: (error) => {
          console.error("Upload failed:", error);
          
          // Enhanced error logging with more details
          let errorMessage = "Failed to upload video. Please try again.";
          
          if (error && error.message) {
            console.error("Error details:", error.message);
            
            // Extract more specific error information
            if (error.message.includes("Invalid expiry time")) {
              errorMessage = "Time synchronization error. Please try again.";
              // Force retry with corrected server time
              setTimeout(() => {
                uploadInitiatedRef.current = false;
                handleRetryUpload();
              }, 1000);
            } else if (error.message.includes("network")) {
              errorMessage = "Network error. Please check your connection and try again.";
            }
          }
          
          setState((prev: UploadState) => ({ ...prev, loading: false }));
          setIsUploading(false);
          setVideoUploaded(false);
          setVideoUploadedState(false);
          setUploadError(true);
          uploadInitiatedRef.current = false;
          
          toast({
            variant: "destructive",
            title: "Upload failed",
            description: errorMessage,
          });
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          const bytePercentage = (bytesUploaded / bytesTotal) * 100;
          setState((prev: UploadState) => ({
            ...prev,
            upload: { 
              bytesUploaded, 
              bytesTotal, 
              bytePercentage,
              speed: prev.upload.speed,
              timeRemaining: prev.upload.timeRemaining
            },
          }));
        },
        onSuccess: async () => {
          try {
            setVideoUploaded(true);
            setVideoUploadedState(true);
            setState((prev: UploadState) => ({ ...prev, loading: false }));
            
            // Create video record
            await createVideoRecord({
              videoId,
              title,
              userId,
            });

            toast({
              title: "Upload complete",
              description: "Your video has been uploaded successfully.",
            });
          } catch (error) {
            console.error("Error creating video record:", error);
            setUploadError(true);
            toast({
              variant: "destructive",
              title: "Record creation failed",
              description: "Failed to create video record. Please try again.",
            });
          } finally {
            setIsUploading(false);
            uploadInitiatedRef.current = false;
          }
        },
      });

      uploadRef.current = upload;
      upload.start();
    } catch (error) {
      console.error("Error setting up upload:", error);
      setState((prev: UploadState) => ({ ...prev, loading: false }));
      setIsUploading(false);
      setUploadStarted(false);
      setVideoUploaded(false);
      setVideoUploadedState(false);
      setUploadError(true);
      uploadInitiatedRef.current = false;
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "An error occurred during upload setup.",
      });
    }
  };

  // Manual upload button handler
  const handleStartUpload = () => {
    startUpload();
  };

  // Retry upload button handler
  const handleRetryUpload = () => {
    uploadInitiatedRef.current = false;
    startUpload();
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">{state.videoFile?.name}</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={removeFile}
          disabled={isUploading}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {state.preview && (
        <div className="aspect-video bg-black rounded-md overflow-hidden mb-4">
          <video src={state.preview} controls className="w-full h-full" />
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 text-sm mb-4">
        <div className="text-muted-foreground">Size:</div>
        <div>{formatBytes(state.videoFile?.size || 0)}</div>

        <div className="text-muted-foreground">Status:</div>
        <div>
          {isUploading ? (
            <span className="text-amber-500">Uploading...</span>
          ) : videoUploaded ? (
            <span className="text-green-500">Uploaded</span>
          ) : uploadError ? (
            <span className="text-red-500">Failed</span>
          ) : (
            <span className="text-gray-500">Ready to upload</span>
          )}
        </div>
      </div>

      {state.thumbnails.length > 0 && (
        <ThumbnailSelector
          thumbnails={state.thumbnails}
          selectedThumbnail={state.selectedThumbnail || undefined}
          onSelect={changeVideoThumbnail}
        />
      )}

      {isUploading ? (
        <div className="space-y-2 mt-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
              style={{ width: `${state.upload.bytePercentage}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Uploading... {state.upload.bytePercentage.toFixed(0)}%
          </p>
        </div>
      ) : !videoUploaded ? (
        <div className="mt-4">
          <Button
            onClick={uploadError ? handleRetryUpload : handleStartUpload}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            {uploadError ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4" /> Retry Upload
              </>
            ) : (
              "Start Upload"
            )}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

// Utility functions
const getFilename = (file: File): string => {
  const extension = file.name.split(".").pop();
  return `thumbnail_${nanoid(10)}.${extension}`;
};

const base64ToFile = (base64: string, filename: string): File => {
  const arr = base64.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
};

const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

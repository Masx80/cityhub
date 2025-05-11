"use client";

import type React from "react";
import { useRef } from "react";
import { Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import type { LocalState } from "@/lib/types/upload";
import { generateThumbnails } from "@/lib/utils/video";

interface VideoDropzoneProps {
  state: LocalState;
  setState: React.Dispatch<React.SetStateAction<LocalState>>;
}

export default function VideoDropzone({ state, setState }: VideoDropzoneProps) {
  const videoRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const processingRef = useRef(false); // Ref to track if we're already processing a file

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setState((prev) => ({
      ...prev,
      dragActive: e.type === "dragenter" || e.type === "dragover",
    }));
  };

  const processVideoFile = async (file: File) => {
    // Guard against processing the same file multiple times
    if (processingRef.current) return;
    processingRef.current = true;

    try {
      if (!file.type.startsWith("video/")) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please upload a video file.",
        });
        processingRef.current = false;
        return;
      }

      // Set the video file in state
      setState((prev) => ({
        ...prev,
        videoFile: file,
        preview: URL.createObjectURL(file),
        title: file.name.split(".").slice(0, -1).join("."),
      }));

      // Generate thumbnails
      try {
        const thumbnails = await generateThumbnails(file);
        setState((prev) => ({ ...prev, thumbnails }));
      } catch (error) {
        console.error("Error generating thumbnails:", error);
        toast({
          variant: "destructive",
          title: "Thumbnail generation failed",
          description: "Failed to generate video thumbnails.",
        });
      }
    } catch (error) {
      console.error("Error processing video file:", error);
      toast({
        variant: "destructive",
        title: "Processing failed",
        description: "An error occurred while processing the video file.",
      });
    } finally {
      processingRef.current = false;
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setState((prev) => ({ ...prev, dragActive: false }));

    if (e.dataTransfer.files?.[0]) {
      await processVideoFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileUpload = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    const files = ev.target.files;
    if (!files || !files[0]) return;
    await processVideoFile(files[0]);
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center ${
        state.dragActive ? "border-primary bg-primary/5" : "border-border"
      }`}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
    >
      <Upload className="h-12 w-12 text-muted-foreground mb-4" />
      <h2 className="text-xl font-medium mb-2">
        Drag and drop video files to upload
      </h2>
      <p className="text-muted-foreground mb-4 text-center">
        Your videos will be private until you publish them
      </p>
      <div className="flex items-center gap-2">
        <Input
          ref={videoRef}
          id="video-upload"
          type="file"
          accept="video/*"
          className="hidden"
          onChange={handleFileUpload}
        />
        <Label
          htmlFor="video-upload"
          className="cursor-pointer inline-flex h-10 items-center justify-center rounded-md bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-4 py-2 text-sm font-medium text-white"
        >
          SELECT FILE
        </Label>
      </div>
    </div>
  );
}

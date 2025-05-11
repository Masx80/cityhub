"use client";

import type React from "react";
import { useRef, useState } from "react";
import { Upload, FileVideo, X, Info, ImagePlus, Camera, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useUpload } from "@/components/upload/upload-provider";
import { generateThumbnails } from "@/lib/utils/video";
import ThumbnailSelector from "../thumbnail-selector";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Loader2 } from "lucide-react";

export default function FileSelectStep() {
  const {
    videoFile,
    setVideoFile,
    filePreview,
    startUpload,
    setThumbnails,
    thumbnails,
    videoDetails,
    updateVideoDetails,
    updateThumbnail,
  } = useUpload();
  const { toast } = useToast();
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStep, setUploadStep] = useState<'initial' | 'selected'>('initial');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else {
      setDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      // Validate file
      if (!file.type.startsWith("video/")) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please upload a video file.",
        });
        return;
      }

      // Check file size limit (1.5GB)
      const maxSize = 1.5 * 1024 * 1024 * 1024; // 1.5GB in bytes
      if (file.size > maxSize) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please upload a video smaller than 1.5GB.",
        });
        return;
      }

      // For mobile devices, warn about large files with clearer messaging
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        // More aggressive warning for larger files on mobile
        if (file.size > 100 * 1024 * 1024) { // 100MB
          toast({
            variant: isMobile && file.size > 300 * 1024 * 1024 ? "destructive" : "default",
            title: "Large file on mobile device",
            description: file.size > 300 * 1024 * 1024 
              ? "Files over 300MB may fail on mobile. Consider using a desktop device."
              : "Large files may be difficult to upload on mobile connections. Please use WiFi.",
          });
        }
      }

      // Set the file
      setVideoFile(file);
      setUploadStep('selected');

      // Auto set title from filename if empty
      if (!videoDetails.title) {
        const fileName = file.name.split(".").slice(0, -1).join(".");
        updateVideoDetails("title", fileName);
      }

      toast({
        title: "Video selected",
        description: "Generating thumbnails...",
      });

      // Generate thumbnails
      try {
        const thumbs = await generateThumbnails(file);
        setThumbnails(thumbs);

        // Auto-select the first thumbnail
        if (thumbs.length > 0) {
          updateThumbnail(thumbs[0]);
        }

        toast({
          title: "Ready to upload",
          description: "Thumbnails generated successfully.",
        });
      } catch (error) {
        console.error("Error generating thumbnails:", error);
        toast({
          variant: "destructive",
          title: "Thumbnail generation failed",
          description: "Failed to generate video thumbnails.",
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    setVideoFile(null);
    setThumbnails([]);
    updateVideoDetails("title", "");
    updateVideoDetails("thumbnail", "");
    updateVideoDetails("selectedThumbnail", undefined);
    setUploadStep('initial');
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleStartUpload = async () => {
    try {
      setIsUploading(true);
      
      // Check if on mobile and give additional warning for large files
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile && videoFile && videoFile.size > 300 * 1024 * 1024) {
        toast({
          variant: "default",
          title: "Large file upload on mobile",
          description: "For best results with large files, please ensure you're on a stable WiFi connection.",
        });
        
        // Add a small delay to ensure the user sees the warning
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Show a toast to indicate upload is starting
      toast({
        title: "Starting upload",
        description: "Please wait while we prepare your upload...",
      });
      
      // Add a small delay to ensure UI updates before potentially intensive operations
      await new Promise(resolve => setTimeout(resolve, 300));
      
      await startUpload();
      // Note: startUpload will navigate to the next step, so we don't need to set isUploading back to false
    } catch (error) {
      console.error("Error in handleStartUpload:", error);
      setIsUploading(false);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "Failed to start upload process. Please try again.",
      });
    }
  };

  return (
    <AnimatePresence mode="wait">
      {uploadStep === 'initial' ? (
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          key="initial"
        >
          <div
            className={`border-2 border-dashed rounded-lg ${
              dragActive ? "border-primary bg-primary/5" : "border-border"
            } transition-all duration-200 overflow-hidden`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
          >
            <Input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleChange}
              className="hidden"
              disabled={isProcessing}
            />
            
            <div className="grid md:grid-cols-2">
              <div className="p-6 sm:p-10 flex flex-col items-center justify-center text-center">
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                  <Upload className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                </div>
                <h2 className="text-lg sm:text-xl font-semibold mb-2">
                  Drag and drop video files
                </h2>
                <p className="text-muted-foreground mb-6 text-sm">
                  Your videos will be private until you publish them
                </p>
                <Button 
                  onClick={handleClick}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-4 py-2 h-auto"
                  disabled={isProcessing}
                >
                  SELECT FILES
                </Button>
                <p className="text-xs text-muted-foreground mt-4">
                  By submitting your videos, you agree to our Terms of Service
                </p>
              </div>

              <div className="hidden md:flex flex-col border-l bg-muted/30 p-6 sm:p-10">
                <h3 className="font-medium mb-4">Upload tips</h3>
                <ul className="space-y-4 text-sm">
                  <li className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-full flex-shrink-0 mt-0.5">
                      <Clock className="h-4 w-4 text-primary" />
                    </div>
                    <span>Videos under 15 minutes process faster</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-full flex-shrink-0 mt-0.5">
                      <ImagePlus className="h-4 w-4 text-primary" />
                    </div>
                    <span>Custom thumbnails increase viewer engagement</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-full flex-shrink-0 mt-0.5">
                      <Camera className="h-4 w-4 text-primary" />
                    </div>
                    <span>Higher resolution videos provide better quality</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-full flex-shrink-0 mt-0.5">
                      <Info className="h-4 w-4 text-primary" />
                    </div>
                    <span>Max file size: 1.5GB • MP4, MOV, AVI, etc.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="md:hidden space-y-4 bg-muted/30 p-4 rounded-lg">
            <h3 className="font-medium">Upload tips</h3>
            <ul className="space-y-3 text-xs">
              <li className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-primary" />
                <span>Videos under 15 minutes process faster</span>
              </li>
              <li className="flex items-center gap-2">
                <Info className="h-3.5 w-3.5 text-primary" />
                <span>Max file size: 1.5GB • MP4, MOV, AVI, etc.</span>
              </li>
            </ul>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          key="selected"
        >
          <div className="border rounded-lg overflow-hidden bg-card">
            <div className="border-b p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Selected Video</h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={removeFile}
                        className="text-muted-foreground"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Remove video</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex items-center mb-4">
                <FileVideo className="h-6 w-6 text-primary mr-3 flex-shrink-0" />
                <div className="overflow-hidden flex-1">
                  <h3 className="font-medium truncate">
                    {videoFile?.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {videoFile && (videoFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {filePreview && (
                    <div className="aspect-video bg-black rounded-md overflow-hidden border">
                      <video src={filePreview} controls className="w-full h-full" />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="title" className="font-medium flex items-center">
                      Title <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="Add a title that describes your video"
                      value={videoDetails.title}
                      onChange={(e) => updateVideoDetails("title", e.target.value)}
                      className="focus-visible:ring-primary"
                    />
                    <p className="text-xs text-muted-foreground">
                      A good title helps viewers find your video
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="font-medium flex items-center">
                      Thumbnail <span className="text-red-500 ml-1">*</span>
                    </Label>
                    {thumbnails.length > 0 ? (
                      <ThumbnailSelector
                        thumbnails={thumbnails}
                        selectedThumbnail={videoDetails.selectedThumbnail}
                        onSelect={updateThumbnail}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-32 bg-muted rounded-md">
                        <p className="text-sm text-muted-foreground flex items-center">
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating thumbnails...
                        </p>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Select a thumbnail or upload your own
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-muted/30 p-4 sm:p-6 flex justify-end border-t">
              <Button
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 min-w-28 px-4 py-2 h-auto"
                onClick={handleStartUpload}
                disabled={
                  isProcessing ||
                  !videoDetails.title ||
                  !videoDetails.selectedThumbnail ||
                  isUploading
                }
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : isProcessing ? "Processing..." : "Continue"}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

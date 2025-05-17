"use client";
import { Clock, LoaderCircle, XCircle, RefreshCw, CheckCircle2, AlertCircle, FileVideo, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUpload } from "@/components/upload/upload-provider";
import { formatBytes, formatTime } from "@/lib/utils";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { ensureValidImageUrl } from "@/lib/utils/image";

export default function UploadProgressStep() {
  const {
    videoFile,
    videoDetails,
    filePreview,
    uploadProgress,
    uploadSpeed,
    timeRemaining,
    isUploading,
    uploadError,
    cancelUpload,
    retryUpload,
  } = useUpload();

  if (!videoFile) return null;

  // Process the thumbnail using the utility function
  const thumbnailUrl = videoDetails.selectedThumbnail 
    ? ensureValidImageUrl(videoDetails.selectedThumbnail)
    : undefined;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border rounded-lg overflow-hidden bg-card"
    >
      <div className="border-b p-4 flex justify-between items-center">
        <div className="flex items-center">
          <UploadCloud className="h-5 w-5 mr-2 text-primary" />
          <h3 className="font-medium">
            {isUploading ? "Uploading Video" : 
             uploadError ? "Upload Failed" : 
             uploadProgress >= 100 ? "Upload Complete" : "Processing"}
          </h3>
        </div>
        {isUploading && (
          <Button
            variant="ghost"
            size="sm"
            onClick={cancelUpload}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            Cancel
          </Button>
        )}
      </div>

      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4 order-2 md:order-1">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="font-medium flex items-center">
                  {isUploading ? (
                    <LoaderCircle className="h-4 w-4 mr-2 animate-spin text-primary" />
                  ) : uploadError ? (
                    <AlertCircle className="h-4 w-4 mr-2 text-destructive" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                  )}
                  {isUploading
                    ? `Uploading (${uploadProgress.toFixed(1)}%)`
                    : uploadError
                    ? "Upload Failed"
                    : "Upload Complete"}
                </div>
                <div className="text-muted-foreground">
                  {formatBytes(videoFile.size)}
                </div>
              </div>

              <Progress 
                value={uploadProgress} 
                className={`h-2 ${uploadError ? "bg-destructive/20" : "bg-secondary"}`} 
                indicatorClassName={uploadError 
                  ? "bg-destructive" 
                  : "bg-gradient-to-r from-purple-500 to-pink-500"
                }
              />

              <div className="flex items-center justify-between text-xs pt-1">
                {isUploading ? (
                  <>
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      <span>
                        {timeRemaining !== null
                          ? `About ${formatTime(timeRemaining)} remaining`
                          : "Calculating time remaining..."}
                      </span>
                    </div>
                    <div className="text-muted-foreground">
                      {formatBytes(uploadSpeed)}/s
                    </div>
                  </>
                ) : uploadError ? (
                  <div className="flex items-center text-destructive">
                    <XCircle className="h-3.5 w-3.5 mr-1" />
                    <span>Upload failed. Please check your connection and try again.</span>
                  </div>
                ) : (
                  <div className="flex items-center text-green-500">
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                    <span>Upload successful! Processing video...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Video information */}
            <div className="mt-6 border rounded-md p-3 bg-muted/30">
              <div className="flex items-start space-x-3">
                <FileVideo className="h-5 w-5 text-primary mt-0.5" />
                <div className="space-y-1 flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{videoDetails.title || videoFile.name}</h4>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span>{formatBytes(videoFile.size)}</span>
                    <span>•</span>
                    <span>{videoFile.type.split('/')[1].toUpperCase()}</span>
                  </div>
                </div>
              </div>
            </div>

            {uploadError && (
              <div className="space-y-3">
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm">
                  <div className="flex items-start">
                    <AlertCircle className="h-4 w-4 mr-2 text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-destructive">Error uploading your video</p>
                      <p className="text-xs mt-1 text-muted-foreground">
                        This could be due to network issues or a server problem. Please try again.
                      </p>
                    </div>
                  </div>
                </div>
                <Button
                  variant="default"
                  onClick={retryUpload}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 py-2 h-auto"
                >
                  <RefreshCw className="h-4 w-4 mr-2" /> Retry Upload
                </Button>
              </div>
            )}
          </div>

          {/* Video preview */}
          <div className="order-1 md:order-2">
            {filePreview && (
              <div className="aspect-video bg-black rounded-md overflow-hidden border">
                <video 
                  src={filePreview} 
                  className="w-full h-full object-contain" 
                  poster={thumbnailUrl}
                />
              </div>
            )}
            {videoDetails.selectedThumbnail && (
              <div className="mt-2 text-xs text-muted-foreground">
                Custom thumbnail selected
              </div>
            )}
          </div>
        </div>
      </div>

      {!isUploading && !uploadError && (
        <div className="bg-muted/30 p-4 flex flex-col sm:flex-row justify-between gap-2 items-center border-t">
          <div className="text-sm">
            <span className="text-muted-foreground">Your video is being processed...</span>
          </div>
          <div className="flex items-center">
            <LoaderCircle className="h-4 w-4 mr-2 animate-spin text-primary" />
            <span className="text-sm">Please wait</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

"use client";

import type React from "react";
import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Upload, LoaderCircle, Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Ensure URLs are properly formatted
function ensureValidImageUrl(url: string): string {
  if (!url) return '';
  
  // If it already has https://, it should be ok
  if (url.startsWith('https://') || url.startsWith('http://')) {
    // But check for the common mistake where domain and path are joined without a slash
    const domainMatch = url.match(/https:\/\/sexcityhub\.b-cdn\.net([^\/])/);
    if (domainMatch) {
      return url.replace(/sexcityhub\.b-cdn\.net/, 'sexcityhub.b-cdn.net/');
    }
    return url;
  }
  
  // If it starts with a slash, it's a local file
  if (url.startsWith('/')) {
    return url;
  }
  
  // Otherwise, add the domain
  return `https://sexcityhub.b-cdn.net/${url}`;
}

interface ThumbnailSelectorProps {
  thumbnails: string[];
  selectedThumbnail?: string;
  onSelect: (thumbnail: string) => Promise<void>;
}

export default function ThumbnailSelector({
  thumbnails,
  selectedThumbnail,
  onSelect,
}: ThumbnailSelectorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [thumbnailsState, setThumbnails] = useState<string[]>(thumbnails);

  const handleCustomThumbnail = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please upload an image file.",
        });
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Thumbnail must be less than 2MB.",
        });
        return;
      }

      setIsUploading(true);
      const reader = new FileReader();

      reader.onload = async (event) => {
        if (event.target?.result) {
          try {
            const dataUrl = event.target.result as string;
            // Add the preview to thumbnails array immediately
            setThumbnails(prev => [dataUrl, ...prev]);
            await onSelect(dataUrl);
            toast({
              title: "Thumbnail selected",
              description: "Your custom thumbnail has been selected.",
            });
          } catch (error) {
            console.error("Error uploading thumbnail:", error);
            toast({
              variant: "destructive",
              title: "Upload failed",
              description: "Failed to upload thumbnail. Please try again.",
            });
          } finally {
            setIsUploading(false);
          }
        }
      };

      reader.readAsDataURL(file);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {thumbnailsState.map((thumbnail, index) => (
          <button
            key={index}
            onClick={() => onSelect(thumbnail)}
            className={`relative aspect-video rounded-md overflow-hidden border-2 transition-colors ${
              selectedThumbnail === thumbnail
                ? "border-primary ring-2 ring-primary ring-offset-2"
                : "border-transparent hover:border-muted-foreground/50"
            }`}
          >
            <img
              src={ensureValidImageUrl(thumbnail)}
              alt={`Thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
            />
            {selectedThumbnail === thumbnail && (
              <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                <div className="bg-primary text-primary-foreground rounded-full p-1">
                  <Check className="h-4 w-4" />
                </div>
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="relative">
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleCustomThumbnail}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full py-2 px-4 rounded-md border border-dashed border-muted-foreground/25 hover:border-primary transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
        >
          {isUploading ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              <span>Upload Custom Thumbnail</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

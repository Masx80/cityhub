"use client";

import type React from "react";
import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpload } from "@/components/upload/upload-provider";

const MAX_TAGS = 15;

export default function DetailsStep() {
  const {
    videoDetails,
    updateVideoDetails,
    filePreview,
    validateAndSubmit,
    categories,
    validationErrors,
    isProcessing,
  } = useUpload();

  const [tagInput, setTagInput] = useState("");

  const handleAddTag = () => {
    if (tagInput.trim() && videoDetails.tags.length < MAX_TAGS) {
      const newTag = tagInput.trim();

      // Don't add duplicates
      if (!videoDetails.tags.includes(newTag)) {
        updateVideoDetails("tags", [...videoDetails.tags, newTag]);
      }

      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    updateVideoDetails(
      "tags",
      videoDetails.tags.filter((t) => t !== tag)
    );
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Left column - form */}
        <div className="md:col-span-2 space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title-display" className="font-medium">
              Title
            </Label>
            <Input
              id="title-display"
              value={videoDetails.title}
              disabled
              className="bg-muted/50"
            />
            <p className="text-xs text-muted-foreground">
              Title was set during the upload step
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Tell viewers about your video"
              className="min-h-24 sm:min-h-32 resize-y"
              value={videoDetails.description}
              onChange={(e) =>
                updateVideoDetails("description", e.target.value)
              }
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="tags" className="font-medium">
                Tags
              </Label>
              <span className="text-xs text-muted-foreground">
                {videoDetails.tags.length}/{MAX_TAGS}
              </span>
            </div>

            <div className="flex space-x-2">
              <Input
                id="tags"
                placeholder="Add a tag and press Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                disabled={videoDetails.tags.length >= MAX_TAGS}
              />
              <Button
                type="button"
                size="icon"
                onClick={handleAddTag}
                disabled={
                  !tagInput.trim() || videoDetails.tags.length >= MAX_TAGS
                }
                className="h-10 w-10"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {videoDetails.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {videoDetails.tags.map((tag) => (
                  <div
                    key={tag}
                    className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm flex items-center"
                  >
                    {tag}
                    <button
                      type="button"
                      className="ml-1.5 text-muted-foreground hover:text-foreground p-1"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="font-medium">
              Category <span className="text-red-500">*</span>
            </Label>
            <Select
              value={videoDetails.categoryId}
              onValueChange={(value) => updateVideoDetails("categoryId", value)}
            >
              <SelectTrigger
                id="category"
                className={validationErrors.categoryId ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {validationErrors.categoryId && (
              <p className="text-sm text-red-500">
                {validationErrors.categoryId}
              </p>
            )}
          </div>
        </div>

        {/* Right column - video preview */}
        <div className="space-y-4 sm:space-y-6">
          {filePreview && (
            <div className="aspect-video bg-black rounded-md overflow-hidden">
              <video src={filePreview} controls className="w-full h-full" />
            </div>
          )}

          {videoDetails.selectedThumbnail && (
            <div className="space-y-2">
              <Label className="font-medium">Selected Thumbnail</Label>
              <div className="aspect-video rounded-md overflow-hidden border">
                <img
                  src={videoDetails.selectedThumbnail || "/placeholder.svg"}
                  alt="Selected thumbnail"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          variant="default"
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 min-w-28 px-4 py-2 h-auto"
          onClick={() => validateAndSubmit()}
          disabled={isProcessing}
        >
          {isProcessing ? "Processing..." : "Publish"}
        </Button>
      </div>
    </div>
  );
}

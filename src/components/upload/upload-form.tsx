"use client";

import type React from "react";
import type { useRouter } from "next/navigation";
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
import type { LocalState } from "@/lib/types/upload";
import { useState } from "react";

interface UploadFormProps {
  state: LocalState;
  setState: React.Dispatch<React.SetStateAction<LocalState>>;
  categories: Array<{ id: string; name: string; description?: string }>;
  loading: boolean;
  router: ReturnType<typeof useRouter>;
}

export default function UploadForm({
  state,
  setState,
  categories,
  loading,
  router,
}: UploadFormProps) {
  const [tagInput, setTagInput] = useState("");
  const MAX_TAGS = 15;

  // Add a new tag
  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (!trimmedTag) return;

    // Don't add if we already have 15 tags
    if (state.tags.length >= MAX_TAGS) {
      return;
    }

    // Don't add duplicates
    if (state.tags.includes(trimmedTag)) {
      return;
    }

    setState((prev) => ({
      ...prev,
      tags: [...prev.tags, trimmedTag],
    }));
  };

  // Handle tag input change
  const handleTagInputChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(ev.target.value);
  };

  // Handle tag input keydown
  const handleTagKeyDown = (ev: React.KeyboardEvent<HTMLInputElement>) => {
    if (ev.key === "Enter") {
      ev.preventDefault(); // Prevent form submission

      // Get current input value
      const value = tagInput.trim();

      if (value) {
        addTag(value);
        setTagInput(""); // Clear the input
      }
    }
  };

  // Handle tag input blur
  const handleTagBlur = () => {
    if (tagInput.trim()) {
      addTag(tagInput.trim());
      setTagInput("");
    }
  };

  // Remove a specific tag
  const removeTag = (tagToRemove: string) => {
    setState((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  // Add tag button handler
  const handleAddTagClick = () => {
    if (tagInput.trim()) {
      addTag(tagInput.trim());
      setTagInput("");
    }
  };

  return (
    <div className="grid gap-6">
      <div className="grid gap-3">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="Add a title that describes your video"
          value={state.title}
          onChange={(ev) =>
            setState((prev) => ({ ...prev, title: ev.target.value }))
          }
          disabled={loading}
        />
      </div>

      <div className="grid gap-3">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Tell viewers about your video"
          className="min-h-[120px]"
          value={state.description}
          onChange={(ev) =>
            setState((prev) => ({ ...prev, description: ev.target.value }))
          }
          disabled={loading}
        />
      </div>

      <div className="grid gap-3">
        <Label htmlFor="tags">
          Tags ({state.tags.length}/{MAX_TAGS})
        </Label>
        <div className="flex gap-2">
          <Input
            id="tags"
            placeholder="Add a tag and press Enter"
            value={tagInput}
            onChange={handleTagInputChange}
            onKeyDown={handleTagKeyDown}
            onBlur={handleTagBlur}
            disabled={loading || state.tags.length >= MAX_TAGS}
          />
          <Button
            type="button"
            size="icon"
            onClick={handleAddTagClick}
            disabled={
              loading || !tagInput.trim() || state.tags.length >= MAX_TAGS
            }
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {state.tags.map((tag) => (
            <Button
              key={tag}
              variant="outline"
              size="sm"
              onClick={() => removeTag(tag)}
              disabled={loading}
              type="button" // Ensure this doesn't submit the form
            >
              {tag} <X className="h-4 w-4 ml-1" />
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-3">
        <Label htmlFor="category">
          Category <span className="text-red-500">*</span>
        </Label>
        <Select
          value={state.categoryId}
          onValueChange={(value) =>
            setState((prev) => ({ ...prev, categoryId: value }))
          }
          disabled={loading}
          required
        >
          <SelectTrigger
            id="category"
            className={!state.categoryId ? "border-red-500" : ""}
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
        {!state.categoryId && (
          <p className="text-sm text-red-500">Category is required</p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          variant="outline"
          onClick={() => router.push("/")}
          disabled={loading}
          type="button"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={
            loading || !state.videoFile || !state.videoId || !state.categoryId
          }
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          {loading ? "Uploading..." : "Publish"}
        </Button>
      </div>
    </div>
  );
}

import { z } from "zod";

export const uploadVideoSchema = z.object({
  videoId: z.string().min(1, "Video ID is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  thumbnail: z.string().optional(),
  tags: z
    .array(z.string().max(50, "Tag is too long"))
    .max(15, "Maximum 15 tags allowed")
    .optional(),
  categoryId: z.string().min(1, "Category is required"),
});

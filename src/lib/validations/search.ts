import { z } from "zod";

/**
 * Schema for validating page search parameters
 */
export const pageSearchParamsSchema = z.object({
  q: z.string().optional(),
  categoryId: z.string().optional(),
  page: z.coerce.number().optional().default(1),
});

export type PageSearchParams = z.infer<typeof pageSearchParamsSchema>; 
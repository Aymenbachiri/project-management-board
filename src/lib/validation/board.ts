import { z } from "zod";

export const createBoardSchema = z.object({
  name: z
    .string()
    .min(1, "Board name is required")
    .max(50, "Board name must be less than 50 characters"),
  description: z
    .string()
    .max(200, "Description must be less than 200 characters")
    .optional(),
});

export type CreateBoardInput = z.infer<typeof createBoardSchema>;

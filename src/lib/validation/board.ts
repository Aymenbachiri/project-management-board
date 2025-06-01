import { z } from "zod";

export const createBoardSchema = z.object({
  name: z
    .string()
    .min(1, "Board name is required")
    .max(50, "Board name must be less than 50 characters"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(200, "Description must be less than 200 characters"),
});

export type CreateBoardInput = z.infer<typeof createBoardSchema>;

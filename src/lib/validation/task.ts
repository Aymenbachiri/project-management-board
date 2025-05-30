// CreateTaskSchema.ts
import { z } from "zod";

export const CreateTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(3, "Description is required"),
  status: z.enum(["todo", "in_progress", "done"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  dueDate: z.string().datetime().optional().nullable(), // Make optional and nullable
  assigneeId: z
    .string()
    .min(1, "Assignee is required")
    .or(z.literal("").transform(() => undefined))
    .optional(), // Allow empty string from select, then transform to undefined if you want to make it optional, or ensure "unassigned" is handled properly
  tags: z.array(z.string()),
  columnId: z.string().min(1, "Column ID is required"),
  order: z.number().optional(), // Make `order` optional if not set in this form
});

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;

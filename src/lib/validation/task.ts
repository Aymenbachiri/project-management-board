import { z } from "zod";

export const CreateTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(["todo", "in_progress", "done"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  dueDate: z.string().datetime().optional(),
  assigneeId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  columnId: z.string().min(1, "Column ID is required"),
  order: z.number().optional(),
});

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;

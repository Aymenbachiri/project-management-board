import { z } from "zod";

export const CreateTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(3, "Description is required"),
  status: z.enum(["todo", "in_progress", "done"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  dueDate: z.string().datetime(),
  assigneeId: z.string().min(1, "Assignee is required"),
  tags: z.array(z.string()).min(1, "tags are required"),
  columnId: z.string().min(1, "Column ID is required"),
  order: z.number().optional(),
});

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;

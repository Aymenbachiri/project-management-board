import type {
  User as PrismaUser,
  Board as PrismaBoard,
  Task as PrismaTask,
  Comment as PrismaComment,
  Attachment as PrismaAttachment,
  TaskStatus,
  Priority,
} from "@prisma/client";

export type { TaskStatus, Priority };

export interface User extends PrismaUser {
  avatar?: string;
}

export interface Comment extends PrismaComment {}

export interface Attachment extends PrismaAttachment {}

export interface Task extends PrismaTask {
  assignee?: User | null;
  comments: Comment[];
  attachments: Attachment[];
}

export interface BoardColumn {
  id: string;
  title: string;
  color: string;
}

export interface Board extends PrismaBoard {
  columns: BoardColumn[];
  tasks?: Task[];
}

export const getColumnConfig = (columnId: string) => {
  switch (columnId) {
    case "todo":
      return { id: "todo", title: "To Do", color: "#ef4444" };
    case "in_progress":
      return { id: "in_progress", title: "In Progress", color: "#f59e0b" };
    case "done":
      return { id: "done", title: "Done", color: "#10b981" };
    default:
      return { id: "todo", title: "To Do", color: "#ef4444" };
  }
};

export const getPriorityDisplay = (priority: Priority) => {
  switch (priority) {
    case "LOW":
      return "low";
    case "MEDIUM":
      return "medium";
    case "HIGH":
      return "high";
    default:
      return "medium";
  }
};

export const getPriorityValue = (priority: string): Priority => {
  switch (priority.toLowerCase()) {
    case "low":
      return "LOW";
    case "medium":
      return "MEDIUM";
    case "high":
      return "HIGH";
    default:
      return "MEDIUM";
  }
};

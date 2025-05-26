export type TaskStatus = "todo" | "in-progress" | "done";
export type Priority = "low" | "medium" | "high";

export type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
};

export type Comment = {
  id: string;
  content: string;
  authorId: string;
  createdAt: string;
};

export type Attachment = {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  assigneeId: string | null;
  dueDate: string | null;
  tags: string[];
  attachments: Attachment[];
  comments: Comment[];
  boardId: string;
  createdAt: string;
  updatedAt: string;
};

export type BoardColumn = {
  id: string;
  title: string;
  color: string;
};

export type Board = {
  id: string;
  name: string;
  description: string;
  columns: BoardColumn[];
  createdAt: string;
};

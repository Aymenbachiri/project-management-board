import { prisma } from "./prisma";
import type { TaskStatus, Priority } from "@prisma/client";

// Task operations
export async function getTasks(boardId: string) {
  return await prisma.task.findMany({
    where: { boardId },
    include: {
      assignee: true,
      comments: {
        include: {
          author: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
      attachments: true,
    },
    orderBy: [{ status: "asc" }, { order: "asc" }, { createdAt: "desc" }],
  });
}

export async function createTask(data: {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  assigneeId?: string;
  dueDate?: Date;
  tags: string[];
  boardId: string;
  columnId: string;
}) {
  return await prisma.task.create({
    data,
    include: {
      assignee: true,
      comments: {
        include: {
          author: true,
        },
      },
      attachments: true,
      board: true,
      column: true,
    },
  });
}

// Comment operations
export async function addComment(
  taskId: string,
  content: string,
  authorId: string,
) {
  return await prisma.comment.create({
    data: {
      content,
      taskId,
      authorId,
    },
    include: {
      author: true,
    },
  });
}

// User operations
export async function getUsers() {
  return await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
  });
}

export async function getBoardColumns(boardId: string) {
  return await prisma.boardColumn.findMany({
    where: { boardId },
    orderBy: { order: "asc" },
  });
}

export async function getTaskById(taskId: string) {
  return await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      assignee: true,
      comments: {
        include: {
          author: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      attachments: true,
    },
  });
}

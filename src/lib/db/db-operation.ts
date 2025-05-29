import { prisma } from "./prisma";
import type { TaskStatus, Priority } from "@prisma/client";

export async function getBoards(userId: string) {
  return await prisma.board.findMany({
    where: {
      OR: [{ ownerId: userId }, { members: { some: { userId } } }],
    },
    include: {
      owner: true,
      members: {
        include: {
          user: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function createBoard(
  name: string,
  description: string,
  ownerId: string,
) {
  return await prisma.board.create({
    data: {
      name,
      description,
      ownerId,
      columns: {
        create: [
          {
            columnId: "todo",
            title: "To_Do",
            color: "Red",
            order: 0,
          },
          {
            columnId: "in_progress",
            title: "In_Progress",
            color: "Orange",
            order: 1,
          },
          {
            columnId: "done",
            title: "Done",
            color: "Green",
            order: 2,
          },
        ],
      },
    },
    include: {
      columns: true,
    },
  });
}

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
    },
  });
}

export async function updateTask(
  taskId: string,
  data: {
    title?: string;
    description?: string;
    status?: TaskStatus;
    priority?: Priority;
    assigneeId?: string | null;
    dueDate?: Date | null;
    tags?: string[];
    order?: number;
  },
) {
  return await prisma.task.update({
    where: { id: taskId },
    data,
    include: {
      assignee: true,
      comments: {
        include: {
          author: true,
        },
      },
      attachments: true,
    },
  });
}

export async function deleteTask(taskId: string) {
  return await prisma.task.delete({
    where: { id: taskId },
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

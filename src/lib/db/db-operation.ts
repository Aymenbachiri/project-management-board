import { prisma } from "./prisma";

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

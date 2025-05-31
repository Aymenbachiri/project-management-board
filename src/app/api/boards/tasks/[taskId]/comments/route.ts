import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { type NextRequest, NextResponse } from "next/server";

type Params = Promise<{ taskId: string }>;

/**
 * @swagger
 * /api/tasks/{taskId}/comments:
 *   post:
 *     summary: Add a comment to a specific task
 *     description: Create a new comment for a task. Requires user authentication.
 *     tags:
 *       - Comments
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: The MongoDB ObjectId of the task
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: The comment content
 *                 example: "This task needs to be completed by Friday"
 *                 minLength: 1
 *                 maxLength: 1000
 *     responses:
 *       201:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Comment ID (MongoDB ObjectId)
 *                   example: "507f1f77bcf86cd799439013"
 *                 content:
 *                   type: string
 *                   description: Comment content
 *                   example: "This task needs to be completed by Friday"
 *                 taskId:
 *                   type: string
 *                   description: Task ID (MongoDB ObjectId)
 *                   example: "507f1f77bcf86cd799439011"
 *                 authorId:
 *                   type: string
 *                   description: Author ID (MongoDB ObjectId)
 *                   example: "507f1f77bcf86cd799439012"
 *                 author:
 *                   $ref: '#/components/schemas/User'
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: Comment creation timestamp
 *                   example: "2024-01-15T10:30:00.000Z"
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   description: Comment last update timestamp
 *                   example: "2024-01-15T10:30:00.000Z"
 *               required:
 *                 - id
 *                 - content
 *                 - taskId
 *                 - authorId
 *                 - author
 *                 - createdAt
 *                 - updatedAt
 *       401:
 *         description: Unauthorized - User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "authorId is required"
 *       404:
 *         description: Task not found or user not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "authorId is required"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Error adding comment:"
 *               message: "Database connection failed"
 */

export async function POST(
  request: NextRequest,
  { params }: { params: Params },
) {
  const { taskId } = await params;
  if (!taskId) {
    return NextResponse.json("taskId is required", { status: 401 });
  }

  const objectIdPattern = /^[0-9a-fA-F]{24}$/;
  if (!objectIdPattern.test(taskId)) {
    return NextResponse.json(
      {
        error: "Invalid ID",
        message: "The provided task ID is not a valid ObjectId.",
      },
      { status: 400 },
    );
  }

  try {
    const session = await auth();
    const authorId = session?.user?.id as string;
    if (!authorId) {
      return NextResponse.json("authorId is required", { status: 404 });
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return NextResponse.json("Task not found", { status: 404 });
    }

    const { content } = await request.json();
    const comment = await prisma.comment.create({
      data: { content, taskId, authorId },
      include: { author: true },
    });
    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("[POST /api/boards/tasks/comments]", error);
    return NextResponse.json(
      { error: "Error adding comment:", message: (error as Error).message },
      { status: 500 },
    );
  }
}

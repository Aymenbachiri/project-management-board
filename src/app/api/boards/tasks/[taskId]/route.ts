/* eslint-disable @typescript-eslint/no-unused-vars */
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { getPriorityValue } from "@/lib/types/types";
import { type NextRequest, NextResponse } from "next/server";

type Params = Promise<{ taskId: string }>;

/**
 * @swagger
 * /api/boards/tasks/{taskId}:
 *   patch:
 *     tags:
 *       - Tasks
 *     summary: Update a task
 *     description: Update an existing task with new data. Supports partial updates and handles priority conversion and date formatting.
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: The MongoDB ObjectId of the task to update
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Task title
 *                 example: "Updated task title"
 *               description:
 *                 type: string
 *                 nullable: true
 *                 description: Task description
 *                 example: "Updated task description"
 *               status:
 *                 type: string
 *                 enum: ["todo", "in_progress", "done"]
 *                 description: Task status
 *                 example: "in_progress"
 *               priority:
 *                 type: string
 *                 enum: ["LOW", "MEDIUM", "HIGH"]
 *                 description: Task priority level
 *                 example: "HIGH"
 *               assigneeId:
 *                 type: string
 *                 nullable: true
 *                 description: User ID of task assignee (MongoDB ObjectId)
 *                 example: "507f1f77bcf86cd799439012"
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *                 description: Task due date (ISO 8601 format) or null to remove due date
 *                 example: "2024-02-15T23:59:59.000Z"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of task tags
 *                 example: ["urgent", "frontend", "bug-fix"]
 *               order:
 *                 type: integer
 *                 description: Task order within column
 *                 example: 2
 *               columnId:
 *                 type: string
 *                 description: Board column ID where task belongs (MongoDB ObjectId)
 *                 example: "507f1f77bcf86cd799439013"
 *             additionalProperties: false
 *           example:
 *             title: "Implement user authentication"
 *             description: "Add OAuth login with Google and GitHub"
 *             status: "in_progress"
 *             priority: "HIGH"
 *             assigneeId: "507f1f77bcf86cd799439012"
 *             dueDate: "2024-02-15T23:59:59.000Z"
 *             tags: ["authentication", "oauth", "security"]
 *             order: 1
 *     responses:
 *       200:
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Task'
 *                 - type: object
 *                   properties:
 *                     assignee:
 *                       $ref: '#/components/schemas/User'
 *                       nullable: true
 *                       description: Task assignee details
 *                     comments:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             description: Comment ID
 *                           content:
 *                             type: string
 *                             description: Comment content
 *                           taskId:
 *                             type: string
 *                             description: Task ID
 *                           authorId:
 *                             type: string
 *                             description: Author user ID
 *                           author:
 *                             $ref: '#/components/schemas/User'
 *                             description: Comment author details
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                       description: Task comments with author details
 *                     board:
 *                       $ref: '#/components/schemas/Board'
 *                       description: Board where task belongs
 *                     column:
 *                       $ref: '#/components/schemas/BoardColumn'
 *                       description: Column where task belongs
 *                     attachments:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             description: Attachment ID
 *                           name:
 *                             type: string
 *                             description: File name
 *                           url:
 *                             type: string
 *                             description: File URL
 *                           type:
 *                             type: string
 *                             description: MIME type
 *                           size:
 *                             type: integer
 *                             description: File size in bytes
 *                           taskId:
 *                             type: string
 *                             description: Task ID
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                       description: Task attachments
 *             example:
 *               id: "507f1f77bcf86cd799439011"
 *               title: "Implement user authentication"
 *               description: "Add OAuth login with Google and GitHub"
 *               boardId: "507f1f77bcf86cd799439014"
 *               columnId: "507f1f77bcf86cd799439013"
 *               assigneeId: "507f1f77bcf86cd799439012"
 *               order: 1
 *               status: "in_progress"
 *               priority: "HIGH"
 *               dueDate: "2024-02-15T23:59:59.000Z"
 *               tags: ["authentication", "oauth", "security"]
 *               createdAt: "2024-01-15T10:30:00.000Z"
 *               updatedAt: "2024-01-15T14:30:00.000Z"
 *               assignee:
 *                 id: "507f1f77bcf86cd799439012"
 *                 name: "John Doe"
 *                 email: "john@example.com"
 *                 image: "https://example.com/avatar.jpg"
 *                 createdAt: "2024-01-10T08:00:00.000Z"
 *                 updatedAt: "2024-01-10T08:00:00.000Z"
 *               comments:
 *                 - id: "507f1f77bcf86cd799439015"
 *                   content: "Started working on Google OAuth integration"
 *                   taskId: "507f1f77bcf86cd799439011"
 *                   authorId: "507f1f77bcf86cd799439012"
 *                   author:
 *                     id: "507f1f77bcf86cd799439012"
 *                     name: "John Doe"
 *                     email: "john@example.com"
 *                     image: "https://example.com/avatar.jpg"
 *                     createdAt: "2024-01-10T08:00:00.000Z"
 *                     updatedAt: "2024-01-10T08:00:00.000Z"
 *                   createdAt: "2024-01-15T12:00:00.000Z"
 *                   updatedAt: "2024-01-15T12:00:00.000Z"
 *               board:
 *                 id: "507f1f77bcf86cd799439014"
 *                 name: "Project Alpha"
 *                 description: "Main project board"
 *                 ownerId: "507f1f77bcf86cd799439016"
 *                 createdAt: "2024-01-10T10:00:00.000Z"
 *                 updatedAt: "2024-01-10T10:00:00.000Z"
 *               column:
 *                 id: "507f1f77bcf86cd799439013"
 *                 columnId: "in_progress"
 *                 title: "In_Progress"
 *                 color: "Orange"
 *                 order: 1
 *                 boardId: "507f1f77bcf86cd799439014"
 *                 createdAt: "2024-01-10T10:00:00.000Z"
 *                 updatedAt: "2024-01-10T10:00:00.000Z"
 *               attachments: []
 *       400:
 *         description: Bad request - Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *             example:
 *               error: "Validation failed"
 *               message:
 *                 priority: "Priority must be LOW, MEDIUM, or HIGH"
 *       404:
 *         description: Task not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Not found"
 *               message: "Task with given ID does not exist"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Failed to upddate task"
 *               message: "Database constraint violation"
 *   delete:
 *     tags:
 *       - Tasks
 *     summary: Delete a task
 *     description: Permanently delete a task and all its associated data (comments, attachments)
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: The MongoDB ObjectId of the task to delete
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *             example: "Task Deleted Sucessfully"
 *       404:
 *         description: Task not found or taskId missing
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *             examples:
 *               taskIdRequired:
 *                 summary: TaskId parameter missing
 *                 value: "TaskId is required"
 *               taskNotFound:
 *                 summary: Task does not exist
 *                 value: "Task not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Failed to delete task"
 *               message: "Database connection failed"
 */

export async function PATCH(
  request: NextRequest,
  { params }: { params: Params },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Session missing" },
        { status: 401 },
      );
    }

    const { taskId } = await params;
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

    const data = await request.json();

    const {
      id,
      createdAt,
      updatedAt,
      assignee,
      comments,
      attachments,
      ...updateFields
    } = data;

    const updateData = {
      ...updateFields,
      priority: updateFields.priority
        ? getPriorityValue(updateFields.priority)
        : undefined,
      dueDate: updateFields.dueDate
        ? new Date(updateFields.dueDate)
        : updateFields.dueDate === null
          ? null
          : undefined,
    };

    const task = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        assignee: true,
        comments: { include: { author: true } },
        board: true,
        column: true,
        attachments: true,
      },
    });
    return NextResponse.json(task, { status: 200 });
  } catch (error) {
    console.error("[PATCH /api/boards/tasks/[taskId]]", error);
    return NextResponse.json(
      { error: "Failed to upddate task", message: (error as Error).message },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Params },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Session missing" },
        { status: 401 },
      );
    }

    const { taskId } = await params;
    if (!taskId) {
      return NextResponse.json("TaskId is required", { status: 404 });
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return NextResponse.json("Task not found", { status: 404 });
    }

    await prisma.task.delete({ where: { id: taskId } });
    return NextResponse.json("Task Deleted Sucessfully", { status: 200 });
  } catch (error) {
    console.error("[DELETE /api/boards/tasks/[taskId]]", error);
    return NextResponse.json(
      { error: "Failed to delete task", message: (error as Error).message },
      { status: 500 },
    );
  }
}

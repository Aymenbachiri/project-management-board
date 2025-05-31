import { type NextRequest, NextResponse } from "next/server";
import { getPriorityValue } from "@/lib/types/types";
import { prisma } from "@/lib/db/prisma";
import { CreateTaskSchema } from "@/lib/validation/task";

type Params = Promise<{ boardId: string }>;

/**
 * @swagger
 * /api/boards/{boardId}/tasks:
 *   get:
 *     summary: Get all tasks for a specific board
 *     description: Retrieve all tasks belonging to a board with their assignees, comments, and attachments
 *     tags:
 *       - Tasks
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: string
 *         description: The MongoDB ObjectId of the board
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Successfully retrieved tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/Task'
 *                   - type: object
 *                     properties:
 *                       assignee:
 *                         $ref: '#/components/schemas/User'
 *                         nullable: true
 *                       comments:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             content:
 *                               type: string
 *                             taskId:
 *                               type: string
 *                             authorId:
 *                               type: string
 *                             author:
 *                               $ref: '#/components/schemas/User'
 *                             createdAt:
 *                               type: string
 *                               format: date-time
 *                             updatedAt:
 *                               type: string
 *                               format: date-time
 *                       attachments:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             name:
 *                               type: string
 *                             url:
 *                               type: string
 *                             type:
 *                               type: string
 *                             size:
 *                               type: integer
 *                             taskId:
 *                               type: string
 *                             createdAt:
 *                               type: string
 *                               format: date-time
 *                             updatedAt:
 *                               type: string
 *                               format: date-time
 *       404:
 *         description: Board ID is required
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "boardId is required"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Error fetching tasks:"
 *               message: "Database connection failed"
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Params },
) {
  try {
    const { boardId } = await params;
    if (!boardId) {
      return NextResponse.json("boardId is required", { status: 404 });
    }

    const objectIdPattern = /^[0-9a-fA-F]{24}$/;
    if (!objectIdPattern.test(boardId)) {
      return NextResponse.json(
        {
          error: "Invalid ID",
          message: "The provided board ID is not a valid ObjectId.",
        },
        { status: 400 },
      );
    }

    const tasks = await prisma.task.findMany({
      where: { boardId },
      include: {
        assignee: true,
        comments: { include: { author: true }, orderBy: { createdAt: "asc" } },
        attachments: true,
      },
      orderBy: [{ status: "asc" }, { order: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(tasks, { status: 200 });
  } catch (error) {
    console.error("[GET /api/boards/boardId/tasks]", error);
    return NextResponse.json(
      { error: "Error fetching tasks:", message: (error as Error).message },
      { status: 500 },
    );
  }
}

/**
 * @swagger
 * /api/boards/{boardId}/tasks:
 *   post:
 *     summary: Create a new task in a specific board
 *     description: Create a new task and assign it to the first column (default) of the specified board
 *     tags:
 *       - Tasks
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: string
 *         description: The MongoDB ObjectId of the board
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - status
 *               - priority
 *             properties:
 *               title:
 *                 type: string
 *                 description: Task title
 *                 example: "Implement user authentication"
 *               description:
 *                 type: string
 *                 nullable: true
 *                 description: Task description
 *                 example: "Add login and registration functionality"
 *               status:
 *                 type: string
 *                 enum: ["todo", "in_progress", "done"]
 *                 description: Task status
 *                 example: "todo"
 *               priority:
 *                 type: string
 *                 enum: ["LOW", "MEDIUM", "HIGH"]
 *                 description: Task priority level
 *                 example: "HIGH"
 *               assigneeId:
 *                 type: string
 *                 nullable: true
 *                 description: MongoDB ObjectId of the user assigned to this task
 *                 example: "507f1f77bcf86cd799439012"
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *                 description: Task due date
 *                 example: "2024-12-31T23:59:59.000Z"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of task tags
 *                 example: ["frontend", "authentication", "urgent"]
 *               columnId:
 *                 type: string
 *                 description: MongoDB ObjectId of the column to place the task in.
 *                 example: "68347e98c89372ac479a8b1c"
 *     responses:
 *       201:
 *         description: Task created successfully
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
 *                     comments:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           content:
 *                             type: string
 *                           taskId:
 *                             type: string
 *                           authorId:
 *                             type: string
 *                           author:
 *                             $ref: '#/components/schemas/User'
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                     attachments:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           url:
 *                             type: string
 *                           type:
 *                             type: string
 *                           size:
 *                             type: integer
 *                           taskId:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                     board:
 *                       $ref: '#/components/schemas/Board'
 *                     column:
 *                       $ref: '#/components/schemas/BoardColumn'
 *       404:
 *         description: Board ID is required
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "boardId is required"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Error creating task:"
 *               message: "Database connection failed"
 */

export async function POST(
  request: NextRequest,
  { params }: { params: Params },
) {
  try {
    const { boardId } = await params;
    if (!boardId) {
      return NextResponse.json("boardId is required", { status: 404 });
    }

    const objectIdPattern = /^[0-9a-fA-F]{24}$/;
    if (!objectIdPattern.test(boardId)) {
      return NextResponse.json(
        {
          error: "Invalid ID",
          message: "The provided board ID is not a valid ObjectId.",
        },
        { status: 400 },
      );
    }

    const body = await request.json();

    const result = CreateTaskSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          error: "Validation error",
          issues: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const data = result.data;

    const columns = await prisma.boardColumn.findMany({
      where: { boardId },
      orderBy: { order: "asc" },
    });

    const defaultColumn = columns[0];

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: getPriorityValue(data.priority),
        assigneeId: data.assigneeId,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        tags: data.tags,
        boardId: boardId,
        columnId: defaultColumn?.id || "",
      },
      include: {
        assignee: true,
        comments: { include: { author: true } },
        attachments: true,
        board: true,
        column: true,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("[POST /api/boards/boardId/tasks]", error);
    return NextResponse.json(
      { error: "Error creating task:", message: (error as Error).message },
      { status: 500 },
    );
  }
}

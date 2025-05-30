import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { createBoardSchema } from "@/lib/validation/board";
import { type NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/boards:
 *   get:
 *     tags:
 *       - Boards
 *     summary: Get user's boards
 *     description: Retrieve all boards where the authenticated user is either the owner or a member
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved boards
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/Board'
 *                   - type: object
 *                     properties:
 *                       owner:
 *                         $ref: '#/components/schemas/User'
 *                       members:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/BoardMember'
 *             example:
 *               - id: "507f1f77bcf86cd799439011"
 *                 name: "Project Alpha"
 *                 description: "Main project board"
 *                 ownerId: "507f1f77bcf86cd799439012"
 *                 createdAt: "2024-01-15T10:30:00.000Z"
 *                 updatedAt: "2024-01-15T10:30:00.000Z"
 *                 owner:
 *                   id: "507f1f77bcf86cd799439012"
 *                   name: "John Doe"
 *                   email: "john@example.com"
 *                   image: null
 *                   createdAt: "2024-01-10T08:00:00.000Z"
 *                   updatedAt: "2024-01-10T08:00:00.000Z"
 *                 members:
 *                   - id: "507f1f77bcf86cd799439013"
 *                     role: "member"
 *                     boardId: "507f1f77bcf86cd799439011"
 *                     userId: "507f1f77bcf86cd799439014"
 *                     createdAt: "2024-01-15T11:00:00.000Z"
 *                     updatedAt: "2024-01-15T11:00:00.000Z"
 *                     user:
 *                       id: "507f1f77bcf86cd799439014"
 *                       name: "Jane Smith"
 *                       email: "jane@example.com"
 *                       image: null
 *                       createdAt: "2024-01-12T09:00:00.000Z"
 *                       updatedAt: "2024-01-12T09:00:00.000Z"
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Unauthorized"
 *               message: "Session missing"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Failed to fetch boards"
 *               message: "Database connection failed"
 *   post:
 *     tags:
 *       - Boards
 *     summary: Create a new board
 *     description: Create a new board with default columns (To Do, In Progress, Done) for the authenticated user
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBoardRequest'
 *           example:
 *             name: "New Project Board"
 *             description: "Board for tracking new project tasks"
 *     responses:
 *       201:
 *         description: Board created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Board'
 *                 - type: object
 *                   properties:
 *                     columns:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/BoardColumn'
 *             example:
 *               id: "507f1f77bcf86cd799439015"
 *               name: "New Project Board"
 *               description: "Board for tracking new project tasks"
 *               ownerId: "507f1f77bcf86cd799439012"
 *               createdAt: "2024-01-15T14:30:00.000Z"
 *               updatedAt: "2024-01-15T14:30:00.000Z"
 *               columns:
 *                 - id: "507f1f77bcf86cd799439016"
 *                   columnId: "todo"
 *                   title: "To_Do"
 *                   color: "Red"
 *                   order: 0
 *                   boardId: "507f1f77bcf86cd799439015"
 *                   createdAt: "2024-01-15T14:30:00.000Z"
 *                   updatedAt: "2024-01-15T14:30:00.000Z"
 *                 - id: "507f1f77bcf86cd799439017"
 *                   columnId: "in_progress"
 *                   title: "In_Progress"
 *                   color: "Orange"
 *                   order: 1
 *                   boardId: "507f1f77bcf86cd799439015"
 *                   createdAt: "2024-01-15T14:30:00.000Z"
 *                   updatedAt: "2024-01-15T14:30:00.000Z"
 *                 - id: "507f1f77bcf86cd799439018"
 *                   columnId: "done"
 *                   title: "Done"
 *                   color: "Green"
 *                   order: 2
 *                   boardId: "507f1f77bcf86cd799439015"
 *                   createdAt: "2024-01-15T14:30:00.000Z"
 *                   updatedAt: "2024-01-15T14:30:00.000Z"
 *       400:
 *         description: Bad request - Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *             example:
 *               error: "Validation failed"
 *               message:
 *                 name: "Board name is required"
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Unauthorized"
 *               message: "Session missing"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Failed to create board"
 *               message: "Database constraint violation"
 */

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id as string;
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Session missing" },
        { status: 401 },
      );
    }

    const boards = await prisma.board.findMany({
      where: {
        OR: [{ ownerId: userId }, { members: { some: { userId } } }],
      },
      include: { owner: true, members: { include: { user: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(boards, { status: 200 });
  } catch (error) {
    console.error("[GET /api/boards]", error);
    return NextResponse.json(
      { error: "Failed to fetch boards", message: (error as Error).message },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const ownerId = session?.user?.id as string;
    if (!ownerId) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Session missing" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const result = createBoardSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation Error", issues: result.error.issues },
        { status: 400 },
      );
    }

    const { name, description } = result.data;

    const board = await prisma.board.create({
      data: {
        name,
        description,
        ownerId,
        columns: {
          create: [
            { columnId: "todo", title: "To_Do", color: "Red", order: 0 },
            {
              columnId: "in_progress",
              title: "In_Progress",
              color: "Orange",
              order: 1,
            },
            { columnId: "done", title: "Done", color: "Green", order: 2 },
          ],
        },
      },
      include: { columns: true },
    });
    return NextResponse.json(board, { status: 201 });
  } catch (error) {
    console.error("Error creating board:", error);
    return NextResponse.json(
      { error: "Failed to create board", message: (error as Error).message },
      { status: 500 },
    );
  }
}

import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { createBoardSchema } from "@/lib/validation/board";
import {
  BoardColumnColor,
  BoardColumnId,
  BoardColumnTitle,
} from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/boards:
 *   get:
 *     summary: Get all boards for authenticated user
 *     description: Retrieves all boards that the authenticated user owns or is a member of
 *     tags:
 *       - Boards
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
 *                 $ref: '#/components/schemas/Board'
 *       401:
 *         description: Unauthorized - Session missing
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user)
      return NextResponse.json(
        { error: "Unauthorized", message: "Session missing" },
        { status: 401 },
      );

    const userId = session?.user?.id;

    const ownedBoards = await prisma.board.findMany({
      where: { ownerId: userId },
      include: {
        columns: { include: { tasks: true }, orderBy: { order: "asc" } },
        members: true,
      },
    });

    const memberBoards = await prisma.board.findMany({
      where: { members: { some: { userId } } },
      include: {
        columns: { include: { tasks: true }, orderBy: { order: "asc" } },
        members: true,
      },
    });

    const allBoards = [...ownedBoards, ...memberBoards].filter(
      (board, index, self) =>
        index === self.findIndex((b) => b.id === board.id),
    );

    return NextResponse.json(allBoards, { status: 200 });
  } catch (error) {
    console.error("[GET /api/boards]", error);
    return NextResponse.json(
      { error: "Failed to fetch boards", message: (error as Error).message },
      { status: 500 },
    );
  }
}

/**
 * @swagger
 * /api/boards:
 *   post:
 *     summary: Create a new board
 *     description: Creates a new board with default columns (To Do, In Progress, Done) and adds the creator as owner
 *     tags:
 *       - Boards
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBoardRequest'
 *     responses:
 *       201:
 *         description: Board created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Board'
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Unauthorized - Session missing
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user)
      return NextResponse.json(
        { error: "Unauthorized", message: "Session missing" },
        { status: 401 },
      );

    const userId = session?.user?.id as string;

    const body = await req.json();

    const parseResult = createBoardSchema.safeParse(body);

    if (!parseResult.success) {
      const formatted = parseResult.error.format();
      return NextResponse.json(
        { error: "Invalid data", message: formatted },
        { status: 400 },
      );
    }

    const { name, description } = parseResult.data;

    const newBoard = await prisma.board.create({
      data: {
        name,
        description,
        ownerId: userId,
        members: { create: { userId, role: "owner" } },
        columns: {
          create: [
            {
              columnId: BoardColumnId.todo,
              title: BoardColumnTitle.To_Do,
              color: BoardColumnColor.Red,
              order: 0,
            },
            {
              columnId: BoardColumnId.in_progress,
              title: BoardColumnTitle.In_Progress,
              color: BoardColumnColor.Orange,
              order: 1,
            },
            {
              columnId: BoardColumnId.done,
              title: BoardColumnTitle.Done,
              color: BoardColumnColor.Green,
              order: 2,
            },
          ],
        },
      },
      include: { columns: true, members: true },
    });

    return NextResponse.json(newBoard, { status: 201 });
  } catch (error) {
    console.error("[POST /api/boards]", error);
    return NextResponse.json(
      { error: "Failed to create board", message: (error as Error).message },
      { status: 500 },
    );
  }
}

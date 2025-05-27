import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { CreateTaskSchema } from "@/lib/validation/task";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user)
      return NextResponse.json(
        { error: "Unauthorized", message: "Session missing" },
        { status: 401 },
      );

    const { searchParams } = new URL(req.url);
    const boardId = searchParams.get("boardId");

    const tasks = await prisma.task.findMany({
      where: boardId ? { boardId } : {},
      include: {
        assignee: true,
        column: true,
        comments: true,
        board: true,
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(tasks, { status: 200 });
  } catch (error) {
    console.error("[GET /api/tasks]", error);
    return NextResponse.json(
      {
        error: "Failed to fetch tasks",
        message: (error as Error).message,
      },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user)
      return NextResponse.json(
        { error: "Unauthorized", message: "Session missing" },
        { status: 401 },
      );

    const { searchParams } = new URL(req.url);
    const boardId = searchParams.get("boardId") as string;
    if (!boardId) {
      return NextResponse.json(
        { error: "Board ID is required", message: "boardId parameter missing" },
        { status: 400 },
      );
    }

    const body = await req.json();

    const result = CreateTaskSchema.safeParse(body);
    if (!result.success) {
      const formatted = result.error.format();
      return NextResponse.json(
        { error: "Invalid data", message: formatted },
        { status: 400 },
      );
    }

    const {
      title,
      description,
      status,
      priority,
      dueDate,
      assigneeId,
      tags = [],
      columnId,
      order = 0,
    } = result.data;

    const board = await prisma.board.findFirst({
      where: {
        id: boardId,
        OR: [
          { ownerId: session.user.id },
          { members: { some: { userId: session.user.id } } },
        ],
      },
    });

    if (!board) {
      return NextResponse.json(
        { error: "Access Denied", message: "Board not found" },
        { status: 404 },
      );
    }

    const column = await prisma.boardColumn.findFirst({
      where: { id: columnId, boardId: boardId },
    });

    if (!column) {
      return NextResponse.json(
        {
          error: "Column not found",
          message: "Column doesn't belong to this board",
        },
        { status: 404 },
      );
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        assigneeId,
        tags,
        order,
        boardId,
        columnId,
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true, image: true },
        },
        board: {
          select: {
            id: true,
            name: true,
          },
        },
        column: {
          select: {
            id: true,
            title: true,
            columnId: true,
          },
        },
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("[POST /api/boardId/tasks]", error);
    return NextResponse.json(
      {
        error: "Failed to create board task",
        message: (error as Error).message,
      },
      { status: 500 },
    );
  }
}

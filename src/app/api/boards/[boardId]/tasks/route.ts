import { NextResponse } from "next/server";
import { getPriorityValue } from "@/lib/types/types";
import { createTask, getTasks } from "@/lib/db/db-operation";

type Params = Promise<{ boardId: string }>;

export async function GET(request: Request, { params }: { params: Params }) {
  try {
    const { boardId } = await params;
    const tasks = await getTasks(boardId);
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request, { params }: { params: Params }) {
  try {
    const { boardId } = await params;
    const data = await request.json();

    const { getBoardColumns } = await import("@/lib/db/db-operation");
    const columns = await getBoardColumns(boardId);
    const defaultColumn = columns[0];

    const task = await createTask({
      ...data,
      priority: getPriorityValue(data.priority),
      boardId: boardId,
      columnId: defaultColumn?.id || "",
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}

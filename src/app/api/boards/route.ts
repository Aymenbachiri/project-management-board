import { auth } from "@/auth";
import { createBoard, getBoards } from "@/lib/db/db-operation";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id as string;
  try {
    const boards = await getBoards(userId);
    return NextResponse.json(boards);
  } catch (error) {
    console.error("Error fetching boards:", error);
    return NextResponse.json(
      { error: "Failed to fetch boards" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id as string;
    const { name, description } = await request.json();
    const board = await createBoard(name, description, userId);
    return NextResponse.json(board);
  } catch (error) {
    console.error("Error creating board:", error);
    return NextResponse.json(
      { error: "Failed to create board" },
      { status: 500 },
    );
  }
}

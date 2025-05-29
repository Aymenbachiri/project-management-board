import { auth } from "@/auth";
import { addComment } from "@/lib/db/db-operation";
import { NextResponse } from "next/server";

type Params = Promise<{ taskId: string }>;

export async function POST(request: Request, { params }: { params: Params }) {
  const { taskId } = await params;
  const session = await auth();
  const userId = session?.user?.id as string;
  try {
    const { content } = await request.json();
    const comment = await addComment(taskId, content, userId);
    return NextResponse.json(comment);
  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 },
    );
  }
}

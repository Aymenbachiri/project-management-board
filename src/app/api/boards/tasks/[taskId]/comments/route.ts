import { auth } from "@/auth";
import { addComment, getTaskById } from "@/lib/db/db-operation";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { taskId: string } },
) {
  const session = await auth();
  const userId = session?.user?.id as string;
  try {
    const { content } = await request.json();
    const comment = await addComment(params.taskId, content, userId);

    const updatedTask = await getTaskById(params.taskId);

    return NextResponse.json({
      comment,
      updatedTask,
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 },
    );
  }
}

/* eslint-disable @typescript-eslint/no-unused-vars */
import { deleteTask, updateTask } from "@/lib/db/db-operation";
import { getPriorityValue } from "@/lib/types/types";
import { NextResponse } from "next/server";

type Params = Promise<{ taskId: string }>;

export async function PATCH(request: Request, { params }: { params: Params }) {
  try {
    const { taskId } = await params;
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

    const task = await updateTask(taskId, updateData);
    return NextResponse.json(task);
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: { params: Params }) {
  try {
    const { taskId } = await params;
    await deleteTask(taskId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 },
    );
  }
}

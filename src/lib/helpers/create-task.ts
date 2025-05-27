import { API_URL } from "../utils/env";
import type { CreateTaskInput } from "../validation/task";

export async function createBoardTask(data: CreateTaskInput, boardId: string) {
  try {
    const response = await fetch(`/api/boards/tasks?boardId=${boardId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create task");
    }

    return response.json();
  } catch (error) {
    console.error("failed to create task: ", error);
    throw error;
  }
}

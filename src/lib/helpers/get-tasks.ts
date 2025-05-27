import { cookies } from "next/headers";
import { API_URL } from "../utils/env";
import type { Task } from "@prisma/client";

export async function getTasks(): Promise<Task[] | undefined> {
  try {
    const cookieStore = await cookies();
    const response = await fetch(`${API_URL}/api/boards/tasks`, {
      headers: { Cookie: cookieStore.toString() },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to get tasks");
    }

    const tasks: Task[] = await response.json();
    return tasks;
  } catch (error) {
    console.error("failed to get tasks: ", error);
    throw error;
  }
}

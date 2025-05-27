import type { CreateBoardInput } from "../validation/board";

export async function createBoard(data: CreateBoardInput) {
  try {
    const response = await fetch(`/api/boards`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create board");
    }

    return response.json();
  } catch (error) {
    console.error("failed to create board: ", error);
    throw error;
  }
}

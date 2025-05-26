import { Board } from "@prisma/client";
import { cookies } from "next/headers";
import { API_URL } from "../utils/env";

type getBoardsReturn = Promise<Board[] | undefined>;

export async function getBoards(): getBoardsReturn {
  try {
    const cookieStore = cookies();
    const response = await fetch(`${API_URL}/api/boards`, {
      headers: { Cookie: cookieStore.toString() },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to get boards");
    }

    const boards: Board[] = await response.json();
    return boards;
  } catch (error) {
    console.error("failed to get board: ", error);
  }
}

import { cookies } from "next/headers";
import { API_URL } from "../utils/env";
import { User } from "../types/types";

export async function getUsers(): Promise<User[] | undefined> {
  try {
    const cookieStore = await cookies();
    const response = await fetch(`${API_URL}/api/users`, {
      headers: { Cookie: cookieStore.toString() },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to get users");
    }

    const users: User[] = await response.json();
    return users;
  } catch (error) {
    console.error("failed to get users: ", error);
    throw error;
  }
}

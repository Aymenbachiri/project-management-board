"use server";
import "server-only";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";

export async function login(formData: FormData) {
  const payload = {
    email: formData.get("email"),
    password: formData.get("password"),
    redirectTo: "/",
  };

  try {
    await signIn("credentials", payload);
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials!" };
        default:
          return { error: "Failed to signin, please try again later." };
      }
    }

    throw error;
  }
  revalidatePath("/");
}

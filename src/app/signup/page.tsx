import { Metadata } from "next";
import type { JSX } from "react";
import { SignupPage } from "./_components/signup-page";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "signup",
  description: "signup",
};

export default async function page(): Promise<JSX.Element> {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return <SignupPage />;
}

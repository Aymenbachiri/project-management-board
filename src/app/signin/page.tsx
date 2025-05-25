import type { Metadata } from "next";
import type { JSX } from "react";
import { Signin } from "./_components/signin-page";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "signin",
  description: "signin page",
};

export default async function page(): Promise<JSX.Element> {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return <Signin />;
}

import type { JSX } from "react";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardPage } from "./_components/dashboard-page";
import { getBoards } from "@/lib/helpers/get-boards";

export const metadata: Metadata = {
  title: "Dashboard | ProjectFlow",
  description: "dashboard page",
};

export default async function page(): Promise<JSX.Element> {
  const session = await auth();
  if (!session) redirect("/signin");

  const boards = await getBoards();

  return <DashboardPage boards={boards} />;
}

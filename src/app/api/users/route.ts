import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user)
      return NextResponse.json(
        { error: "Unauthorized", message: "Session missing" },
        { status: 401 },
      );

    const users = await prisma.user.findMany({
      include: {
        accounts: true,
        sessions: true,
        Authenticator: true,
        ownedBoards: true,
        boardMembers: true,
        assignedTasks: true,
        taskComments: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("[GET /api/users]", error);
    return NextResponse.json(
      { error: "Failed to fetch users", message: (error as Error).message },
      { status: 500 },
    );
  }
}

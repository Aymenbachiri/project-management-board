import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";

const protectedRoutes = ["/dashboard"];

export default async function middleware(
  request: NextRequest,
): Promise<NextResponse<unknown>> {
  const session = await auth();

  const isProtected = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route),
  );

  if (!session && isProtected) {
    const absoluteURL = new URL("/", request.nextUrl.origin);
    return NextResponse.redirect(absoluteURL.toString());
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

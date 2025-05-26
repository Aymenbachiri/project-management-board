import type { JSX } from "react";
import { ThemeProvider } from "./theme-povider";
import { Toaster } from "sonner";
import { LenisProvider } from "./lenis-provider";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { Header } from "@/components/home/header";
import NextTopLoader from "nextjs-toploader";

export async function Providers({
  children,
}: {
  children: React.ReactNode;
}): Promise<JSX.Element> {
  const session = await auth();

  return (
    <SessionProvider session={session}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <Header session={session} />
        <NextTopLoader color="red" />
        <LenisProvider />
        <Toaster richColors position="top-right" closeButton />
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}

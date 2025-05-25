import type { JSX } from "react";
import { ThemeProvider } from "./theme-povider";
import { Toaster } from "sonner";
import { LenisProvider } from "./lenis-provider";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { Header } from "@/components/home/header";

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
        <LenisProvider />
        <Toaster richColors position="top-right" />
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}

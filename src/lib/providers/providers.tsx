import type { JSX } from "react";
import { ThemeProvider } from "./theme-povider";
import { Toaster } from "sonner";
import { LenisProvider } from "./lenis-provider";

export function Providers({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <LenisProvider />
      <Toaster richColors position="top-right" />
      {children}
    </ThemeProvider>
  );
}

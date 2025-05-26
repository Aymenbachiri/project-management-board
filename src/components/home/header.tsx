"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/home/theme-toggle";
import { Kanban, Menu, User, X } from "lucide-react";
import { useState, type JSX } from "react";
import Link from "next/link";
import type { Session } from "next-auth";
import { signOut } from "next-auth/react";

const navItems = ["Features", "Analytics", "Pricing", "About"];

type HeaderProps = {
  session: Session | null;
};

export function Header({ session }: HeaderProps): JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <motion.div
          className="flex items-center space-x-2"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <Kanban className="text-primary h-8 w-8" />
          <Link href="/" className="text-xl font-bold">
            ProjectFlow
          </Link>
        </motion.div>

        <nav className="hidden items-center space-x-8 md:flex">
          {navItems.map((item) => (
            <motion.a
              key={item}
              href={`/#${item.toLowerCase()}`}
              className="hover:text-primary text-sm font-medium transition-colors"
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              {item}
            </motion.a>
          ))}
        </nav>

        <div className="flex items-center md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        <div className="hidden items-center space-x-4 md:flex">
          <ThemeToggle />
          {session?.user ? (
            <>
              <div className="flex items-center gap-2">
                <User />
                <h2>{session?.user?.name}</h2>
              </div>
              <Button
                onClick={() => signOut()}
                variant="destructive"
                className="hidden sm:inline-flex"
              >
                Sign Out
              </Button>
              <Button asChild variant="link" className="hidden sm:inline-flex">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            </>
          ) : (
            <Button variant="ghost" className="hidden sm:inline-flex" asChild>
              <Link href="/signin">Sign In</Link>
            </Button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 pb-4 md:hidden"
          >
            <nav className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  onClick={() => setIsOpen(false)}
                  key={item}
                  href={`/#${item.toLowerCase()}`}
                  className="hover:text-primary block text-sm font-medium transition-colors"
                >
                  {item}
                </Link>
              ))}
              <div className="mt-4 flex flex-col gap-2">
                {session?.user ? (
                  <>
                    <div className="flex items-center gap-2">
                      <User />
                      <h2>{session?.user?.name}</h2>
                    </div>
                    <Button
                      asChild
                      variant="link"
                      onClick={() => setIsOpen(false)}
                    >
                      <Link href="/dashboard">Dashboard</Link>
                    </Button>
                    <Button variant="destructive" onClick={() => signOut()}>
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <Button variant="ghost">
                    <Link href="/signin">Sign In</Link>
                  </Button>
                )}
                <ThemeToggle />
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

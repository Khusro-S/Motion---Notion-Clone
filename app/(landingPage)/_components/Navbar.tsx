"use client";

import useScrollTop from "@/hooks/use-scroll-top";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";

import { useConvexAuth } from "convex/react";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/ui/button";

import Logo from "./Logo";

export default function Navbar() {
  const scrolled = useScrollTop();
  const { isAuthenticated, isLoading } = useConvexAuth();

  return (
    <div
      className={cn(
        "z-50 bg-background fixed top-0 flex items-center w-full px-6 py-4 transition-all duration-200 ease-in dark:bg-[#111111]",
        scrolled && "border-b shadow-sm"
      )}
    >
      <Logo />
      <div className="md:ml-auto md:justify-end justify-between w-full flex items-center gap-x-2">
        {isLoading && <Spinner size="lg" />}
        {!isAuthenticated && !isLoading && (
          <>
            <SignInButton mode="modal" fallbackRedirectUrl="/documents">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </SignInButton>
            <SignUpButton mode="modal" fallbackRedirectUrl="/documents">
              <Button size="sm">Get Motion Free</Button>
            </SignUpButton>
          </>
        )}

        {isAuthenticated && !isLoading && (
          <>
            {/* <Button asChild size="sm" variant="ghost">
              <Link href="/documents">Enter Motion</Link>
            </Button> */}
            <UserButton afterSwitchSessionUrl="/" />
          </>
        )}
        <ModeToggle />
      </div>
    </div>
  );
}

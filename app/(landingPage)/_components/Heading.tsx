"use client";

import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { SignInButton } from "@clerk/nextjs";
import { useConvexAuth } from "convex/react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Heading() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium">
        Your Ideas, Documents, & Plans Unified. Welcome to{" "}
        <span className="underline font-bold">Motion</span>
      </h1>
      <h3 className="text-base sm:text-lg md:text-xl font-light">
        Motion is the connected workspace where <br />
        better, faster work happens.
      </h3>
      {isLoading && (
        <div className="w-full flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      )}

      {isAuthenticated && !isLoading && (
        <Button asChild>
          <Link href="/documents">
            Enter Motion <ArrowRight className=" h-4 w-4" />
          </Link>
        </Button>
      )}

      {!isAuthenticated && !isLoading && (
        <SignInButton mode="modal" fallbackRedirectUrl="/documents">
          <Button>
            Get Motion Free <ArrowRight className=" h-4 w-4" />
          </Button>
        </SignInButton>
      )}
    </div>
  );
}

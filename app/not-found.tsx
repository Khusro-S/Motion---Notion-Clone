"use client";

import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="h-full flex flex-col items-center justify-center space-y-4">
      <Image
        src="/error.png"
        alt="404 - Page not found"
        height="300"
        width="300"
        className="dark:hidden"
      />
      <Image
        src="/error-dark.png"
        alt="404 - Page not found"
        height="300"
        width="300"
        className="hidden dark:block"
      />

      <h2 className="text-xl font-medium">Page not found</h2>
      <p className="text-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <div className="flex gap-x-2">
        <Button asChild>
          <Link href="/documents">Go home</Link>
        </Button>
      </div>
    </div>
  );
}

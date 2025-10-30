"use client";

import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Error() {
  return (
    <div className="h-full flex flex-col items-center justify-center space-y-4">
      <Image
        src="/error.png"
        alt="error image"
        height="300"
        width="300"
        className="dark:hidden"
      />
      <Image
        src="/error-dark.png"
        alt="error image"
        height="300"
        width="300"
        className="dark:block hidden"
      />

      <h2 className="text-xl font-medium">Something went wrong</h2>
      <div className="flex gap-x-2">
        <Button asChild>
          <Link href="/documents">Go back</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </div>
  );
}

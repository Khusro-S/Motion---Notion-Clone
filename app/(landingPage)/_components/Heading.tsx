"use client";

import { Button } from "@/components/ui/button";

export default function Heading() {
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
      <Button>
        Enter Motion <span className="font-bold">&#8594;</span>
      </Button>
    </div>
  );
}

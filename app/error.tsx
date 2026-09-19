"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center text-gray-400">
      <h1 className="text-2xl font-semibold text-gray-100">
        Something went wrong
      </h1>
      <p className="max-w-md">
        The dashboard could not finish loading. You can retry, or continue
        browsing market widgets from the home page.
      </p>
      <Button onClick={reset} className="yellow-btn">
        Try again
      </Button>
    </main>
  );
}

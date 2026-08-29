"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@wyliedog/ui/button";

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
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8">
      <span className="font-mono text-[11px] uppercase tracking-wider text-(--color-text-tertiary)">
        Error
      </span>
      <h1 className="mt-3 font-serif text-4xl sm:text-5xl font-semibold tracking-tight">
        Something went wrong.
      </h1>
      <p className="mt-4 max-w-md text-(--color-text-secondary)">
        An unexpected error occurred while rendering this page. You can try
        again or head back to the homepage.
      </p>
      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <Button onClick={() => reset()}>Try again</Button>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          Back home
        </Link>
      </div>
    </div>
  );
}

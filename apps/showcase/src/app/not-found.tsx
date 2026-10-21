import Link from "next/link";
import { buttonVariants } from "@wyliedog/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8">
      <span className="font-mono text-[11px] uppercase tracking-wider text-(--color-foreground-faint)">
        404
      </span>
      <h1 className="mt-3 font-serif text-4xl sm:text-5xl font-semibold tracking-tight">
        Page not found.
      </h1>
      <p className="mt-4 max-w-md text-(--color-foreground-muted)">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <Link
        href="/"
        className={`mt-8 ${buttonVariants({ variant: "default", size: "default" })}`}
      >
        Back home
      </Link>
    </div>
  );
}

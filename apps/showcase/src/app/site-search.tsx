"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@wyliedog/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@wyliedog/ui/dialog";
import { Input } from "@wyliedog/ui/input";
import type { SearchEntry } from "@/lib/showcase-metadata";

interface SiteSearchProps {
  entries: SearchEntry[];
}

const groups = ["Pages", "Components"] as const;

/*
 * The header search: a dialog with a filter field and a list of real links, so
 * every result is reachable with Tab and Enter. Command-K (or Control-K) opens
 * it. The entries come from the server, built from the source files.
 */
export function SiteSearch({ entries }: SiteSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const needle = query.trim().toLowerCase();
  const results = useMemo(
    () =>
      needle
        ? entries.filter((e) => e.label.toLowerCase().includes(needle))
        : entries,
    [entries, needle]
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery("");
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label="Search"
          aria-keyshortcuts="Meta+K Control+K"
          className="h-11 w-11 md:h-8 md:w-8"
        >
          <Search className="size-3.5" aria-hidden />
        </Button>
      </DialogTrigger>
      <DialogContent
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          inputRef.current?.focus();
        }}
      >
        <DialogHeader>
          <DialogTitle>Search</DialogTitle>
          <DialogDescription>
            Find a page or a component. Components open their Storybook docs.
          </DialogDescription>
        </DialogHeader>
        <Input
          ref={inputRef}
          type="search"
          aria-label="Search pages and components"
          placeholder="Search pages and components"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div
          className="max-h-72 overflow-y-auto"
          role="region"
          aria-label="Results"
          tabIndex={0}
        >
          {results.length === 0 ? (
            <p
              role="status"
              className="py-6 text-center text-sm text-(--color-foreground-muted)"
            >
              No results for &ldquo;{query.trim()}&rdquo;.
            </p>
          ) : (
            groups.map((group) => {
              const items = results.filter((e) => e.group === group);
              if (items.length === 0) return null;
              return (
                <section key={group} aria-label={group} className="mb-2">
                  <h3 className="px-2 py-1 text-xs font-semibold text-(--color-foreground-muted)">
                    {group}
                  </h3>
                  <ul>
                    {items.map((entry) => {
                      const className =
                        "flex min-h-11 items-center justify-between rounded-md px-2 text-sm text-(--color-foreground-default) hover:bg-(--color-background-muted)";
                      return (
                        <li key={`${group}-${entry.href}-${entry.label}`}>
                          {entry.external ? (
                            <a
                              href={entry.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={className}
                            >
                              {entry.label}
                              <span className="text-xs text-(--color-foreground-muted)">
                                Storybook ↗
                              </span>
                            </a>
                          ) : (
                            <Link
                              href={entry.href}
                              onClick={() => setOpen(false)}
                              className={className}
                            >
                              {entry.label}
                            </Link>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

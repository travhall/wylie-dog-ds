"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@wyliedog/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@wyliedog/ui/sheet";

interface MobileNavProps {
  links: Array<{ label: string; href: string }>;
}

/*
 * The header's navigation list is hidden below `md`, so a phone gets this
 * sheet instead. It shows only below `md` and closes when a link is chosen.
 */
export function MobileNav({ links }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label="Open menu"
          className="h-11 w-11 md:hidden"
        >
          <Menu className="size-4" aria-hidden />
        </Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription className="sr-only">
            Pages on this site
          </SheetDescription>
        </SheetHeader>
        <nav aria-label="Main" className="mt-6 flex flex-col gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={`flex min-h-11 items-center rounded-md px-3 text-base transition-colors ${
                isActive(link.href)
                  ? "bg-(--color-background-muted) font-medium text-(--color-foreground-default)"
                  : "text-(--color-foreground-muted) hover:bg-(--color-background-muted) hover:text-(--color-foreground-default)"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <a
            href="https://wyliedogstorybook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-11 items-center rounded-md px-3 text-base text-(--color-foreground-muted) transition-colors hover:bg-(--color-background-muted) hover:text-(--color-foreground-default)"
          >
            Storybook ↗
          </a>
        </nav>
      </SheetContent>
    </Sheet>
  );
}

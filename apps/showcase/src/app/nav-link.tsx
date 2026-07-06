"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLinkProps {
  href: string;
  label: string;
}

export function NavLink({ href, label }: NavLinkProps) {
  const pathname = usePathname();
  const isActive =
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
        isActive
          ? "bg-(--color-background-secondary) text-(--color-text-primary) font-medium"
          : "text-(--color-text-secondary) hover:text-(--color-text-primary) hover:bg-(--color-background-secondary)"
      }`}
    >
      {label}
    </Link>
  );
}

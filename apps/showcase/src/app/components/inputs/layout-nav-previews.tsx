"use client";

import type { MouseEvent } from "react";
import { ChevronsUpDown } from "lucide-react";
import { AspectRatio } from "@wyliedog/ui/aspect-ratio";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@wyliedog/ui/breadcrumb";
import { Button } from "@wyliedog/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@wyliedog/ui/collapsible";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@wyliedog/ui/command";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@wyliedog/ui/menubar";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@wyliedog/ui/navigation-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@wyliedog/ui/pagination";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@wyliedog/ui/resizable";
import { ScrollArea } from "@wyliedog/ui/scroll-area";
import { Separator } from "@wyliedog/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@wyliedog/ui/tabs";

/*
 * Live previews for the Layout & Structure and Navigation cards on
 * /components, built from the real @wyliedog/ui components. Links point at
 * the card itself (`#`) and are kept from scrolling the page.
 */

const stay = (e: MouseEvent) => e.preventDefault();

export function AspectRatioPreview() {
  return (
    <div className="flex w-full max-w-56 items-end gap-3">
      <div className="flex-1">
        <AspectRatio ratio={16 / 9}>
          <div className="flex h-full w-full items-center justify-center rounded-md bg-(--color-background-emphasis) font-mono text-xs text-(--color-foreground-muted)">
            16 : 9
          </div>
        </AspectRatio>
      </div>
      <div className="w-14">
        <AspectRatio ratio={1}>
          <div className="flex h-full w-full items-center justify-center rounded-md bg-(--color-background-emphasis) font-mono text-xs text-(--color-foreground-muted)">
            1 : 1
          </div>
        </AspectRatio>
      </div>
    </div>
  );
}

export function CollapsiblePreview() {
  return (
    <Collapsible defaultOpen className="w-full max-w-56 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-(--color-foreground-default)">
          3 starred repositories
        </span>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" aria-label="Toggle repositories">
            <ChevronsUpDown className="size-4" aria-hidden />
          </Button>
        </CollapsibleTrigger>
      </div>
      <div className="rounded-md border border-(--color-border-default) bg-(--color-background-default) px-3 py-2 text-sm">
        @wyliedog/ui
      </div>
      <CollapsibleContent className="space-y-2">
        <div className="rounded-md border border-(--color-border-default) bg-(--color-background-default) px-3 py-2 text-sm">
          @wyliedog/tokens
        </div>
        <div className="rounded-md border border-(--color-border-default) bg-(--color-background-default) px-3 py-2 text-sm">
          token-bridge
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function ResizablePreview() {
  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="h-24 max-w-60 rounded-md border border-(--color-border-default) bg-(--color-background-default)"
    >
      <ResizablePanel defaultSize={35} minSize={20}>
        <div className="flex h-full items-center justify-center text-xs text-(--color-foreground-muted)">
          Sidebar
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle aria-label="Resize sidebar" />
      <ResizablePanel defaultSize={65} minSize={30}>
        <div className="flex h-full items-center justify-center text-xs text-(--color-foreground-default)">
          Editor
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

export function ScrollAreaPreview() {
  const tags = Array.from({ length: 12 }, (_, i) => `v1.${12 - i}.0`);
  return (
    <ScrollArea className="h-24 w-44 rounded-md border border-(--color-border-default) bg-(--color-background-default)">
      <div className="p-3">
        <p className="mb-2 text-xs font-semibold text-(--color-foreground-default)">
          Releases
        </p>
        {tags.map((tag) => (
          <div key={tag}>
            <div className="py-1 text-xs text-(--color-foreground-muted)">
              {tag}
            </div>
            <Separator />
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

export function SeparatorPreview() {
  return (
    <div className="w-full max-w-52 text-sm text-(--color-foreground-default)">
      <p className="font-semibold">Wylie Dog</p>
      <p className="text-xs text-(--color-foreground-muted)">
        Tokens to components.
      </p>
      <Separator className="my-3" />
      <div className="flex h-5 items-center gap-2 text-xs">
        <span>Docs</span>
        <Separator orientation="vertical" />
        <span>Tokens</span>
        <Separator orientation="vertical" />
        <span>Code</span>
      </div>
    </div>
  );
}

export function BreadcrumbPreview() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/components">Components</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export function CommandPreview() {
  return (
    <Command className="w-full max-w-60 rounded-md border border-(--color-border-default) bg-(--color-background-default)">
      <CommandInput placeholder="Type a command…" aria-label="Command" />
      <CommandList>
        <CommandGroup heading="Suggestions">
          <CommandItem>
            Open tokens <CommandShortcut>⌘K</CommandShortcut>
          </CommandItem>
          <CommandItem>
            Switch theme <CommandShortcut>⌘J</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

export function MenubarPreview() {
  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            New tab <MenubarShortcut>⌘T</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Print <MenubarShortcut>⌘P</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem disabled>Share</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            Undo <MenubarShortcut>⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Zoom in</MenubarItem>
          <MenubarItem>Zoom out</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}

/* Links only: a dropdown panel would be clipped by the card. */
export function NavigationMenuPreview() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        {["Overview", "Tokens", "Components"].map((label) => (
          <NavigationMenuItem key={label}>
            <NavigationMenuLink
              href="#"
              onClick={stay}
              className={navigationMenuTriggerStyle}
            >
              {label}
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

export function PaginationPreview() {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" onClick={stay} />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" onClick={stay}>
            1
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive onClick={stay}>
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" onClick={stay} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export function TabsPreview() {
  return (
    <Tabs defaultValue="tokens" className="w-full max-w-60">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="tokens">Tokens</TabsTrigger>
        <TabsTrigger value="usage">Usage</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="text-sm">
        A shared library of tokens and components.
      </TabsContent>
      <TabsContent value="tokens" className="text-sm">
        Primitive, semantic and component tiers.
      </TabsContent>
      <TabsContent value="usage" className="text-sm">
        Import each component from its own path.
      </TabsContent>
    </Tabs>
  );
}

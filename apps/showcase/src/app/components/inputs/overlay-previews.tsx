"use client";

import type { ReactNode } from "react";
import { Info } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@wyliedog/ui/alert-dialog";
import { Button } from "@wyliedog/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@wyliedog/ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@wyliedog/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@wyliedog/ui/dropdown-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@wyliedog/ui/hover-card";
import { Input } from "@wyliedog/ui/input";
import { Label } from "@wyliedog/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@wyliedog/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@wyliedog/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@wyliedog/ui/tooltip";

function Hint({ text, children }: { text: string; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      {children}
      <p className="text-xs text-(--color-foreground-muted)">{text}</p>
    </div>
  );
}

/*
 * Overlays cannot sit open inside a card, so each preview is the real
 * trigger. Activate it to open the real overlay.
 */

function AlertDialogDemo() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          Delete project
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this project?</AlertDialogTitle>
          <AlertDialogDescription>
            This removes the project and its tokens. It cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function ContextMenuDemo() {
  return (
    <ContextMenu>
      <ContextMenuTrigger
        tabIndex={0}
        aria-label="Right-click or press Shift and F10 to open the menu"
        className="flex h-20 w-full max-w-52 items-center justify-center rounded-md border border-dashed border-(--color-border-default) bg-(--color-background-default) px-2 text-center text-xs text-(--color-foreground-muted)"
      >
        Right-click here
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>
          Back <ContextMenuShortcut>⌘[</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          Reload <ContextMenuShortcut>⌘R</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>Inspect</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

function DialogDemo() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Edit profile
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Change how your name appears to others.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Label htmlFor="dialog-preview-name">Display name</Label>
          <Input id="dialog-preview-name" defaultValue="Elena Mori" />
        </div>
        <DialogFooter>
          <Button>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DropdownMenuDemo() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          Open menu
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          Profile <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          Settings <DropdownMenuShortcut>⌘,</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem disabled>Billing</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function HoverCardDemo() {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link" size="sm">
          @wyliedog
        </Button>
      </HoverCardTrigger>
      <HoverCardContent>
        <p className="text-sm font-semibold">Wylie Dog</p>
        <p className="text-xs text-(--color-foreground-muted)">
          Design tokens and components that stay in sync between Figma and code.
        </p>
      </HoverCardContent>
    </HoverCard>
  );
}

function PopoverDemo() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          Open popover
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="flex flex-col gap-2">
          <Label htmlFor="popover-preview-width">Width</Label>
          <Input id="popover-preview-width" size="sm" defaultValue="100%" />
        </div>
      </PopoverContent>
    </Popover>
  );
}

function SheetDemo() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          Open sheet
        </Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>
            Narrow the component list by category.
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}

function TooltipDemo() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon" aria-label="More information">
            <Info className="size-4" aria-hidden />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Tokens are the contract</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function AlertDialogPreview() {
  return (
    <Hint text="Opens a confirmation">
      <AlertDialogDemo />
    </Hint>
  );
}

export function ContextMenuPreview() {
  return (
    <Hint text="Also opens with Shift and F10">
      <ContextMenuDemo />
    </Hint>
  );
}

export function DialogPreview() {
  return (
    <Hint text="Opens a modal form">
      <DialogDemo />
    </Hint>
  );
}

export function DropdownMenuPreview() {
  return (
    <Hint text="Opens a menu of actions">
      <DropdownMenuDemo />
    </Hint>
  );
}

export function HoverCardPreview() {
  return (
    <Hint text="Hover or focus the handle">
      <HoverCardDemo />
    </Hint>
  );
}

export function PopoverPreview() {
  return (
    <Hint text="Opens a small panel">
      <PopoverDemo />
    </Hint>
  );
}

export function SheetPreview() {
  return (
    <Hint text="Slides in from the right">
      <SheetDemo />
    </Hint>
  );
}

export function TooltipPreview() {
  return (
    <Hint text="Hover or focus the icon">
      <TooltipDemo />
    </Hint>
  );
}

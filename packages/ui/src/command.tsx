"use client";

import React from "react";
import { SearchIcon } from "lucide-react";
import { cn } from "./lib/utils";

interface CommandProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Accessible label for the command palette */
  label?: string;
  /** ID for the command listbox (for aria-controls) */
  listboxId?: string;
}

const Command = React.forwardRef<HTMLDivElement, CommandProps>(
  ({ className, label = "Command palette", listboxId = "command-listbox", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-md bg-[var(--color-command-background)] text-[var(--color-command-text)]",
        className
      )}
      role="combobox"
      aria-label={label}
      aria-expanded="true"
      aria-haspopup="listbox"
      aria-controls={listboxId}
      {...props}
    />
  )
);
Command.displayName = "Command";

interface CommandInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Label for the search input */
  "aria-label"?: string;
  /** ID for the command listbox (for aria-controls) */
  listboxId?: string;
}

const CommandInput = React.forwardRef<HTMLInputElement, CommandInputProps>(
  ({ className, "aria-label": ariaLabel = "Search commands", listboxId = "command-listbox", ...props }, ref) => (
    <div className="flex items-center border-b border-[var(--color-command-border)] px-3" cmdk-input-wrapper="">
      <SearchIcon className="mr-2 h-4 w-4 shrink-0 opacity-50" aria-hidden="true" />
      <input
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-[var(--color-command-placeholder)] disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        role="combobox"
        aria-autocomplete="list"
        aria-label={ariaLabel}
        aria-expanded="true"
        aria-controls={listboxId}
        {...props}
      />
    </div>
  )
);
CommandInput.displayName = "CommandInput";

interface CommandListProps extends React.HTMLAttributes<HTMLDivElement> {
  /** ID for the command listbox */
  id?: string;
}

const CommandList = React.forwardRef<HTMLDivElement, CommandListProps>(
  ({ className, id = "command-listbox", ...props }, ref) => (
    <div
      ref={ref}
      id={id}
      className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)}
      role="listbox"
      aria-label="Command options"
      {...props}
    />
  )
);
CommandList.displayName = "CommandList";

interface CommandEmptyProps extends React.HTMLAttributes<HTMLDivElement> {}

const CommandEmpty = React.forwardRef<HTMLDivElement, CommandEmptyProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("py-6 text-center text-sm text-[var(--color-command-empty)]", className)}
      role="status"
      aria-live="polite"
      {...props}
    />
  )
);
CommandEmpty.displayName = "CommandEmpty";

interface CommandGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Accessible label for the command group */
  heading?: string;
}

const CommandGroup = React.forwardRef<HTMLDivElement, CommandGroupProps>(
  ({ className, heading, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "overflow-hidden p-1 text-[var(--color-command-text)] [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-[var(--color-command-group-heading)]",
        className
      )}
      role="group"
      aria-label={heading}
      {...props}
    />
  )
);
CommandGroup.displayName = "CommandGroup";

interface CommandSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

const CommandSeparator = React.forwardRef<HTMLDivElement, CommandSeparatorProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("-mx-1 h-px bg-[var(--color-command-separator)]", className)}
      role="separator"
      aria-hidden="true"
      {...props}
    />
  )
);
CommandSeparator.displayName = "CommandSeparator";

interface CommandItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether this command item is disabled */
  disabled?: boolean;
  /** Value for the command item (for selection) */
  value?: string;
}

const CommandItem = React.forwardRef<HTMLDivElement, CommandItemProps>(
  ({ className, disabled = false, value, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-[var(--color-command-item-selected)] aria-selected:text-[var(--color-command-item-text-selected)] data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
        className
      )}
      role="option"
      aria-disabled={disabled}
      aria-selected="false"
      data-disabled={disabled}
      data-value={value}
      {...props}
    />
  )
);
CommandItem.displayName = "CommandItem";

interface CommandShortcutProps extends React.HTMLAttributes<HTMLSpanElement> {}

const CommandShortcut = React.forwardRef<HTMLSpanElement, CommandShortcutProps>(
  ({ className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "ml-auto text-xs tracking-widest text-[var(--color-command-shortcut)]",
          className
        )}
        aria-label="Keyboard shortcut"
        {...props}
      />
    );
  }
);
CommandShortcut.displayName = "CommandShortcut";

export {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};

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
  (
    {
      className,
      label = "Command palette",
      listboxId = "command-listbox",
      ...props
    },
    ref
  ) => (
    <div
      ref={ref}
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-(--space-command-content-radius) bg-(--color-command-background) text-(--color-command-text)",
        className
      )}
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
  (
    {
      className,
      "aria-label": ariaLabel = "Search commands",
      listboxId = "command-listbox",
      ...props
    },
    ref
  ) => (
    <div
      className="flex items-center border-b border-(--color-command-border) px-(--space-command-item-padding-x)"
      cmdk-input-wrapper=""
    >
      <SearchIcon
        className="mr-(--space-command-item-indicator-margin-right) h-(--space-command-input-icon-size) w-(--space-command-input-icon-size) shrink-0 opacity-(--state-opacity-disabled)"
        aria-hidden="true"
      />
      <input
        ref={ref}
        className={cn(
          "flex h-(--space-command-input-height) w-full rounded-(--space-command-content-radius) bg-transparent py-(--space-command-input-padding-y) text-(length:--font-size-command-item-font-size) outline-none placeholder:text-(--color-command-placeholder) disabled:cursor-not-allowed disabled:opacity-(--state-opacity-disabled)",
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
      className={cn(
        "max-h-(--space-command-list-max-height) overflow-y-auto overflow-x-hidden",
        className
      )}
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
      className={cn(
        "py-(--space-command-empty-padding-y) text-center text-(length:--font-size-command-item-font-size) text-(--color-command-empty)",
        className
      )}
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
  ({ className, heading, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "overflow-hidden p-(--space-command-group-padding) text-(--color-command-text) **:[[cmdk-group-heading]]:px-(--space-command-group-heading-padding-x) **:[[cmdk-group-heading]]:py-(--space-command-group-heading-padding-y) **:[[cmdk-group-heading]]:text-(length:--font-size-command-group-heading-font-size) **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group-heading]]:text-(--color-command-group-heading)",
        className
      )}
      role="group"
      aria-label={heading}
      {...props}
    >
      {heading && (
        <div
          cmdk-group-heading=""
          className="px-(--space-command-group-heading-padding-x) py-(--space-command-group-heading-padding-y) text-(length:--font-size-command-group-heading-font-size) font-medium text-(--color-command-group-heading)"
        >
          {heading}
        </div>
      )}
      {children}
    </div>
  )
);
CommandGroup.displayName = "CommandGroup";

interface CommandSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

const CommandSeparator = React.forwardRef<
  HTMLDivElement,
  CommandSeparatorProps
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "-mx-(--space-command-separator-margin-x) h-px bg-(--color-command-separator)",
      className
    )}
    role="separator"
    aria-hidden="true"
    {...props}
  />
));
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
        "relative flex cursor-default select-none items-center rounded-(--space-command-item-radius) px-(--space-command-item-padding-x) py-(--space-command-item-padding-y) text-(length:--font-size-command-item-font-size) outline-none aria-selected:bg-(--color-command-item-selected) aria-selected:text-(--color-command-item-text-selected) data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-(--state-opacity-disabled)",
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
          "ml-auto text-(length:--font-size-command-group-heading-font-size) tracking-(--space-typography-tracking-widest) text-(--color-command-shortcut)",
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

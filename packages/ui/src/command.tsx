"use client";

import React, { createContext, useContext, useId } from "react";
import { SearchIcon } from "lucide-react";
import { cn } from "./lib/utils";

// Coordinates the listbox id between CommandInput (aria-controls) and
// CommandList (id) without requiring every consumer to generate and pass a
// matching id manually — mirrors the FormField id-context pattern.
const CommandListboxContext = createContext<string | null>(null);

interface CommandProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Accessible label for the command palette */
  label?: string;
  /** ID for the command listbox (for aria-controls). Auto-generated if omitted. */
  listboxId?: string;
}

const Command = React.forwardRef<HTMLDivElement, CommandProps>(
  ({ className, label = "Command palette", listboxId, ...props }, ref) => {
    const generatedId = useId();
    const resolvedId = listboxId ?? `command-listbox-${generatedId}`;

    return (
      <CommandListboxContext.Provider value={resolvedId}>
        <div
          ref={ref}
          className={cn(
            "flex h-full w-full flex-col overflow-hidden rounded-(--space-command-content-radius) bg-(--color-command-background) text-(--color-command-text)",
            className
          )}
          {...props}
        />
      </CommandListboxContext.Provider>
    );
  }
);
Command.displayName = "Command";

interface CommandInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Label for the search input */
  "aria-label"?: string;
  /** ID for the command listbox (for aria-controls). Defaults to the id from the nearest <Command>. */
  listboxId?: string;
}

const CommandInput = React.forwardRef<HTMLInputElement, CommandInputProps>(
  (
    {
      className,
      "aria-label": ariaLabel = "Search commands",
      listboxId,
      ...props
    },
    ref
  ) => {
    const contextId = useContext(CommandListboxContext);
    const resolvedListboxId = listboxId ?? contextId ?? undefined;

    return (
      <div
        className="flex items-center border-b border-(--color-command-border) px-(--space-command-item-padding-x)"
        cmdk-input-wrapper=""
      >
        <SearchIcon
          className="mr-(--space-command-item-indicator-margin-right) h-(--space-command-input-icon-size) w-(--space-command-input-icon-size) shrink-0 opacity-(--command-input-icon-opacity)"
          aria-hidden="true"
        />
        <input
          ref={ref}
          className={cn(
            "flex h-(--space-command-input-height) w-full rounded-(--space-command-content-radius) bg-transparent py-(--space-command-input-padding-y) text-(length:--font-size-command-item-font-size) outline-none placeholder:text-(--color-command-placeholder) disabled:cursor-not-allowed disabled:opacity-(--command-input-disabled-opacity)",
            className
          )}
          role="combobox"
          aria-autocomplete="list"
          aria-label={ariaLabel}
          aria-expanded="true"
          aria-controls={resolvedListboxId}
          {...props}
        />
      </div>
    );
  }
);
CommandInput.displayName = "CommandInput";

interface CommandListProps extends React.HTMLAttributes<HTMLDivElement> {
  /** ID for the command listbox. Defaults to the id from the nearest <Command>. */
  id?: string;
  /** ARIA role for the inner listbox wrapper — defaults to "listbox". */
  role?: string;
}

const CommandList = React.forwardRef<HTMLDivElement, CommandListProps>(
  ({ className, id, role = "listbox", children, ...props }, ref) => {
    const contextId = useContext(CommandListboxContext);
    const resolvedId = id ?? contextId ?? undefined;

    // role="listbox" may only directly contain role="option"/"group"
    // elements per ARIA, so CommandEmpty (role-less status text) is pulled
    // out and rendered as a sibling instead of a child of the listbox.
    const childArray = React.Children.toArray(children);
    const isCommandEmpty = (child: React.ReactNode) =>
      React.isValidElement(child) &&
      (child.type as { displayName?: string }).displayName === "CommandEmpty";
    const emptyChildren = childArray.filter(isCommandEmpty);
    const listboxChildren = childArray.filter(
      (child) => !isCommandEmpty(child)
    );

    return (
      <div
        ref={ref}
        tabIndex={0}
        className={cn(
          "max-h-(--space-command-list-max-height) overflow-y-auto overflow-x-hidden",
          className
        )}
        {...props}
      >
        {emptyChildren}
        <div id={resolvedId} role={role} aria-label="Command options">
          {listboxChildren}
        </div>
      </div>
    );
  }
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
        "overflow-hidden p-(--space-command-group-padding) text-(--color-command-text) **:[[cmdk-group-heading]]:px-(--space-command-group-heading-padding-x) **:[[cmdk-group-heading]]:py-(--space-command-group-heading-padding-y) **:[[cmdk-group-heading]]:text-(length:--font-size-command-group-heading-font-size) **:[[cmdk-group-heading]]:font-(--font-weight-command-group-heading-font-weight) **:[[cmdk-group-heading]]:text-(--color-command-group-heading)",
        className
      )}
      role="group"
      aria-label={heading}
      {...props}
    >
      {heading && (
        <div
          cmdk-group-heading=""
          className="px-(--space-command-group-heading-padding-x) py-(--space-command-group-heading-padding-y) text-(length:--font-size-command-group-heading-font-size) font-(--font-weight-command-group-heading-font-weight) text-(--color-command-group-heading)"
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
        "relative flex cursor-default select-none items-center rounded-(--space-command-item-radius) px-(--space-command-item-padding-x) py-(--space-command-item-padding-y) text-(length:--font-size-command-item-font-size) outline-none aria-selected:bg-(--color-command-item-selected) aria-selected:text-(--color-command-item-text-selected) data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-(--command-item-disabled-opacity)",
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
          "ml-auto text-(length:--font-size-command-group-heading-font-size) tracking-(--space-command-shortcut-letter-spacing) text-(--color-command-shortcut)",
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

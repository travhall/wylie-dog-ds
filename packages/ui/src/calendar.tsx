"use client";

import React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { cn } from "./lib/utils";

interface CalendarProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onSelect"
> {
  mode?: "single" | "multiple" | "range";
  selected?: Date | Date[] | { from?: Date; to?: Date };
  onSelect?: (
    date: Date | Date[] | { from?: Date; to?: Date } | undefined
  ) => void;
}

const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(
  ({ className, mode, selected, onSelect, ...props }, ref) => (
    <div ref={ref} className={cn("p-3", className)} {...props}>
      <div className="space-y-4">
        <CalendarHeader />
        <CalendarGrid onSelect={onSelect} />
      </div>
    </div>
  )
);
Calendar.displayName = "Calendar";

const CalendarHeader = () => (
  <div className="flex items-center justify-between">
    <button
      aria-label="Previous month"
      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-[var(--color-background)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-[var(--color-calendar-nav-border)] bg-transparent hover:bg-[var(--color-calendar-nav-hover)] hover:text-[var(--color-calendar-nav-text-hover)] h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
    >
      <ChevronLeftIcon className="h-4 w-4" />
    </button>
    <div className="text-sm font-medium">January 2024</div>
    <button
      aria-label="Next month"
      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-[var(--color-background)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-[var(--color-calendar-nav-border)] bg-transparent hover:bg-[var(--color-calendar-nav-hover)] hover:text-[var(--color-calendar-nav-text-hover)] h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
    >
      <ChevronRightIcon className="h-4 w-4" />
    </button>
  </div>
);

const CalendarGrid = ({
  onSelect,
}: {
  onSelect?: (
    date: Date | Date[] | { from?: Date; to?: Date } | undefined
  ) => void;
}) => (
  <div className="grid grid-cols-7 gap-1">
    <div className="h-9 w-9 text-center text-xs font-normal text-[var(--color-calendar-header-text)]">
      Su
    </div>
    <div className="h-9 w-9 text-center text-xs font-normal text-[var(--color-calendar-header-text)]">
      Mo
    </div>
    <div className="h-9 w-9 text-center text-xs font-normal text-[var(--color-calendar-header-text)]">
      Tu
    </div>
    <div className="h-9 w-9 text-center text-xs font-normal text-[var(--color-calendar-header-text)]">
      We
    </div>
    <div className="h-9 w-9 text-center text-xs font-normal text-[var(--color-calendar-header-text)]">
      Th
    </div>
    <div className="h-9 w-9 text-center text-xs font-normal text-[var(--color-calendar-header-text)]">
      Fr
    </div>
    <div className="h-9 w-9 text-center text-xs font-normal text-[var(--color-calendar-header-text)]">
      Sa
    </div>
    {Array.from({ length: 31 }, (_, i) => (
      <button
        key={i}
        onClick={() => onSelect?.(new Date(2024, 0, i + 1))}
        className={cn(
          "h-9 w-9 p-0 font-normal rounded-md text-sm transition-colors",
          "hover:bg-[var(--color-calendar-day-hover)] hover:text-[var(--color-calendar-day-text-hover)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]",
          i + 1 === 15 &&
            "bg-[var(--color-calendar-day-selected)] text-[var(--color-calendar-day-text-selected)]"
        )}
      >
        {i + 1}
      </button>
    ))}
  </div>
);

export { Calendar };

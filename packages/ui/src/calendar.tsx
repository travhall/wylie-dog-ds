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
    <div
      ref={ref}
      className={cn("p-(--spacing-calendar-container-padding)", className)}
      {...props}
    >
      <div className="space-y-(--spacing-calendar-container-gap)">
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
      className="inline-flex items-center justify-center rounded-(--spacing-calendar-nav-button-radius) text-(length:--font-size-calendar-header-font-size) font-medium ring-offset-(--color-background) transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-border-focus) focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-(--color-calendar-nav-border) bg-transparent hover:bg-(--color-calendar-nav-hover) hover:text-(--color-calendar-nav-text-hover) h-(--spacing-calendar-nav-button-size) w-(--spacing-calendar-nav-button-size) p-(--spacing-calendar-nav-button-padding) opacity-50 hover:opacity-100"
    >
      <ChevronLeftIcon className="h-(--spacing-calendar-nav-icon-size) w-(--spacing-calendar-nav-icon-size)" />
    </button>
    <div className="text-(length:--font-size-calendar-header-font-size) font-medium">
      January 2024
    </div>
    <button
      aria-label="Next month"
      className="inline-flex items-center justify-center rounded-(--spacing-calendar-nav-button-radius) text-(length:--font-size-calendar-header-font-size) font-medium ring-offset-(--color-background) transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-border-focus) focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-(--color-calendar-nav-border) bg-transparent hover:bg-(--color-calendar-nav-hover) hover:text-(--color-calendar-nav-text-hover) h-(--spacing-calendar-nav-button-size) w-(--spacing-calendar-nav-button-size) p-(--spacing-calendar-nav-button-padding) opacity-50 hover:opacity-100"
    >
      <ChevronRightIcon className="h-(--spacing-calendar-nav-icon-size) w-(--spacing-calendar-nav-icon-size)" />
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
  <div className="grid grid-cols-7 gap-(--spacing-calendar-months-gap)">
    <div className="h-(--spacing-calendar-cell-size) w-(--spacing-calendar-cell-size) text-center text-(length:--font-size-calendar-day-font-size) font-normal text-(--color-calendar-header-text)">
      Su
    </div>
    <div className="h-(--spacing-calendar-cell-size) w-(--spacing-calendar-cell-size) text-center text-(length:--font-size-calendar-day-font-size) font-normal text-(--color-calendar-header-text)">
      Mo
    </div>
    <div className="h-(--spacing-calendar-cell-size) w-(--spacing-calendar-cell-size) text-center text-(length:--font-size-calendar-day-font-size) font-normal text-(--color-calendar-header-text)">
      Tu
    </div>
    <div className="h-(--spacing-calendar-cell-size) w-(--spacing-calendar-cell-size) text-center text-(length:--font-size-calendar-day-font-size) font-normal text-(--color-calendar-header-text)">
      We
    </div>
    <div className="h-(--spacing-calendar-cell-size) w-(--spacing-calendar-cell-size) text-center text-(length:--font-size-calendar-day-font-size) font-normal text-(--color-calendar-header-text)">
      Th
    </div>
    <div className="h-(--spacing-calendar-cell-size) w-(--spacing-calendar-cell-size) text-center text-(length:--font-size-calendar-day-font-size) font-normal text-(--color-calendar-header-text)">
      Fr
    </div>
    <div className="h-(--spacing-calendar-cell-size) w-(--spacing-calendar-cell-size) text-center text-(length:--font-size-calendar-day-font-size) font-normal text-(--color-calendar-header-text)">
      Sa
    </div>
    {Array.from({ length: 31 }, (_, i) => (
      <button
        key={i}
        onClick={() => onSelect?.(new Date(2024, 0, i + 1))}
        className={cn(
          "h-(--spacing-calendar-day-size) w-(--spacing-calendar-day-size) p-(--spacing-calendar-nav-button-padding) font-normal rounded-(--spacing-calendar-nav-button-radius) text-(length:--font-size-calendar-header-font-size) transition-colors",
          "hover:bg-(--color-calendar-day-hover) hover:text-(--color-calendar-day-text-hover)",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-border-focus)",
          i + 1 === 15 &&
            "bg-(--color-calendar-day-selected) text-(--color-calendar-day-text-selected)"
        )}
      >
        {i + 1}
      </button>
    ))}
  </div>
);

export { Calendar };

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
  ({ className, onSelect, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("p-(--space-calendar-container-padding)", className)}
      {...props}
    >
      <div className="space-y-(--space-calendar-container-gap)">
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
      className="inline-flex items-center justify-center rounded-(--space-calendar-nav-button-radius) text-(length:--font-size-calendar-header-font-size) font-(--font-weight-calendar-nav-button-font-weight) transition-colors focus-visible:outline-solid focus-visible:outline-(length:--space-focus-width) focus-visible:outline-(color:--color-focus-ring) focus-visible:outline-offset-(length:--space-focus-offset) focus-visible:shadow-[0_0_0_calc(var(--space-focus-offset)+var(--space-focus-width)+var(--space-focus-halo-width))_var(--color-focus-halo)] focus-visible:transition-none disabled:pointer-events-none disabled:text-(--color-calendar-nav-text-disabled) disabled:border-(--color-calendar-nav-border-disabled) border border-(--color-calendar-nav-border) bg-transparent hover:bg-(--color-calendar-nav-hover) hover:text-(--color-calendar-nav-text-hover) h-(--space-calendar-nav-button-size) w-(--space-calendar-nav-button-size) p-(--space-calendar-nav-button-padding) opacity-(--calendar-nav-button-opacity) hover:opacity-(--calendar-nav-button-opacity-hover)"
    >
      <ChevronLeftIcon className="h-(--space-calendar-nav-icon-size) w-(--space-calendar-nav-icon-size)" />
    </button>
    <div className="text-(length:--font-size-calendar-header-font-size) font-(--font-weight-calendar-header-font-weight)">
      January 2024
    </div>
    <button
      aria-label="Next month"
      className="inline-flex items-center justify-center rounded-(--space-calendar-nav-button-radius) text-(length:--font-size-calendar-header-font-size) font-(--font-weight-calendar-nav-button-font-weight) transition-colors focus-visible:outline-solid focus-visible:outline-(length:--space-focus-width) focus-visible:outline-(color:--color-focus-ring) focus-visible:outline-offset-(length:--space-focus-offset) focus-visible:shadow-[0_0_0_calc(var(--space-focus-offset)+var(--space-focus-width)+var(--space-focus-halo-width))_var(--color-focus-halo)] focus-visible:transition-none disabled:pointer-events-none disabled:text-(--color-calendar-nav-text-disabled) disabled:border-(--color-calendar-nav-border-disabled) border border-(--color-calendar-nav-border) bg-transparent hover:bg-(--color-calendar-nav-hover) hover:text-(--color-calendar-nav-text-hover) h-(--space-calendar-nav-button-size) w-(--space-calendar-nav-button-size) p-(--space-calendar-nav-button-padding) opacity-(--calendar-nav-button-opacity) hover:opacity-(--calendar-nav-button-opacity-hover)"
    >
      <ChevronRightIcon className="h-(--space-calendar-nav-icon-size) w-(--space-calendar-nav-icon-size)" />
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
  <div className="grid grid-cols-7 gap-(--space-calendar-months-gap)">
    <div className="h-(--space-calendar-cell-size) w-(--space-calendar-cell-size) text-center text-(length:--font-size-calendar-day-font-size) font-(--font-weight-calendar-day-header-font-weight) text-(--color-calendar-header-text)">
      Su
    </div>
    <div className="h-(--space-calendar-cell-size) w-(--space-calendar-cell-size) text-center text-(length:--font-size-calendar-day-font-size) font-(--font-weight-calendar-day-header-font-weight) text-(--color-calendar-header-text)">
      Mo
    </div>
    <div className="h-(--space-calendar-cell-size) w-(--space-calendar-cell-size) text-center text-(length:--font-size-calendar-day-font-size) font-(--font-weight-calendar-day-header-font-weight) text-(--color-calendar-header-text)">
      Tu
    </div>
    <div className="h-(--space-calendar-cell-size) w-(--space-calendar-cell-size) text-center text-(length:--font-size-calendar-day-font-size) font-(--font-weight-calendar-day-header-font-weight) text-(--color-calendar-header-text)">
      We
    </div>
    <div className="h-(--space-calendar-cell-size) w-(--space-calendar-cell-size) text-center text-(length:--font-size-calendar-day-font-size) font-(--font-weight-calendar-day-header-font-weight) text-(--color-calendar-header-text)">
      Th
    </div>
    <div className="h-(--space-calendar-cell-size) w-(--space-calendar-cell-size) text-center text-(length:--font-size-calendar-day-font-size) font-(--font-weight-calendar-day-header-font-weight) text-(--color-calendar-header-text)">
      Fr
    </div>
    <div className="h-(--space-calendar-cell-size) w-(--space-calendar-cell-size) text-center text-(length:--font-size-calendar-day-font-size) font-(--font-weight-calendar-day-header-font-weight) text-(--color-calendar-header-text)">
      Sa
    </div>
    {Array.from({ length: 31 }, (_, i) => (
      <button
        key={i}
        onClick={() => onSelect?.(new Date(2024, 0, i + 1))}
        className={cn(
          "h-(--space-calendar-day-size) w-(--space-calendar-day-size) p-(--space-calendar-nav-button-padding) font-(--font-weight-calendar-day-font-weight) rounded-(--space-calendar-nav-button-radius) text-(length:--font-size-calendar-header-font-size) transition-colors",
          "hover:bg-(--color-calendar-day-hover) hover:text-(--color-calendar-day-text-hover)",
          "focus-visible:outline-solid focus-visible:outline-(length:--space-focus-width) focus-visible:outline-(color:--color-focus-ring) focus-visible:outline-offset-(length:--space-focus-offset) focus-visible:shadow-[0_0_0_calc(var(--space-focus-offset)+var(--space-focus-width)+var(--space-focus-halo-width))_var(--color-focus-halo)] focus-visible:transition-none",
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

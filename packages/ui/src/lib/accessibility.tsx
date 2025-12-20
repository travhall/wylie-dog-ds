/**
 * Accessibility Utilities for Wylie Dog Design System
 *
 * These utilities help with common accessibility patterns and focus management
 */

import type React from "react";
import { useEffect, useRef, useCallback } from "react";

/**
 * Hook for trapping focus within a container (for modals, dialogs)
 */
export function useFocusTrap(isActive: boolean = true) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        const escapeEvent = new CustomEvent("escape-pressed");
        container.dispatchEvent(escapeEvent);
      }
    };

    // Focus first element when trap becomes active
    if (firstElement) {
      firstElement.focus();
    }

    document.addEventListener("keydown", handleTabKey);
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("keydown", handleTabKey);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isActive]);

  return containerRef;
}

/**
 * Hook for restoring focus to a previous element
 */
export function useFocusRestore() {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const saveFocus = useCallback(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
  }, []);

  const restoreFocus = useCallback(() => {
    if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, []);

  return { saveFocus, restoreFocus };
}

/**
 * Hook for managing announcements to screen readers
 */
export function useScreenReaderAnnouncement() {
  const announcementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Create announcement container if it doesn't exist
    if (!announcementRef.current) {
      const announcer = document.createElement("div");
      announcer.setAttribute("aria-live", "polite");
      announcer.setAttribute("aria-atomic", "true");
      announcer.className = "sr-only";
      announcer.id = "wylie-announcer";
      document.body.appendChild(announcer);
      announcementRef.current = announcer;
    }

    return () => {
      if (
        announcementRef.current &&
        document.body.contains(announcementRef.current)
      ) {
        document.body.removeChild(announcementRef.current);
      }
    };
  }, []);

  const announce = useCallback(
    (message: string, priority: "polite" | "assertive" = "polite") => {
      if (!announcementRef.current) return;

      announcementRef.current.setAttribute("aria-live", priority);
      announcementRef.current.textContent = message;

      // Clear after announcement
      setTimeout(() => {
        if (announcementRef.current) {
          announcementRef.current.textContent = "";
        }
      }, 1000);
    },
    []
  );

  return announce;
}

/**
 * Generate accessible IDs for form elements
 */
export function generateAccessibleId(prefix: string = "wylie"): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get accessible label for form fields
 */
export function getAccessibleLabel(
  label: string,
  required: boolean = false,
  optional: boolean = false
): string {
  let accessibleLabel = label;

  if (required) {
    accessibleLabel += " (required)";
  } else if (optional) {
    accessibleLabel += " (optional)";
  }

  return accessibleLabel;
}

/**
 * Check if an element is focusable
 */
export function isFocusable(element: HTMLElement): boolean {
  const focusableSelectors = [
    "button:not([disabled])",
    "[href]",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ];

  return focusableSelectors.some((selector) => element.matches(selector));
}

/**
 * Get all focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    "button:not([disabled])",
    "[href]",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ];

  const elements = container.querySelectorAll(focusableSelectors.join(", "));
  return Array.from(elements) as HTMLElement[];
}

/**
 * Keyboard navigation helpers
 */
export const keyboardHelpers = {
  isEnterOrSpace: (event: React.KeyboardEvent) =>
    event.key === "Enter" || event.key === " ",

  isArrowKey: (event: React.KeyboardEvent) =>
    ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key),

  isEscape: (event: React.KeyboardEvent) => event.key === "Escape",

  isTab: (event: React.KeyboardEvent) => event.key === "Tab",

  preventDefaultAndStopPropagation: (event: React.KeyboardEvent) => {
    event.preventDefault();
    event.stopPropagation();
  },
};

/**
 * Skip link component for keyboard navigation
 */
export interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function SkipLink({ href, children, className = "" }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={`sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:p-4 focus:bg-(--color-background-primary) focus:text-(--color-text-primary) focus:border focus:border-(--color-border-focus) ${className}`}
      onFocus={(e) => e.currentTarget.scrollIntoView()}
    >
      {children}
    </a>
  );
}

/**
 * Screen reader only text component
 */
export interface ScreenReaderOnlyProps {
  children: React.ReactNode;
  as?: keyof React.JSX.IntrinsicElements;
}

export function ScreenReaderOnly({
  children,
  as: Component = "span",
}: ScreenReaderOnlyProps) {
  return <Component className="sr-only">{children}</Component>;
}

import type { Meta, StoryObj } from "@storybook/react-vite";
import { within, userEvent, expect, screen } from "storybook/test";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@wyliedog/ui/dialog";
import { Button } from "@wyliedog/ui/button";
import { Input } from "@wyliedog/ui/input";
import { Label } from "@wyliedog/ui/label";
import { Alert, AlertDescription } from "@wyliedog/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@wyliedog/ui/select";
import { useState, useRef } from "react";

const meta: Meta = {
  title: "Patterns/Accessibility",
  parameters: {
    docs: {
      description: {
        component:
          "Accessibility patterns targeting WCAG 2.2 AA compliance. Each story demonstrates a specific pattern with implementation details.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Story 1: FocusManagement
// ---------------------------------------------------------------------------

function FocusManagementComponent() {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-4">
      <p className="text-sm text-current/70 max-w-sm">
        Open the dialog and press Tab — focus cycles within the dialog. Press
        Escape to close; focus returns to the trigger button.
      </p>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button ref={triggerRef} data-testid="open-dialog-btn">
            Open dialog
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Focus trap demo</DialogTitle>
            <DialogDescription>
              Tab key cycles through the focusable elements below without
              escaping the dialog.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="fm-input">Your name</Label>
              <Input
                id="fm-input"
                placeholder="Enter your name"
                data-testid="dialog-input"
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" data-testid="dialog-cancel">
                Cancel
              </Button>
            </DialogClose>
            <Button data-testid="dialog-confirm">Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export const FocusManagement: Story = {
  parameters: {
    layout: "centered",
    docs: {
      description: {
        story:
          "Demonstrates focus trapping inside a Dialog and focus restoration to the trigger button on close (Escape key or Cancel). Radix UI's Dialog primitive provides this behavior automatically.",
      },
    },
  },
  render: () => <FocusManagementComponent />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Open the dialog
    const openBtn = canvas.getByTestId("open-dialog-btn");
    await userEvent.click(openBtn);

    // Dialog renders into a portal — use screen to query across the whole document
    // Wait for dialog animation before querying portal content
    await new Promise((r) => setTimeout(r, 300));
    const dialogInput = screen.getByRole("textbox", { name: /your name/i });
    expect(dialogInput).toBeInTheDocument();

    // Tab through dialog elements (close button → input → cancel → confirm)
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();

    // Press Escape to close
    await userEvent.keyboard("{Escape}");

    // Trigger button should regain focus
    expect(openBtn).toHaveFocus();
  },
};

// ---------------------------------------------------------------------------
// Story 2: LiveRegionAnnouncements
// ---------------------------------------------------------------------------

type SaveStatus = "idle" | "saving" | "saved" | "error";

function LiveRegionAnnouncementsComponent() {
  const [status, setStatus] = useState<SaveStatus>("idle");

  const handleSave = async () => {
    setStatus("saving");
    await new Promise((r) => setTimeout(r, 800));
    // Simulate occasional error
    setStatus(Math.random() > 0.3 ? "saved" : "error");
  };

  const statusMessage =
    status === "saving"
      ? "Saving…"
      : status === "saved"
        ? "Saved successfully"
        : status === "error"
          ? "Error saving — please try again"
          : "";

  const statusColor =
    status === "saved"
      ? "text-green-700 dark:text-green-400"
      : status === "error"
        ? "text-red-700 dark:text-red-400"
        : "text-current/70";

  return (
    <div className="w-full max-w-sm space-y-6">
      <p className="text-sm text-current/70">
        Click Save to trigger a status update. Screen readers announce the
        message via the <code>aria-live</code> region even though the visible
        badge updates simultaneously.
      </p>

      {/*
       * IMPLEMENTATION NOTE:
       * The aria-live region is visually hidden but announced to screen readers.
       * aria-atomic="true" ensures the full message is read, not just the diff.
       */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        data-testid="live-region"
      >
        {statusMessage}
      </div>

      <div className="flex items-center gap-4">
        <Button onClick={handleSave} disabled={status === "saving"}>
          {status === "saving" ? "Saving…" : "Save"}
        </Button>

        {statusMessage && status !== "saving" && (
          <span
            className={`text-sm font-medium ${statusColor}`}
            role="status"
            data-testid="status-badge"
          >
            {statusMessage}
          </span>
        )}
      </div>

      {/* Implementation callout */}
      <div className="rounded-lg border border-current/20 bg-current/5 p-4 text-sm space-y-1">
        <p className="font-semibold">Pattern: aria-live region</p>
        <pre className="text-xs text-current/70 overflow-x-auto whitespace-pre-wrap">
          {`<div
  aria-live="polite"
  aria-atomic="true"
  className="sr-only"
>
  {statusMessage}
</div>`}
        </pre>
      </div>
    </div>
  );
}

export const LiveRegionAnnouncements: Story = {
  parameters: {
    layout: "centered",
    docs: {
      description: {
        story:
          'Uses a visually-hidden `aria-live="polite"` region to announce dynamic status messages to screen readers. `aria-atomic="true"` ensures the whole message is read rather than just the changed text. A visible status badge mirrors the announcement.',
      },
    },
  },
  render: () => <LiveRegionAnnouncementsComponent />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const saveBtn = canvas.getByRole("button", { name: /save/i });
    await userEvent.click(saveBtn);

    // Live region should update (may say "Saving…" or the final status)
    const liveRegion = canvas.getByTestId("live-region");
    expect(liveRegion).toBeInTheDocument();

    // Wait for the save to complete
    await new Promise((r) => setTimeout(r, 1000));
    expect(liveRegion.textContent).not.toBe("");
  },
};

// ---------------------------------------------------------------------------
// Story 3: KeyboardOnlyForm
// ---------------------------------------------------------------------------

/**
 * Key map for this form:
 * Tab      — move to next focusable element
 * Shift+Tab — move to previous focusable element
 * Space    — open a Select dropdown
 * Arrow keys — navigate Select options
 * Enter    — confirm Select choice, submit form
 */

function KeyboardOnlyFormComponent() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && role) setSubmitted(true);
  };

  if (submitted) {
    return (
      <Alert variant="success" className="w-full">
        <AlertDescription>
          <p className="font-semibold">Form submitted via keyboard only!</p>
          <p className="text-sm mt-1">
            {name} · {email} · {role}
          </p>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full space-y-5"
      noValidate
      aria-label="Keyboard-only form demo"
    >
      <div className="rounded-lg border border-current/20 bg-current/5 p-3 text-sm text-current/70 space-y-1">
        <p className="font-semibold">Key map</p>
        <ul className="list-none space-y-0.5">
          <li>
            <kbd className="font-mono text-xs">Tab</kbd> — next field
          </li>
          <li>
            <kbd className="font-mono text-xs">Shift+Tab</kbd> — previous field
          </li>
          <li>
            <kbd className="font-mono text-xs">Space</kbd> — open Select
          </li>
          <li>
            <kbd className="font-mono text-xs">↑ ↓</kbd> — navigate options
          </li>
          <li>
            <kbd className="font-mono text-xs">Enter</kbd> — confirm / submit
          </li>
        </ul>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ko-name">Full name</Label>
        <Input
          id="ko-name"
          placeholder="Jane Smith"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="ko-email">Email</Label>
        <Input
          id="ko-email"
          type="email"
          placeholder="jane@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="ko-role">Role</Label>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger id="ko-role" data-testid="ko-role-trigger">
            <SelectValue placeholder="Select your role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="designer">Designer</SelectItem>
            <SelectItem value="engineer">Engineer</SelectItem>
            <SelectItem value="pm">Product Manager</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" data-testid="ko-submit">
        Submit
      </Button>
    </form>
  );
}

export const KeyboardOnlyForm: Story = {
  parameters: {
    layout: "centered",
    docs: {
      description: {
        story:
          "Demonstrates completing an entire form submission using only keyboard navigation. Tab moves between fields, Space/Arrow keys interact with the Select, and Enter submits. No mouse required.",
      },
    },
  },
  render: () => <KeyboardOnlyFormComponent />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Focus the first field
    const nameInput = canvas.getByPlaceholderText("Jane Smith");
    await userEvent.click(nameInput);
    await userEvent.type(nameInput, "Jane Smith");

    // Tab to email
    await userEvent.tab();
    await userEvent.type(
      canvas.getByPlaceholderText("jane@example.com"),
      "jane@example.com"
    );

    // Tab to Select trigger and open it
    await userEvent.tab();
    const selectTrigger = canvas.getByTestId("ko-role-trigger");
    expect(selectTrigger).toHaveFocus();
    await userEvent.keyboard(" "); // Space opens the Select

    // Arrow down to second option and select it
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard("{Enter}");

    // Tab to Submit and press Enter
    await userEvent.tab();
    const submitBtn = canvas.getByTestId("ko-submit");
    expect(submitBtn).toHaveFocus();
    await userEvent.keyboard("{Enter}");

    // Success state should appear
    expect(await canvas.findByRole("status")).toHaveTextContent(
      /keyboard only/i
    );
  },
};

// ---------------------------------------------------------------------------
// Story 5: SkipNavigation
// ---------------------------------------------------------------------------

function SkipNavigationComponent() {
  const mainRef = useRef<HTMLElement>(null);

  return (
    <div className="relative w-full min-h-[400px] border border-current/20 rounded-lg overflow-hidden">
      {/*
       * PATTERN: Skip-to-content link
       * - Visually hidden until focused (sr-only + focus:not-sr-only)
       * - Links to #main-content by id
       * - Provides the primary navigation shortcut for keyboard/screen-reader users
       */}
      <a
        href="#skip-nav-main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white dark:focus:bg-gray-950 focus:text-current focus:rounded focus:shadow-lg focus:border focus:border-current focus:outline-hidden"
        onClick={(e) => {
          e.preventDefault();
          mainRef.current?.focus();
        }}
        data-testid="skip-link"
      >
        Skip to main content
      </a>

      {/* Simulated navigation bar */}
      <nav
        className="border-b border-current/20 px-4 py-3 flex gap-4 bg-current/5"
        aria-label="Site navigation"
      >
        <a
          href="#"
          className="text-sm font-medium hover:text-blue-700 dark:hover:text-blue-400 focus-visible:outline-2 focus-visible:outline-current focus-visible:outline-offset-2 rounded px-1"
          onClick={(e) => e.preventDefault()}
        >
          Home
        </a>
        <a
          href="#"
          className="text-sm font-medium hover:text-blue-700 dark:hover:text-blue-400 focus-visible:outline-2 focus-visible:outline-current focus-visible:outline-offset-2 rounded px-1"
          onClick={(e) => e.preventDefault()}
        >
          About
        </a>
        <a
          href="#"
          className="text-sm font-medium hover:text-blue-700 dark:hover:text-blue-400 focus-visible:outline-2 focus-visible:outline-current focus-visible:outline-offset-2 rounded px-1"
          onClick={(e) => e.preventDefault()}
        >
          Contact
        </a>
      </nav>

      {/* Simulated page layout */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-40 border-r border-current/20 p-4 bg-current/5">
          <p className="text-xs font-semibold uppercase tracking-wider text-current/70 mb-3">
            Sidebar
          </p>
          <ul className="space-y-2">
            {["Overview", "Details", "Settings"].map((item) => (
              <li key={item}>
                <a
                  href="#"
                  className="text-sm hover:text-blue-700 dark:hover:text-blue-400 focus-visible:outline-2 focus-visible:outline-current focus-visible:outline-offset-2 rounded px-1"
                  onClick={(e) => e.preventDefault()}
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main content */}
        <main
          id="skip-nav-main"
          ref={mainRef}
          tabIndex={-1}
          className="flex-1 p-6 focus-visible:outline-2 focus-visible:outline-current focus-visible:-outline-offset-2"
          aria-label="Main content"
        >
          <h1 className="text-lg font-semibold mb-2">Main content</h1>
          <p className="text-sm text-current/70 mb-4">
            Press Tab from the browser address bar (or the start of the page) to
            reveal the skip link. Press Enter to jump directly here, bypassing
            the nav and sidebar.
          </p>
          <div className="rounded-lg border border-current/20 bg-current/5 p-3 text-sm space-y-1">
            <p className="font-semibold">Pattern: skip-to-content link</p>
            <pre className="text-xs text-current/70 overflow-x-auto whitespace-pre-wrap">
              {`<a
  href="#main-content"
  className="sr-only focus:not-sr-only
             focus:absolute focus:top-4 focus:left-4
             focus:z-50 focus:px-4 focus:py-2 ..."
>
  Skip to main content
</a>

<main id="main-content" tabIndex={-1}>
  ...
</main>`}
            </pre>
          </div>
        </main>
      </div>
    </div>
  );
}

export const SkipNavigation: Story = {
  parameters: {
    layout: "padded",
    docs: {
      description: {
        story:
          "Demonstrates the skip-to-content link pattern. The link is visually hidden until focused (using `sr-only` + `focus:not-sr-only`), then becomes visible and links to the `#main-content` landmark. The `<main>` element has `tabIndex={-1}` so it can receive programmatic focus on Enter.",
      },
    },
  },
  render: () => <SkipNavigationComponent />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const skipLink = canvas.getByTestId("skip-link");

    // Tab once — skip link should receive focus
    skipLink.focus();
    expect(skipLink).toHaveFocus();

    // Skip link should have non-zero dimensions when focused
    // (focus:not-sr-only removes the visually-hidden clip)
    const rect = skipLink.getBoundingClientRect();
    expect(rect.width).toBeGreaterThan(0);
    expect(rect.height).toBeGreaterThan(0);

    // Activate the skip link — focus moves to main content
    await userEvent.keyboard("{Enter}");
    const main = canvasElement.querySelector("main");
    expect(main).toHaveFocus();
  },
};

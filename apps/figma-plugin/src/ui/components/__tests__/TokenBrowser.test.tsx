import { h } from "preact";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/preact";
import { TokenBrowser, type ProcessedToken } from "../TokenBrowser";

const tokens: Record<string, ProcessedToken> = {
  "blue-500": { $type: "color", $value: "#3366ff", $description: "Brand blue" },
  "text-link": { $type: "color", $value: "{primitive.blue-500}" },
  "space-2": { $type: "spacing", $value: "8px" },
  "font-size-md": { $type: "fontSize", $value: "16px" },
  "alias-token": { $type: "widget", $value: "$space-2" },
};

const single: Record<string, ProcessedToken> = {
  only: { $type: "color", $value: "#000000" },
};

function setup(props: Partial<Parameters<typeof TokenBrowser>[0]> = {}) {
  const onClose = vi.fn();
  render(
    <TokenBrowser
      collectionName="primitive"
      tokens={tokens}
      onClose={onClose}
      {...props}
    />
  );
  return { onClose };
}

const copyButtons = () => screen.queryAllByText("Copy Ref");

describe("TokenBrowser", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe("listing", () => {
    it("shows the collection name, counts and every token grouped by type", () => {
      setup();
      expect(screen.getByText("primitive")).toBeInTheDocument();
      expect(screen.getByText("5 tokens • 1 mode")).toBeInTheDocument();
      expect(screen.getByText("Showing 5 of 5 tokens")).toBeInTheDocument();
      // Known types get friendly labels and unknown ones are capitalised.
      // Each label appears twice: as a filter option and as a group header.
      expect(screen.getAllByText("Font Size")).toHaveLength(2);
      expect(screen.getAllByText("Widget")).toHaveLength(2);
      expect(screen.getAllByText("Color")).toHaveLength(2);
      expect(screen.getByText("Brand blue")).toBeInTheDocument();
      expect(copyButtons()).toHaveLength(5);
    });

    it("uses singular wording for a single token", () => {
      setup({ tokens: single });
      expect(screen.getByText("1 token • 1 mode")).toBeInTheDocument();
      expect(screen.getByText("Showing 1 of 1 token")).toBeInTheDocument();
    });

    it("explains an empty collection", () => {
      setup({ tokens: {} });
      expect(screen.getByText("No tokens found")).toBeInTheDocument();
      expect(screen.getByText("This collection is empty")).toBeInTheDocument();
    });
  });

  describe("closing", () => {
    it("closes from the button and the backdrop but not from the panel", () => {
      const { onClose } = setup();
      fireEvent.click(screen.getByText("primitive"));
      expect(onClose).not.toHaveBeenCalled();
      fireEvent.click(screen.getByText("Close"));
      expect(onClose).toHaveBeenCalledTimes(1);
      const backdrop = screen
        .getByText("primitive")
        .closest("div[style*='position: fixed']") as HTMLElement;
      fireEvent.click(backdrop);
      expect(onClose).toHaveBeenCalledTimes(2);
    });
  });

  describe("modes", () => {
    const modeTokens: Record<string, ProcessedToken> = {
      surface: {
        $type: "color",
        $value: "#ffffff",
        $valuesByMode: { light: "#ffffff", dark: "#111111" },
      },
      accent: { $type: "color", $value: "#3366ff" },
    };
    const modes = [
      { modeId: "light", name: "Light" },
      { modeId: "dark", name: "Dark" },
    ];

    it("has no mode tabs for a single mode", () => {
      setup();
      expect(screen.queryByText("Light")).not.toBeInTheDocument();
    });

    it("lets you switch modes and falls back to the base value when a mode has none", () => {
      setup({ tokens: modeTokens, modes });
      expect(screen.getByText("2 tokens • 2 modes")).toBeInTheDocument();
      fireEvent.click(screen.getByLabelText("Search in values"));
      const search = () => screen.getByPlaceholderText(/by name or value/);
      fireEvent.input(search(), { target: { value: "#111111" } });
      expect(screen.getByText("Showing 0 of 2 tokens")).toBeInTheDocument();

      fireEvent.click(screen.getByText("Dark"));
      expect(screen.getByText("Showing 1 of 2 tokens")).toBeInTheDocument();
      expect(screen.getByText("surface")).toBeInTheDocument();
      expect(screen.queryByText("accent")).not.toBeInTheDocument();

      // `accent` has no per-mode value, so it still shows its base value.
      fireEvent.input(search(), { target: { value: "#3366ff" } });
      expect(screen.getByText("accent")).toBeInTheDocument();
    });

    it("styles hover on tabs without changing the selected one", () => {
      setup({ tokens: modeTokens, modes });
      const dark = screen.getByText("Dark");
      const light = screen.getByText("Light");
      fireEvent.mouseEnter(dark);
      expect(dark.style.backgroundColor).toBe("var(--surface-tertiary)");
      fireEvent.mouseLeave(dark);
      expect(dark.style.backgroundColor).toBe("transparent");
      const before = light.style.backgroundColor;
      fireEvent.mouseEnter(light);
      fireEvent.mouseLeave(light);
      expect(light.style.backgroundColor).toBe(before);
    });
  });

  describe("search and filters", () => {
    it("filters by name, ignoring case", () => {
      setup();
      fireEvent.input(screen.getByPlaceholderText("Search tokens by name..."), {
        target: { value: "BLUE" },
      });
      expect(screen.getByText("Showing 1 of 5 tokens")).toBeInTheDocument();
      expect(screen.getByText("blue-500")).toBeInTheDocument();
    });

    it("shows a search hint when nothing matches", () => {
      setup();
      fireEvent.input(screen.getByPlaceholderText("Search tokens by name..."), {
        target: { value: "zzz" },
      });
      expect(screen.getByText("No tokens found")).toBeInTheDocument();
      expect(
        screen.getByText("Try a different search query")
      ).toBeInTheDocument();
    });

    it("can also search token values", () => {
      setup();
      const search = () => screen.getByPlaceholderText(/Search tokens by/);
      fireEvent.input(search(), { target: { value: "8px" } });
      expect(screen.getByText("Showing 0 of 5 tokens")).toBeInTheDocument();
      fireEvent.click(screen.getByLabelText("Search in values"));
      expect(search()).toHaveAttribute(
        "placeholder",
        "Search tokens by name or value..."
      );
      expect(screen.getByText("Showing 1 of 5 tokens")).toBeInTheDocument();
      expect(screen.getByText("space-2")).toBeInTheDocument();
    });

    it("filters by type", () => {
      setup();
      fireEvent.change(screen.getByRole("combobox"), {
        target: { value: "color" },
      });
      expect(screen.getByText("Showing 2 of 5 tokens")).toBeInTheDocument();
    });

    it("shows only references, including $-prefixed ones", () => {
      setup();
      fireEvent.click(screen.getByLabelText("References only"));
      expect(screen.getByText("Showing 2 of 5 tokens")).toBeInTheDocument();
      expect(screen.getByText("text-link")).toBeInTheDocument();
      expect(screen.getByText("alias-token")).toBeInTheDocument();
    });

    it("offers Clear filters only while a filter is active, and resets them", () => {
      setup();
      expect(screen.queryByText("Clear filters")).not.toBeInTheDocument();
      fireEvent.input(screen.getByPlaceholderText(/Search tokens by/), {
        target: { value: "space" },
      });
      fireEvent.change(screen.getByRole("combobox"), {
        target: { value: "spacing" },
      });
      fireEvent.click(screen.getByLabelText("References only"));
      const clear = screen.getByText("Clear filters");
      fireEvent.mouseEnter(clear);
      expect(clear.style.backgroundColor).toBe("var(--surface-tertiary)");
      fireEvent.mouseLeave(clear);
      expect(clear.style.backgroundColor).toBe("transparent");
      fireEvent.click(clear);
      expect(screen.getByText("Showing 5 of 5 tokens")).toBeInTheDocument();
      expect(screen.queryByText("Clear filters")).not.toBeInTheDocument();
    });
  });

  describe("groups", () => {
    it("collapses and expands a group", () => {
      setup();
      expect(screen.getByText("space-2")).toBeInTheDocument();
      const header = screen.getAllByText("Spacing")[1].closest("button")!;
      fireEvent.click(header);
      expect(screen.queryByText("space-2")).not.toBeInTheDocument();
      fireEvent.click(header);
      expect(screen.getByText("space-2")).toBeInTheDocument();
    });
  });

  describe("row hover", () => {
    it("highlights a token row and its copy button", () => {
      setup({ tokens: single });
      const button = screen.getByText("Copy Ref").closest("button")!;
      const row = button.parentElement as HTMLElement;
      fireEvent.mouseEnter(row);
      expect(row.style.borderColor).toBe("var(--accent-primary)");
      fireEvent.mouseLeave(row);
      expect(row.style.borderColor).toBe("var(--border-default)");

      fireEvent.mouseEnter(button);
      expect(button.style.color).toBe("var(--text-inverse)");
      fireEvent.mouseLeave(button);
      expect(button.style.color).toBe("var(--accent-primary)");
    });
  });

  describe("copying a reference", () => {
    const original = Object.getOwnPropertyDescriptor(navigator, "clipboard");

    const setClipboard = (value: unknown) =>
      Object.defineProperty(navigator, "clipboard", {
        value,
        configurable: true,
      });
    const setExecCommand = (value: unknown) =>
      Object.defineProperty(document, "execCommand", {
        value,
        configurable: true,
        writable: true,
      });

    afterEach(() => {
      if (original) Object.defineProperty(navigator, "clipboard", original);
      else delete (navigator as { clipboard?: unknown }).clipboard;
      delete (document as { execCommand?: unknown }).execCommand;
    });

    const copy = () => fireEvent.click(copyButtons()[0]);

    it("writes {collection.token} to the clipboard and shows Copied! for two seconds", async () => {
      vi.useFakeTimers();
      const writeText = vi.fn().mockResolvedValue(undefined);
      setClipboard({ writeText });
      setup({ tokens: single });
      copy();
      expect(writeText).toHaveBeenCalledWith("{primitive.only}");
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });
      expect(screen.getByText("Copied!")).toBeInTheDocument();
      // Hover styling is skipped for the token that was just copied.
      const button = screen.getByText("Copied!").closest("button")!;
      fireEvent.mouseEnter(button);
      fireEvent.mouseLeave(button);
      expect(button.style.color).toBe("var(--success)");
      await act(async () => {
        await vi.advanceTimersByTimeAsync(2000);
      });
      expect(screen.queryByText("Copied!")).not.toBeInTheDocument();
    });

    it("falls back to a temporary textarea when the clipboard API rejects", async () => {
      setClipboard({
        writeText: vi.fn().mockRejectedValue(new Error("denied")),
      });
      const execCommand = vi.fn().mockReturnValue(true);
      setExecCommand(execCommand);
      setup({ tokens: single });
      copy();
      await waitFor(() =>
        expect(screen.getByText("Copied!")).toBeInTheDocument()
      );
      expect(execCommand).toHaveBeenCalledWith("copy");
      expect(document.querySelector("textarea")).toBeNull();
    });

    it("uses the fallback when there is no clipboard API", () => {
      setClipboard(undefined);
      const execCommand = vi.fn().mockReturnValue(true);
      setExecCommand(execCommand);
      setup({ tokens: single });
      copy();
      expect(execCommand).toHaveBeenCalledWith("copy");
      expect(screen.getByText("Copied!")).toBeInTheDocument();
    });

    it("uses the fallback when writeText throws synchronously", () => {
      setClipboard({
        writeText: () => {
          throw new Error("boom");
        },
      });
      setExecCommand(vi.fn().mockReturnValue(true));
      setup({ tokens: single });
      copy();
      expect(console.error).toHaveBeenCalledWith(
        "Failed to copy:",
        expect.any(Error)
      );
      expect(screen.getByText("Copied!")).toBeInTheDocument();
    });

    it("logs when the fallback copy command reports failure", () => {
      setClipboard(undefined);
      setExecCommand(vi.fn().mockReturnValue(false));
      setup({ tokens: single });
      copy();
      expect(console.error).toHaveBeenCalledWith("Copy command failed");
      expect(screen.queryByText("Copied!")).not.toBeInTheDocument();
    });

    it("logs when the fallback copy throws", () => {
      setClipboard(undefined);
      setExecCommand(() => {
        throw new Error("unsupported");
      });
      setup({ tokens: single });
      copy();
      expect(console.error).toHaveBeenCalledWith(
        "Fallback copy failed:",
        expect.any(Error)
      );
    });
  });
});

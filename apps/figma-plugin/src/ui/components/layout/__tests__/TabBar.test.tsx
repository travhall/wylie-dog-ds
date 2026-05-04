import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/preact";
import { TabBar } from "../TabBar";

describe("TabBar", () => {
  const mockOnTabChange = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should render all tabs", () => {
    render(<TabBar activeTab="tokens" onTabChange={mockOnTabChange} />);

    expect(screen.getByText("Tokens")).toBeInTheDocument();
    expect(screen.getByText("Sync")).toBeInTheDocument();
  });

  it("should highlight the active tab", () => {
    render(<TabBar activeTab="sync" onTabChange={mockOnTabChange} />);

    const syncTab = screen.getByRole("tab", { name: /sync and import/i });
    expect(syncTab).toHaveAttribute("aria-selected", "true");
  });

  it("should call onTabChange when clicking a tab", () => {
    render(<TabBar activeTab="tokens" onTabChange={mockOnTabChange} />);

    const syncTab = screen.getByRole("tab", { name: /sync and import/i });
    fireEvent.click(syncTab);

    expect(mockOnTabChange).toHaveBeenCalledWith("sync");
  });

  it("should not disable tabs by default", () => {
    render(<TabBar activeTab="tokens" onTabChange={mockOnTabChange} />);

    const syncTab = screen.getByRole("tab", { name: /sync and import/i });
    expect(syncTab).not.toBeDisabled();
  });

  it("should have proper accessibility attributes", () => {
    render(<TabBar activeTab="tokens" onTabChange={mockOnTabChange} />);

    const tablist = screen.getByRole("tablist");
    expect(tablist).toBeInTheDocument();

    const tabs = screen.getAllByRole("tab");
    tabs.forEach((tab) => {
      expect(tab).toHaveAttribute("aria-selected");
      expect(tab).toHaveAttribute("aria-controls");
    });
  });

  it("should support keyboard navigation from Tokens to Sync", () => {
    render(<TabBar activeTab="tokens" onTabChange={mockOnTabChange} />);

    const tokensTab = screen.getByRole("tab", { name: /view tokens/i });
    tokensTab.focus();

    // Press ArrowRight to move to next tab (Sync)
    fireEvent.keyDown(tokensTab, { key: "ArrowRight" });
    expect(mockOnTabChange).toHaveBeenCalledWith("sync");
  });
});

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/preact";
import { TabBar } from "../TabBar";

describe("TabBar", () => {
  const mockOnTabChange = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should render all tabs", () => {
    render(
      <TabBar
        activeTab="tokens"
        onTabChange={mockOnTabChange}
        githubConnected={false}
      />
    );

    expect(screen.getByText("Tokens")).toBeInTheDocument();
    expect(screen.getByText("Import")).toBeInTheDocument();
    expect(screen.getByText("Export")).toBeInTheDocument();
    expect(screen.getByText("Sync")).toBeInTheDocument();
  });

  it("should highlight the active tab", () => {
    render(
      <TabBar
        activeTab="import"
        onTabChange={mockOnTabChange}
        githubConnected={false}
      />
    );

    const importTab = screen.getByRole("tab", { name: /import tokens/i });
    expect(importTab).toHaveAttribute("aria-selected", "true");
  });

  it("should call onTabChange when clicking a tab", () => {
    render(
      <TabBar
        activeTab="tokens"
        onTabChange={mockOnTabChange}
        githubConnected={false}
      />
    );

    const exportTab = screen.getByRole("tab", { name: /export tokens/i });
    fireEvent.click(exportTab);

    expect(mockOnTabChange).toHaveBeenCalledWith("export");
  });

  it("should disable sync tab when GitHub is not connected", () => {
    render(
      <TabBar
        activeTab="tokens"
        onTabChange={mockOnTabChange}
        githubConnected={false}
      />
    );

    const syncTab = screen.getByRole("tab", { name: /sync with github/i });
    expect(syncTab).toBeDisabled();
  });

  it("should enable sync tab when GitHub is connected", () => {
    render(
      <TabBar
        activeTab="tokens"
        onTabChange={mockOnTabChange}
        githubConnected={true}
      />
    );

    const syncTab = screen.getByRole("tab", { name: /sync with github/i });
    expect(syncTab).not.toBeDisabled();
  });

  it("should have proper accessibility attributes", () => {
    render(
      <TabBar
        activeTab="tokens"
        onTabChange={mockOnTabChange}
        githubConnected={false}
      />
    );

    const tablist = screen.getByRole("tablist");
    expect(tablist).toBeInTheDocument();

    const tabs = screen.getAllByRole("tab");
    tabs.forEach((tab) => {
      expect(tab).toHaveAttribute("aria-selected");
      expect(tab).toHaveAttribute("aria-controls");
    });
  });

  it("should support keyboard navigation", () => {
    render(
      <TabBar
        activeTab="tokens"
        onTabChange={mockOnTabChange}
        githubConnected={false}
      />
    );

    const tokensTab = screen.getByRole("tab", { name: /select tokens/i });
    tokensTab.focus();

    // Press ArrowRight to move to next tab
    fireEvent.keyDown(tokensTab, { key: "ArrowRight" });
    expect(mockOnTabChange).toHaveBeenCalledWith("import");
  });
});

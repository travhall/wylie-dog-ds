import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../tabs";

expect.extend(toHaveNoViolations);

// Test component wrapper
const TestTabs = ({
  defaultValue,
  value,
  onValueChange,
  size = "md" as const,
}: {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  size?: "sm" | "md" | "lg";
}) => (
  <Tabs defaultValue={defaultValue} value={value} onValueChange={onValueChange}>
    <TabsList size={size} aria-label="Main navigation">
      <TabsTrigger value="tab1" size={size}>
        Tab 1
      </TabsTrigger>
      <TabsTrigger value="tab2" size={size}>
        Tab 2
      </TabsTrigger>
      <TabsTrigger value="tab3" size={size}>
        Tab 3
      </TabsTrigger>
    </TabsList>
    <TabsContent value="tab1">Content for Tab 1</TabsContent>
    <TabsContent value="tab2">Content for Tab 2</TabsContent>
    <TabsContent value="tab3">Content for Tab 3</TabsContent>
  </Tabs>
);

describe("Tabs", () => {
  describe("Accessibility", () => {
    it("should pass accessibility audit", async () => {
      const { container } = render(<TestTabs defaultValue="tab1" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should pass accessibility audit with all tabs", async () => {
      const user = userEvent.setup();
      const { container } = render(<TestTabs defaultValue="tab1" />);

      // Check accessibility on different tabs
      await user.click(screen.getByRole("tab", { name: "Tab 2" }));
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have proper role for tabs list", () => {
      render(<TestTabs defaultValue="tab1" />);

      const tablist = screen.getByRole("tablist");
      expect(tablist).toBeInTheDocument();
    });

    it("should have proper role for tabs", () => {
      render(<TestTabs defaultValue="tab1" />);

      const tabs = screen.getAllByRole("tab");
      expect(tabs).toHaveLength(3);
    });

    it("should have proper role for tab panels", () => {
      render(<TestTabs defaultValue="tab1" />);

      const panel = screen.getByRole("tabpanel");
      expect(panel).toBeInTheDocument();
    });

    it("should support aria-label on tablist", () => {
      render(<TestTabs defaultValue="tab1" />);

      const tablist = screen.getByLabelText("Main navigation");
      expect(tablist).toHaveAttribute("role", "tablist");
    });

    it("should have proper aria-selected state", () => {
      render(<TestTabs defaultValue="tab2" />);

      const tabs = screen.getAllByRole("tab");
      expect(tabs[0]).toHaveAttribute("aria-selected", "false");
      expect(tabs[1]).toHaveAttribute("aria-selected", "true");
      expect(tabs[2]).toHaveAttribute("aria-selected", "false");
    });

    it("should associate tabs with panels via aria-controls", () => {
      render(<TestTabs defaultValue="tab1" />);

      const tab1 = screen.getByRole("tab", { name: "Tab 1" });
      const panel = screen.getByRole("tabpanel");

      const controlsId = tab1.getAttribute("aria-controls");
      expect(controlsId).toBeTruthy();
      expect(panel).toHaveAttribute("id", controlsId);
    });

    it("should support disabled tabs", () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList aria-label="Test tabs">
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2" disabled>
              Tab 2 (Disabled)
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      const disabledTab = screen.getByRole("tab", { name: "Tab 2 (Disabled)" });
      expect(disabledTab).toHaveAttribute("data-disabled", "");
    });
  });

  describe("Functionality", () => {
    it("should render all tabs", () => {
      render(<TestTabs defaultValue="tab1" />);

      expect(screen.getByText("Tab 1")).toBeInTheDocument();
      expect(screen.getByText("Tab 2")).toBeInTheDocument();
      expect(screen.getByText("Tab 3")).toBeInTheDocument();
    });

    it("should show default tab content", () => {
      render(<TestTabs defaultValue="tab2" />);

      expect(screen.getByText("Content for Tab 2")).toBeInTheDocument();
      expect(screen.queryByText("Content for Tab 1")).not.toBeInTheDocument();
    });

    it("should switch tabs on click", async () => {
      const user = userEvent.setup();
      render(<TestTabs defaultValue="tab1" />);

      expect(screen.getByText("Content for Tab 1")).toBeInTheDocument();

      await user.click(screen.getByRole("tab", { name: "Tab 2" }));

      await waitFor(() => {
        expect(screen.getByText("Content for Tab 2")).toBeInTheDocument();
        expect(screen.queryByText("Content for Tab 1")).not.toBeInTheDocument();
      });
    });

    it("should call onValueChange when tab changes", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<TestTabs defaultValue="tab1" onValueChange={handleChange} />);

      await user.click(screen.getByRole("tab", { name: "Tab 3" }));

      expect(handleChange).toHaveBeenCalledWith("tab3");
    });

    it("should work as uncontrolled component", async () => {
      const user = userEvent.setup();
      render(<TestTabs defaultValue="tab1" />);

      const tab1 = screen.getByRole("tab", { name: "Tab 1" });
      const tab2 = screen.getByRole("tab", { name: "Tab 2" });

      expect(tab1).toHaveAttribute("aria-selected", "true");
      expect(tab2).toHaveAttribute("aria-selected", "false");

      await user.click(tab2);

      await waitFor(() => {
        expect(tab1).toHaveAttribute("aria-selected", "false");
        expect(tab2).toHaveAttribute("aria-selected", "true");
      });
    });

    it("should work as controlled component", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      const { rerender } = render(
        <TestTabs value="tab1" onValueChange={handleChange} />
      );

      const tab1 = screen.getByRole("tab", { name: "Tab 1" });
      expect(tab1).toHaveAttribute("aria-selected", "true");

      rerender(<TestTabs value="tab2" onValueChange={handleChange} />);

      const tab2 = screen.getByRole("tab", { name: "Tab 2" });
      expect(tab2).toHaveAttribute("aria-selected", "true");
    });

    it("should not switch to disabled tab", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <Tabs defaultValue="tab1" onValueChange={handleChange}>
          <TabsList aria-label="Test">
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2" disabled>
              Tab 2
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      const disabledTab = screen.getByRole("tab", { name: "Tab 2" });
      await user.click(disabledTab);

      expect(handleChange).not.toHaveBeenCalled();
      expect(disabledTab).toHaveAttribute("aria-selected", "false");
    });

    it("should update active tab indicator", async () => {
      const user = userEvent.setup();
      render(<TestTabs defaultValue="tab1" />);

      const tab1 = screen.getByRole("tab", { name: "Tab 1" });
      const tab2 = screen.getByRole("tab", { name: "Tab 2" });

      expect(tab1).toHaveAttribute("data-state", "active");
      expect(tab2).toHaveAttribute("data-state", "inactive");

      await user.click(tab2);

      await waitFor(() => {
        expect(tab1).toHaveAttribute("data-state", "inactive");
        expect(tab2).toHaveAttribute("data-state", "active");
      });
    });
  });

  describe("Keyboard Navigation", () => {
    it("should focus first tab with Tab key", async () => {
      const user = userEvent.setup();
      render(<TestTabs defaultValue="tab1" />);

      await user.tab();

      const tabs = screen.getAllByRole("tab");
      expect(tabs[0]).toHaveFocus();
    });

    it("should navigate tabs with arrow keys", async () => {
      const user = userEvent.setup();
      render(<TestTabs defaultValue="tab1" />);

      const tabs = screen.getAllByRole("tab");
      await user.tab();
      expect(tabs[0]).toHaveFocus();

      await user.keyboard("{ArrowRight}");
      expect(tabs[1]).toHaveFocus();

      await user.keyboard("{ArrowRight}");
      expect(tabs[2]).toHaveFocus();
    });

    it("should navigate tabs with ArrowLeft", async () => {
      const user = userEvent.setup();
      render(<TestTabs defaultValue="tab2" />);

      const tabs = screen.getAllByRole("tab");
      await user.tab();
      expect(tabs[1]).toHaveFocus();

      await user.keyboard("{ArrowLeft}");
      expect(tabs[0]).toHaveFocus();
    });

    it("should wrap around with arrow navigation", async () => {
      const user = userEvent.setup();
      render(<TestTabs defaultValue="tab1" />);

      const tabs = screen.getAllByRole("tab");
      await user.tab();
      await user.keyboard("{ArrowRight}");
      await user.keyboard("{ArrowRight}");
      expect(tabs[2]).toHaveFocus();

      await user.keyboard("{ArrowRight}");
      expect(tabs[0]).toHaveFocus();

      await user.keyboard("{ArrowLeft}");
      expect(tabs[2]).toHaveFocus();
    });

    it("should activate tab with Space key", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<TestTabs defaultValue="tab1" onValueChange={handleChange} />);

      const tabs = screen.getAllByRole("tab");
      await user.tab();
      await user.keyboard("{ArrowRight}");
      expect(tabs[1]).toHaveFocus();

      await user.keyboard(" ");

      expect(handleChange).toHaveBeenCalledWith("tab2");
    });

    it("should activate tab with Enter key", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<TestTabs defaultValue="tab1" onValueChange={handleChange} />);

      const tabs = screen.getAllByRole("tab");
      await user.tab();
      await user.keyboard("{ArrowRight}");
      await user.keyboard("{ArrowRight}");
      expect(tabs[2]).toHaveFocus();

      await user.keyboard("{Enter}");

      expect(handleChange).toHaveBeenCalledWith("tab3");
    });

    it("should skip disabled tabs during keyboard navigation", async () => {
      const user = userEvent.setup();

      render(
        <Tabs defaultValue="tab1">
          <TabsList aria-label="Test">
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2" disabled>
              Tab 2
            </TabsTrigger>
            <TabsTrigger value="tab3">Tab 3</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
          <TabsContent value="tab3">Content 3</TabsContent>
        </Tabs>
      );

      const tabs = screen.getAllByRole("tab");
      await user.tab();
      expect(tabs[0]).toHaveFocus();

      await user.keyboard("{ArrowRight}");
      // Should skip disabled tab2 and go to tab3
      expect(tabs[2]).toHaveFocus();
    });

    it("should move focus to panel with Tab key", async () => {
      const user = userEvent.setup();
      render(<TestTabs defaultValue="tab1" />);

      const tabs = screen.getAllByRole("tab");
      await user.tab();
      expect(tabs[0]).toHaveFocus();

      await user.tab();

      const panel = screen.getByRole("tabpanel");
      expect(panel).toHaveFocus();
    });
  });

  describe("Variants & Styling", () => {
    it("should apply small size variant to list", () => {
      render(<TestTabs defaultValue="tab1" size="sm" />);

      const tablist = screen.getByRole("tablist");
      expect(tablist).toHaveClass(
        "h-(--spacing-tabs-list-height-sm)",
        "p-(--spacing-tabs-list-padding-sm)"
      );
    });

    it("should apply medium size variant to list (default)", () => {
      render(<TestTabs defaultValue="tab1" size="md" />);

      const tablist = screen.getByRole("tablist");
      expect(tablist).toHaveClass(
        "h-(--spacing-tabs-list-height-md)",
        "p-(--spacing-tabs-list-padding-md)"
      );
    });

    it("should apply large size variant to list", () => {
      render(<TestTabs defaultValue="tab1" size="lg" />);

      const tablist = screen.getByRole("tablist");
      expect(tablist).toHaveClass(
        "h-(--spacing-tabs-list-height-lg)",
        "p-(--spacing-tabs-list-padding-lg)"
      );
    });

    it("should apply small size variant to triggers", () => {
      render(<TestTabs defaultValue="tab1" size="sm" />);

      const tab = screen.getByRole("tab", { name: "Tab 1" });
      expect(tab).toHaveClass(
        "px-(--spacing-tabs-trigger-padding-x-sm)",
        "py-(--spacing-tabs-trigger-padding-y-sm)",
        "text-(length:--font-size-tabs-trigger-font-size-sm)"
      );
    });

    it("should apply medium size variant to triggers (default)", () => {
      render(<TestTabs defaultValue="tab1" size="md" />);

      const tab = screen.getByRole("tab", { name: "Tab 1" });
      expect(tab).toHaveClass(
        "px-(--spacing-tabs-trigger-padding-x-md)",
        "py-(--spacing-tabs-trigger-padding-y-md)",
        "text-(length:--font-size-tabs-trigger-font-size-md)"
      );
    });

    it("should apply large size variant to triggers", () => {
      render(<TestTabs defaultValue="tab1" size="lg" />);

      const tab = screen.getByRole("tab", { name: "Tab 1" });
      expect(tab).toHaveClass(
        "px-(--spacing-tabs-trigger-padding-x-lg)",
        "py-(--spacing-tabs-trigger-padding-y-lg)",
        "text-(length:--font-size-tabs-trigger-font-size-lg)"
      );
    });

    it("should have active tab styling", () => {
      render(<TestTabs defaultValue="tab1" />);

      const activeTab = screen.getByRole("tab", { name: "Tab 1" });
      expect(activeTab).toHaveClass(
        "data-[state=active]:bg-(--color-tabs-trigger-background-active)",
        "data-[state=active]:text-(--color-tabs-trigger-text-active)",
        "data-[state=active]:shadow-sm"
      );
    });

    it("should have hover styling on tabs", () => {
      render(<TestTabs defaultValue="tab1" />);

      const tab = screen.getByRole("tab", { name: "Tab 2" });
      expect(tab).toHaveClass(
        "hover:bg-(--color-tabs-trigger-background-hover)",
        "hover:text-(--color-tabs-trigger-text-hover)"
      );
    });

    it("should have focus ring styles", () => {
      render(<TestTabs defaultValue="tab1" />);

      const tab = screen.getByRole("tab", { name: "Tab 1" });
      expect(tab).toHaveClass(
        "focus-visible:outline-none",
        "focus-visible:ring-2",
        "focus-visible:ring-(--color-border-focus)",
        "focus-visible:ring-offset-2"
      );
    });

    it("should have disabled styles", () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList aria-label="Test">
            <TabsTrigger value="tab1" disabled>
              Tab 1
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content</TabsContent>
        </Tabs>
      );

      const tab = screen.getByRole("tab");
      expect(tab).toHaveClass(
        "disabled:pointer-events-none",
        "disabled:opacity-(--state-opacity-disabled)"
      );
    });

    it("should apply custom className to TabsList", () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList className="custom-list-class" aria-label="Test">
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content</TabsContent>
        </Tabs>
      );

      const tablist = screen.getByRole("tablist");
      expect(tablist).toHaveClass("custom-list-class");
    });

    it("should apply custom className to TabsTrigger", () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList aria-label="Test">
            <TabsTrigger value="tab1" className="custom-trigger-class">
              Tab 1
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content</TabsContent>
        </Tabs>
      );

      const tab = screen.getByRole("tab");
      expect(tab).toHaveClass("custom-trigger-class");
    });

    it("should apply custom className to TabsContent", () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList aria-label="Test">
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" className="custom-content-class">
            Content
          </TabsContent>
        </Tabs>
      );

      const panel = screen.getByRole("tabpanel");
      expect(panel).toHaveClass("custom-content-class");
    });
  });

  describe("Integration", () => {
    it("should forward ref to TabsList", () => {
      const ref = React.createRef<HTMLDivElement>();

      render(
        <Tabs defaultValue="tab1">
          <TabsList ref={ref} aria-label="Test">
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content</TabsContent>
        </Tabs>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it("should forward ref to TabsTrigger", () => {
      const ref = React.createRef<HTMLButtonElement>();

      render(
        <Tabs defaultValue="tab1">
          <TabsList aria-label="Test">
            <TabsTrigger ref={ref} value="tab1">
              Tab 1
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content</TabsContent>
        </Tabs>
      );

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });

    it("should forward ref to TabsContent", () => {
      const ref = React.createRef<HTMLDivElement>();

      render(
        <Tabs defaultValue="tab1">
          <TabsList aria-label="Test">
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent ref={ref} value="tab1">
            Content
          </TabsContent>
        </Tabs>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it("should handle rapid tab switching", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<TestTabs defaultValue="tab1" onValueChange={handleChange} />);

      const tab1 = screen.getByRole("tab", { name: "Tab 1" });
      const tab2 = screen.getByRole("tab", { name: "Tab 2" });
      const tab3 = screen.getByRole("tab", { name: "Tab 3" });

      await user.click(tab2);
      await user.click(tab3);
      await user.click(tab1);
      await user.click(tab2);

      expect(handleChange).toHaveBeenCalledTimes(4);
      expect(handleChange).toHaveBeenNthCalledWith(1, "tab2");
      expect(handleChange).toHaveBeenNthCalledWith(2, "tab3");
      expect(handleChange).toHaveBeenNthCalledWith(3, "tab1");
      expect(handleChange).toHaveBeenNthCalledWith(4, "tab2");
    });

    it("should support complex content in tabs", async () => {
      const user = userEvent.setup();

      render(
        <Tabs defaultValue="tab1">
          <TabsList aria-label="Test">
            <TabsTrigger value="tab1">
              <span className="icon">📝</span>
              <span>Notes</span>
            </TabsTrigger>
            <TabsTrigger value="tab2">
              <span className="icon">⚙️</span>
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Notes content</TabsContent>
          <TabsContent value="tab2">Settings content</TabsContent>
        </Tabs>
      );

      expect(screen.getByText("📝")).toBeInTheDocument();
      expect(screen.getByText("Notes")).toBeInTheDocument();

      await user.click(screen.getByRole("tab", { name: /Settings/i }));

      await waitFor(() => {
        expect(screen.getByText("Settings content")).toBeInTheDocument();
      });
    });

    it("should work with orientation attribute", () => {
      render(
        <Tabs defaultValue="tab1" orientation="vertical">
          <TabsList aria-label="Vertical tabs">
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      const tablist = screen.getByRole("tablist");
      expect(tablist).toHaveAttribute("aria-orientation", "vertical");
    });
  });

  describe("Edge Cases", () => {
    it("should handle single tab", () => {
      render(
        <Tabs defaultValue="only">
          <TabsList aria-label="Single tab">
            <TabsTrigger value="only">Only Tab</TabsTrigger>
          </TabsList>
          <TabsContent value="only">Only Content</TabsContent>
        </Tabs>
      );

      const tabs = screen.getAllByRole("tab");
      expect(tabs).toHaveLength(1);
      expect(screen.getByText("Only Content")).toBeInTheDocument();
    });

    it("should handle many tabs", () => {
      render(
        <Tabs defaultValue="tab0">
          <TabsList aria-label="Many tabs">
            {Array.from({ length: 10 }, (_, i) => (
              <TabsTrigger key={i} value={`tab${i}`}>
                Tab {i}
              </TabsTrigger>
            ))}
          </TabsList>
          {Array.from({ length: 10 }, (_, i) => (
            <TabsContent key={i} value={`tab${i}`}>
              Content {i}
            </TabsContent>
          ))}
        </Tabs>
      );

      const tabs = screen.getAllByRole("tab");
      expect(tabs).toHaveLength(10);
    });

    it("should handle long tab labels", () => {
      const longLabel =
        "This is a very long tab label that might need truncation";

      render(
        <Tabs defaultValue="tab1">
          <TabsList aria-label="Test">
            <TabsTrigger value="tab1">{longLabel}</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content</TabsContent>
        </Tabs>
      );

      expect(screen.getByText(longLabel)).toBeInTheDocument();
    });

    it("should handle tabs without initial value", () => {
      render(
        <Tabs>
          <TabsList aria-label="Test">
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      const tabs = screen.getAllByRole("tab");
      // All tabs should be unselected
      tabs.forEach((tab) => {
        expect(tab).toHaveAttribute("aria-selected", "false");
      });
    });

    it("should handle missing tab content", async () => {
      const user = userEvent.setup();

      render(
        <Tabs defaultValue="tab1">
          <TabsList aria-label="Test">
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          {/* No content for tab2 */}
        </Tabs>
      );

      await user.click(screen.getByRole("tab", { name: "Tab 2" }));

      // Should not throw error
      expect(screen.queryByText("Content 1")).not.toBeInTheDocument();
    });

    it("should preserve state when switching tabs", async () => {
      const user = userEvent.setup();

      const TabWithInput = () => (
        <Tabs defaultValue="tab1">
          <TabsList aria-label="Test">
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" forceMount>
            <input type="text" placeholder="Type here" />
          </TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      render(<TabWithInput />);

      const input = screen.getByPlaceholderText("Type here");
      await user.type(input, "test value");

      await user.click(screen.getByRole("tab", { name: "Tab 2" }));
      await user.click(screen.getByRole("tab", { name: "Tab 1" }));

      // Input should maintain its value with forceMount
      expect(screen.getByPlaceholderText("Type here")).toHaveValue(
        "test value"
      );
    });
  });
});

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "../hover-card";

expect.extend(toHaveNoViolations);

const TestHoverCard = () => (
  <HoverCard>
    <HoverCardTrigger>Hover me</HoverCardTrigger>
    <HoverCardContent>
      <div>
        <h4>Hover Card Title</h4>
        <p>This is the hover card content</p>
      </div>
    </HoverCardContent>
  </HoverCard>
);

describe("HoverCard", () => {
  describe("Accessibility", () => {
    it("should pass accessibility audit when closed", async () => {
      const { container } = render(<TestHoverCard />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should pass accessibility audit when open", async () => {
      const user = userEvent.setup();
      const { container } = render(<TestHoverCard />);

      const trigger = screen.getByText("Hover me");
      await user.hover(trigger);

      await waitFor(() => {
        expect(screen.getByText("Hover Card Title")).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("HoverCard Component", () => {
    it("should render trigger", () => {
      render(<TestHoverCard />);
      expect(screen.getByText("Hover me")).toBeInTheDocument();
    });

    it("should not show content initially", () => {
      render(<TestHoverCard />);
      expect(screen.queryByText("Hover Card Title")).not.toBeInTheDocument();
    });

    it("should show content on hover", async () => {
      const user = userEvent.setup();
      render(<TestHoverCard />);

      const trigger = screen.getByText("Hover me");
      await user.hover(trigger);

      await waitFor(() => {
        expect(screen.getByText("Hover Card Title")).toBeInTheDocument();
      });
    });

    it("should hide content when unhovered", async () => {
      const user = userEvent.setup();
      render(<TestHoverCard />);

      const trigger = screen.getByText("Hover me");
      await user.hover(trigger);

      await waitFor(() => {
        expect(screen.getByText("Hover Card Title")).toBeInTheDocument();
      });

      await user.unhover(trigger);

      await waitFor(() => {
        expect(screen.queryByText("Hover Card Title")).not.toBeInTheDocument();
      });
    });
  });

  describe("HoverCardTrigger Component", () => {
    it("should render with children", () => {
      render(
        <HoverCard>
          <HoverCardTrigger>Trigger Text</HoverCardTrigger>
          <HoverCardContent>Content</HoverCardContent>
        </HoverCard>
      );
      expect(screen.getByText("Trigger Text")).toBeInTheDocument();
    });

    it("should be hoverable", async () => {
      const user = userEvent.setup();
      render(
        <HoverCard>
          <HoverCardTrigger>Hover trigger</HoverCardTrigger>
          <HoverCardContent>Hover content</HoverCardContent>
        </HoverCard>
      );

      const trigger = screen.getByText("Hover trigger");
      await user.hover(trigger);

      await waitFor(() => {
        expect(screen.getByText("Hover content")).toBeInTheDocument();
      });
    });
  });

  describe("HoverCardContent Component", () => {
    it("should render content when open", async () => {
      const user = userEvent.setup();
      render(<TestHoverCard />);

      const trigger = screen.getByText("Hover me");
      await user.hover(trigger);

      await waitFor(() => {
        expect(screen.getByText("Hover Card Title")).toBeInTheDocument();
        expect(
          screen.getByText("This is the hover card content")
        ).toBeInTheDocument();
      });
    });

    it("should forward ref correctly", async () => {
      const user = userEvent.setup();
      const ref = React.createRef<HTMLDivElement>();

      render(
        <HoverCard>
          <HoverCardTrigger>Trigger</HoverCardTrigger>
          <HoverCardContent ref={ref}>Content</HoverCardContent>
        </HoverCard>
      );

      const trigger = screen.getByText("Trigger");
      await user.hover(trigger);

      await waitFor(() => {
        expect(ref.current).toBeInstanceOf(HTMLDivElement);
      });
    });

    it("should apply custom className", async () => {
      const user = userEvent.setup();
      render(
        <HoverCard>
          <HoverCardTrigger>Trigger</HoverCardTrigger>
          <HoverCardContent className="custom-content">
            Content
          </HoverCardContent>
        </HoverCard>
      );

      const trigger = screen.getByText("Trigger");
      await user.hover(trigger);

      await waitFor(() => {
        const content = screen.getByText("Content");
        expect(content).toHaveClass("custom-content");
      });
    });

    it("should support different sides", async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <HoverCard>
          <HoverCardTrigger>Trigger</HoverCardTrigger>
          <HoverCardContent side="top">Top content</HoverCardContent>
        </HoverCard>
      );

      let trigger = screen.getByText("Trigger");
      await user.hover(trigger);
      await waitFor(() =>
        expect(screen.getByText("Top content")).toBeInTheDocument()
      );
      await user.unhover(trigger);
      await waitFor(() =>
        expect(screen.queryByText("Top content")).not.toBeInTheDocument()
      );

      rerender(
        <HoverCard>
          <HoverCardTrigger>Trigger</HoverCardTrigger>
          <HoverCardContent side="right">Right content</HoverCardContent>
        </HoverCard>
      );

      trigger = screen.getByText("Trigger");
      await user.hover(trigger);
      await waitFor(() =>
        expect(screen.getByText("Right content")).toBeInTheDocument()
      );
    });

    it("should support sideOffset", async () => {
      const user = userEvent.setup();
      render(
        <HoverCard>
          <HoverCardTrigger>Trigger</HoverCardTrigger>
          <HoverCardContent sideOffset={20}>
            Content with offset
          </HoverCardContent>
        </HoverCard>
      );

      const trigger = screen.getByText("Trigger");
      await user.hover(trigger);

      await waitFor(() => {
        expect(screen.getByText("Content with offset")).toBeInTheDocument();
      });
    });
  });

  describe("Integration", () => {
    it("should work with complex content", async () => {
      const user = userEvent.setup();
      render(
        <HoverCard>
          <HoverCardTrigger>Hover for details</HoverCardTrigger>
          <HoverCardContent>
            <div>
              <h3>User Profile</h3>
              <p>Name: John Doe</p>
              <p>Email: john@example.com</p>
              <button type="button">View Profile</button>
            </div>
          </HoverCardContent>
        </HoverCard>
      );

      const trigger = screen.getByText("Hover for details");
      await user.hover(trigger);

      await waitFor(() => {
        expect(screen.getByText("User Profile")).toBeInTheDocument();
        expect(screen.getByText("Name: John Doe")).toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: "View Profile" })
        ).toBeInTheDocument();
      });
    });

    it("should work with images in content", async () => {
      const user = userEvent.setup();
      render(
        <HoverCard>
          <HoverCardTrigger>Hover for image</HoverCardTrigger>
          <HoverCardContent>
            <img src="/test.jpg" alt="Test" />
            <p>Image description</p>
          </HoverCardContent>
        </HoverCard>
      );

      const trigger = screen.getByText("Hover for image");
      await user.hover(trigger);

      await waitFor(() => {
        expect(screen.getByAltText("Test")).toBeInTheDocument();
        expect(screen.getByText("Image description")).toBeInTheDocument();
      });
    });

    it("should work with multiple hover cards", async () => {
      const user = userEvent.setup();
      render(
        <>
          <HoverCard>
            <HoverCardTrigger>Card 1</HoverCardTrigger>
            <HoverCardContent>Content 1</HoverCardContent>
          </HoverCard>
          <HoverCard>
            <HoverCardTrigger>Card 2</HoverCardTrigger>
            <HoverCardContent>Content 2</HoverCardContent>
          </HoverCard>
        </>
      );

      await user.hover(screen.getByText("Card 1"));
      await waitFor(() =>
        expect(screen.getByText("Content 1")).toBeInTheDocument()
      );

      await user.unhover(screen.getByText("Card 1"));
      await waitFor(() =>
        expect(screen.queryByText("Content 1")).not.toBeInTheDocument()
      );

      await user.hover(screen.getByText("Card 2"));
      await waitFor(() =>
        expect(screen.getByText("Content 2")).toBeInTheDocument()
      );
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty content", async () => {
      const user = userEvent.setup();
      render(
        <HoverCard>
          <HoverCardTrigger>Trigger</HoverCardTrigger>
          <HoverCardContent />
        </HoverCard>
      );

      const trigger = screen.getByText("Trigger");
      await user.hover(trigger);

      // Should not throw error
      expect(true).toBe(true);
    });

    it("should handle very long content", async () => {
      const user = userEvent.setup();
      const longContent = "Lorem ipsum dolor sit amet. ".repeat(50);

      render(
        <HoverCard>
          <HoverCardTrigger>Trigger</HoverCardTrigger>
          <HoverCardContent>
            <p>{longContent}</p>
          </HoverCardContent>
        </HoverCard>
      );

      const trigger = screen.getByText("Trigger");
      await user.hover(trigger);

      await waitFor(() => {
        expect(screen.getByText(/Lorem ipsum/)).toBeInTheDocument();
      });
    });

    it("should handle rapid hover/unhover", async () => {
      const user = userEvent.setup();
      render(<TestHoverCard />);

      const trigger = screen.getByText("Hover me");

      for (let i = 0; i < 3; i++) {
        await user.hover(trigger);
        await user.unhover(trigger);
      }

      // Should not throw errors
      expect(true).toBe(true);
    });
  });
});

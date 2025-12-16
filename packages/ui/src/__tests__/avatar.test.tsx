import React from "react";
import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { Avatar, AvatarImage, AvatarFallback } from "../avatar";

expect.extend(toHaveNoViolations);

describe("Avatar", () => {
  describe("Accessibility", () => {
    it("should pass accessibility audit for profile avatar with image", async () => {
      const { container } = render(
        <Avatar name="John Doe">
          <AvatarImage src="/avatar.jpg" name="John Doe" />
          <AvatarFallback name="John Doe" />
        </Avatar>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should pass accessibility audit for fallback avatar", async () => {
      const { container } = render(
        <Avatar name="John Doe">
          <AvatarFallback name="John Doe" />
        </Avatar>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have img role for profile avatar", () => {
      render(<Avatar name="John Doe" semanticRole="profile" />);
      const avatar = screen.getByRole("img");
      expect(avatar).toBeInTheDocument();
    });

    it("should have img role for user avatar", () => {
      render(<Avatar name="John Doe" semanticRole="user" />);
      const avatar = screen.getByRole("img");
      expect(avatar).toBeInTheDocument();
    });

    it("should have presentation role for decorative avatar", () => {
      const { container } = render(<Avatar semanticRole="decorative" />);
      const avatar = container.querySelector('[role="presentation"]');
      expect(avatar).toBeInTheDocument();
    });

    it("should have accessible label for profile avatar with name", () => {
      render(<Avatar name="John Doe" semanticRole="profile" />);
      const avatar = screen.getByLabelText("John Doe's profile picture");
      expect(avatar).toBeInTheDocument();
    });

    it("should have accessible label for user avatar with name", () => {
      render(<Avatar name="Jane Smith" semanticRole="user" />);
      const avatar = screen.getByLabelText("Jane Smith's avatar");
      expect(avatar).toBeInTheDocument();
    });

    it("should have default accessible label for profile without name", () => {
      render(<Avatar semanticRole="profile" />);
      const avatar = screen.getByLabelText("Profile picture");
      expect(avatar).toBeInTheDocument();
    });

    it("should have default accessible label for user without name", () => {
      render(<Avatar semanticRole="user" />);
      const avatar = screen.getByLabelText("User avatar");
      expect(avatar).toBeInTheDocument();
    });

    it("should not have aria-label for decorative avatar", () => {
      const { container } = render(<Avatar semanticRole="decorative" />);
      const avatar = container.firstChild;
      expect(avatar).not.toHaveAttribute("aria-label");
    });
  });

  describe("AvatarImage", () => {
    it("should render image with src", () => {
      render(
        <Avatar>
          <AvatarImage src="https://example.com/avatar.jpg" alt="Profile" />
        </Avatar>
      );
      const img = screen.getByRole("img", { name: "Profile" });
      expect(img).toHaveAttribute("src", "https://example.com/avatar.jpg");
    });

    it("should generate accessible alt text from name", () => {
      render(
        <Avatar>
          <AvatarImage src="/avatar.jpg" name="John Doe" />
        </Avatar>
      );
      const img = screen.getByAltText("Profile picture of John Doe");
      expect(img).toBeInTheDocument();
    });

    it("should use explicit alt text when provided", () => {
      render(
        <Avatar>
          <AvatarImage
            src="/avatar.jpg"
            name="John Doe"
            alt="Custom alt text"
          />
        </Avatar>
      );
      const img = screen.getByAltText("Custom alt text");
      expect(img).toBeInTheDocument();
    });

    it("should support empty alt for decorative images", () => {
      const { container } = render(
        <Avatar>
          <AvatarImage src="/avatar.jpg" alt="" />
        </Avatar>
      );
      const img = container.querySelector("img");
      expect(img).toHaveAttribute("alt", "");
    });

    it("should have lazy loading", () => {
      const { container } = render(
        <Avatar>
          <AvatarImage src="/avatar.jpg" alt="Profile" />
        </Avatar>
      );
      const img = container.querySelector("img");
      expect(img).toHaveAttribute("loading", "lazy");
    });

    it("should have proper aspect ratio classes", () => {
      const { container } = render(
        <Avatar>
          <AvatarImage src="/avatar.jpg" alt="Profile" />
        </Avatar>
      );
      const img = container.querySelector("img");
      expect(img).toHaveClass(
        "aspect-square",
        "h-full",
        "w-full",
        "object-cover"
      );
    });
  });

  describe("AvatarFallback", () => {
    it("should generate initials from name", () => {
      render(
        <Avatar>
          <AvatarFallback name="John Doe" />
        </Avatar>
      );
      expect(screen.getByText("JD")).toBeInTheDocument();
    });

    it("should use custom initials when provided", () => {
      render(
        <Avatar>
          <AvatarFallback name="John Doe" initials="AB" />
        </Avatar>
      );
      expect(screen.getByText("AB")).toBeInTheDocument();
    });

    it("should handle single name", () => {
      render(
        <Avatar>
          <AvatarFallback name="John" />
        </Avatar>
      );
      expect(screen.getByText("J")).toBeInTheDocument();
    });

    it("should handle multiple name parts", () => {
      render(
        <Avatar>
          <AvatarFallback name="John Michael Doe" />
        </Avatar>
      );
      // Should only use first 2 initials
      expect(screen.getByText("JM")).toBeInTheDocument();
    });

    it("should render custom children instead of initials", () => {
      render(
        <Avatar>
          <AvatarFallback name="John Doe">👤</AvatarFallback>
        </Avatar>
      );
      expect(screen.getByText("👤")).toBeInTheDocument();
    });

    it("should be aria-hidden", () => {
      const { container } = render(
        <Avatar>
          <AvatarFallback name="John Doe" />
        </Avatar>
      );
      const fallback = container.querySelector('[aria-hidden="true"]');
      expect(fallback).toBeInTheDocument();
    });

    it("should have proper styling classes", () => {
      render(
        <Avatar>
          <AvatarFallback name="John Doe" />
        </Avatar>
      );
      const fallback = screen.getByText("JD");
      expect(fallback).toHaveClass(
        "flex",
        "h-full",
        "w-full",
        "items-center",
        "justify-center",
        "rounded-full"
      );
    });
  });

  describe("Sizes", () => {
    it("should apply small size", () => {
      const { container } = render(<Avatar size="sm" />);
      const avatar = container.firstChild;
      expect(avatar).toHaveClass("h-8", "w-8");
    });

    it("should apply medium size by default", () => {
      const { container } = render(<Avatar />);
      const avatar = container.firstChild;
      expect(avatar).toHaveClass("h-10", "w-10");
    });

    it("should apply medium size explicitly", () => {
      const { container } = render(<Avatar size="md" />);
      const avatar = container.firstChild;
      expect(avatar).toHaveClass("h-10", "w-10");
    });

    it("should apply large size", () => {
      const { container } = render(<Avatar size="lg" />);
      const avatar = container.firstChild;
      expect(avatar).toHaveClass("h-12", "w-12");
    });

    it("should apply extra large size", () => {
      const { container } = render(<Avatar size="xl" />);
      const avatar = container.firstChild;
      expect(avatar).toHaveClass("h-16", "w-16");
    });
  });

  describe("Styling", () => {
    it("should have base styling classes", () => {
      const { container } = render(<Avatar />);
      const avatar = container.firstChild;
      expect(avatar).toHaveClass(
        "relative",
        "flex",
        "shrink-0",
        "overflow-hidden",
        "rounded-full"
      );
    });

    it("should have border styling", () => {
      const { container } = render(<Avatar />);
      const avatar = container.firstChild;
      expect(avatar).toHaveClass(
        "border",
        "border-[var(--color-avatar-border)]"
      );
    });

    it("should have background color", () => {
      const { container } = render(<Avatar />);
      const avatar = container.firstChild;
      expect(avatar).toHaveClass("bg-[var(--color-avatar-background)]");
    });

    it("should apply custom className", () => {
      const { container } = render(<Avatar className="custom-avatar" />);
      const avatar = container.firstChild;
      expect(avatar).toHaveClass("custom-avatar");
    });

    it("should combine size and custom className", () => {
      const { container } = render(<Avatar size="lg" className="shadow-lg" />);
      const avatar = container.firstChild;
      expect(avatar).toHaveClass("h-12", "w-12", "shadow-lg");
    });
  });

  describe("Integration", () => {
    it("should forward ref to avatar element", () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<Avatar ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it("should forward ref to AvatarImage", () => {
      const ref = React.createRef<HTMLImageElement>();
      render(
        <Avatar>
          <AvatarImage ref={ref} src="/avatar.jpg" alt="Profile" />
        </Avatar>
      );
      expect(ref.current).toBeInstanceOf(HTMLImageElement);
    });

    it("should forward ref to AvatarFallback", () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <Avatar>
          <AvatarFallback ref={ref} name="John Doe" />
        </Avatar>
      );
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it("should work with both image and fallback", () => {
      render(
        <Avatar name="John Doe">
          <AvatarImage src="/avatar.jpg" name="John Doe" />
          <AvatarFallback name="John Doe" />
        </Avatar>
      );
      expect(
        screen.getByAltText("Profile picture of John Doe")
      ).toBeInTheDocument();
      expect(screen.getByText("JD")).toBeInTheDocument();
    });

    it("should support data attributes", () => {
      render(<Avatar data-testid="user-avatar" />);
      expect(screen.getByTestId("user-avatar")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty name", () => {
      const { container } = render(
        <Avatar>
          <AvatarFallback name="" />
        </Avatar>
      );
      // Should render fallback element even with empty name
      const fallback = container.querySelector('[aria-hidden="true"]');
      expect(fallback).toBeInTheDocument();
    });

    it("should handle lowercase names", () => {
      render(
        <Avatar>
          <AvatarFallback name="john doe" />
        </Avatar>
      );
      expect(screen.getByText("JD")).toBeInTheDocument();
    });

    it("should handle names with special characters", () => {
      render(
        <Avatar>
          <AvatarFallback name="Jean-Paul D'Arcy" />
        </Avatar>
      );
      // Should extract first letters of parts
      expect(screen.getByText("JD")).toBeInTheDocument();
    });

    it("should limit initials to 2 characters", () => {
      render(
        <Avatar>
          <AvatarFallback name="One Two Three Four" />
        </Avatar>
      );
      const text = screen.getByText(/^[A-Z]{2}$/);
      expect(text).toBeInTheDocument();
    });

    it("should support additional HTML attributes", () => {
      render(<Avatar id="my-avatar" />);
      expect(screen.getByRole("img")).toHaveAttribute("id", "my-avatar");
    });
  });
});

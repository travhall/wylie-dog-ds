import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom";
import { Avatar, AvatarImage, AvatarFallback } from "../avatar";

/**
 * Radix's `Avatar.Image` loads through an off-screen `new window.Image()`
 * (see @radix-ui/react-avatar's `useImageLoadingStatus`), not through the
 * rendered `<img>` element itself — the `<img>` only mounts once loading
 * status resolves to "loaded". jsdom never actually fetches image URLs, so
 * without stubbing `window.Image` the loading status would stay stuck at
 * "loading" forever. This stub resolves synchronously so tests don't need
 * to wait on a real network round trip: any `src` containing "broken"
 * resolves as a load failure, everything else resolves as a successful load.
 */
class MockImage {
  onload: ((event: { currentTarget: MockImage }) => void) | null = null;
  onerror: (() => void) | null = null;
  crossOrigin: string | null = null;
  referrerPolicy = "";
  naturalWidth = 0;
  complete = false;
  private _src = "";

  addEventListener(type: "load" | "error", listener: () => void) {
    if (type === "load") {
      this.onload = listener as (event: { currentTarget: MockImage }) => void;
    }
    if (type === "error") this.onerror = listener;
  }

  removeEventListener(type: "load" | "error") {
    if (type === "load") this.onload = null;
    if (type === "error") this.onerror = null;
  }

  get src() {
    return this._src;
  }

  set src(value: string) {
    this._src = value;
    this.complete = true;
    if (!value || value.includes("broken")) {
      this.naturalWidth = 0;
      this.onerror?.();
    } else {
      this.naturalWidth = 100;
      this.onload?.({ currentTarget: this });
    }
  }
}

beforeEach(() => {
  vi.stubGlobal("Image", MockImage);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Avatar", () => {
  describe("Accessibility", () => {
    it("should pass accessibility audit for profile avatar with image", async () => {
      const { container } = render(
        <Avatar name="John Doe">
          <AvatarImage src="/avatar.jpg" name="John Doe" />
          <AvatarFallback name="John Doe" />
        </Avatar>
      );
      await waitFor(() => {
        expect(
          screen.getByAltText("Profile picture of John Doe")
        ).toBeInTheDocument();
      });
      const results = await axe(container);
      expect(results.violations).toHaveLength(0);
    });

    it("should pass accessibility audit for fallback avatar", async () => {
      const { container } = render(
        <Avatar name="John Doe">
          <AvatarFallback name="John Doe" />
        </Avatar>
      );
      const results = await axe(container);
      expect(results.violations).toHaveLength(0);
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
    it("should render image with src once loaded", async () => {
      render(
        <Avatar>
          <AvatarImage src="https://example.com/avatar.jpg" alt="Profile" />
        </Avatar>
      );
      const img = await screen.findByRole("img", { name: "Profile" });
      expect(img).toHaveAttribute("src", "https://example.com/avatar.jpg");
    });

    it("should generate accessible alt text from name", async () => {
      render(
        <Avatar>
          <AvatarImage src="/avatar.jpg" name="John Doe" />
        </Avatar>
      );
      const img = await screen.findByAltText("Profile picture of John Doe");
      expect(img).toBeInTheDocument();
    });

    it("should use explicit alt text when provided", async () => {
      render(
        <Avatar>
          <AvatarImage
            src="/avatar.jpg"
            name="John Doe"
            alt="Custom alt text"
          />
        </Avatar>
      );
      const img = await screen.findByAltText("Custom alt text");
      expect(img).toBeInTheDocument();
    });

    it("should support empty alt for decorative images", async () => {
      const { container } = render(
        <Avatar>
          <AvatarImage src="/avatar.jpg" alt="" />
        </Avatar>
      );
      await waitFor(() => {
        expect(container.querySelector("img")).toBeInTheDocument();
      });
      const img = container.querySelector("img");
      expect(img).toHaveAttribute("alt", "");
    });

    it("should have lazy loading", async () => {
      const { container } = render(
        <Avatar>
          <AvatarImage src="/avatar.jpg" alt="Profile" />
        </Avatar>
      );
      await waitFor(() => {
        expect(container.querySelector("img")).toBeInTheDocument();
      });
      const img = container.querySelector("img");
      expect(img).toHaveAttribute("loading", "lazy");
    });

    it("should have proper aspect ratio classes", async () => {
      const { container } = render(
        <Avatar>
          <AvatarImage src="/avatar.jpg" alt="Profile" />
        </Avatar>
      );
      await waitFor(() => {
        expect(container.querySelector("img")).toBeInTheDocument();
      });
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
        "rounded-(--space-avatar-rounded)"
      );
    });
  });

  describe("Fallback conditional rendering", () => {
    it("renders only the image, not the fallback, once the image loads successfully", async () => {
      render(
        <Avatar name="John Doe">
          <AvatarImage src="/avatar.jpg" name="John Doe" />
          <AvatarFallback name="John Doe" />
        </Avatar>
      );

      await waitFor(() => {
        expect(
          screen.getByAltText("Profile picture of John Doe")
        ).toBeInTheDocument();
      });
      expect(screen.queryByText("JD")).not.toBeInTheDocument();
    });

    it("renders only the fallback, not the image, once the image fails to load", async () => {
      render(
        <Avatar name="John Doe">
          <AvatarImage src="/broken-avatar.jpg" name="John Doe" />
          <AvatarFallback name="John Doe" />
        </Avatar>
      );

      await waitFor(() => {
        expect(screen.getByText("JD")).toBeInTheDocument();
      });
      expect(
        screen.queryByAltText("Profile picture of John Doe")
      ).not.toBeInTheDocument();
    });

    it("renders the fallback immediately when no AvatarImage is present", () => {
      render(
        <Avatar name="John Doe">
          <AvatarFallback name="John Doe" />
        </Avatar>
      );
      expect(screen.getByText("JD")).toBeInTheDocument();
    });

    it("keeps generating the same aria-label and initials as before this fix (regression guard)", () => {
      render(
        <Avatar name="Jane Smith" semanticRole="user">
          <AvatarFallback name="Jane Smith" />
        </Avatar>
      );
      expect(screen.getByLabelText("Jane Smith's avatar")).toBeInTheDocument();
      expect(screen.getByText("JS")).toBeInTheDocument();
    });
  });

  describe("Sizes", () => {
    it("should apply small size", () => {
      const { container } = render(<Avatar size="sm" />);
      const avatar = container.firstChild;
      expect(avatar).toHaveClass(
        "h-(--space-avatar-size-sm)",
        "w-(--space-avatar-size-sm)"
      );
    });

    it("should apply medium size by default", () => {
      const { container } = render(<Avatar />);
      const avatar = container.firstChild;
      expect(avatar).toHaveClass(
        "h-(--space-avatar-size-md)",
        "w-(--space-avatar-size-md)"
      );
    });

    it("should apply medium size explicitly", () => {
      const { container } = render(<Avatar size="md" />);
      const avatar = container.firstChild;
      expect(avatar).toHaveClass(
        "h-(--space-avatar-size-md)",
        "w-(--space-avatar-size-md)"
      );
    });

    it("should apply large size", () => {
      const { container } = render(<Avatar size="lg" />);
      const avatar = container.firstChild;
      expect(avatar).toHaveClass(
        "h-(--space-avatar-size-lg)",
        "w-(--space-avatar-size-lg)"
      );
    });

    it("should apply extra large size", () => {
      const { container } = render(<Avatar size="xl" />);
      const avatar = container.firstChild;
      expect(avatar).toHaveClass(
        "h-(--space-avatar-size-xl)",
        "w-(--space-avatar-size-xl)"
      );
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
        "rounded-(--space-avatar-rounded)"
      );
    });

    it("should have border styling", () => {
      const { container } = render(<Avatar />);
      const avatar = container.firstChild;
      expect(avatar).toHaveClass("border", "border-(--color-avatar-border)");
    });

    it("should have background color", () => {
      const { container } = render(<Avatar />);
      const avatar = container.firstChild;
      expect(avatar).toHaveClass("bg-(--color-avatar-background)");
    });

    it("should apply custom className", () => {
      const { container } = render(<Avatar className="custom-avatar" />);
      const avatar = container.firstChild;
      expect(avatar).toHaveClass("custom-avatar");
    });

    it("should combine size and custom className", () => {
      const { container } = render(<Avatar size="lg" className="shadow-lg" />);
      const avatar = container.firstChild;
      expect(avatar).toHaveClass(
        "h-(--space-avatar-size-lg)",
        "w-(--space-avatar-size-lg)",
        "shadow-lg"
      );
    });
  });

  describe("Integration", () => {
    it("should forward ref to avatar element", () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<Avatar ref={ref} />);
      // Radix's Avatar.Root renders a <span> under the hood; HTMLSpanElement
      // and HTMLDivElement are structurally identical in the DOM typings
      // (both plain HTMLElement subtypes), so the declared ref type is
      // unaffected even though the concrete tag changed from div to span.
      expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    });

    it("should forward ref to AvatarImage once loaded", async () => {
      const ref = React.createRef<HTMLImageElement>();
      render(
        <Avatar>
          <AvatarImage ref={ref} src="/avatar.jpg" alt="Profile" />
        </Avatar>
      );
      await waitFor(() => {
        expect(ref.current).toBeInstanceOf(HTMLImageElement);
      });
    });

    it("should forward ref to AvatarFallback", () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <Avatar>
          <AvatarFallback ref={ref} name="John Doe" />
        </Avatar>
      );
      // Radix's Avatar.Fallback renders a <span> under the hood — see note
      // on the "should forward ref to avatar element" test above.
      expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    });

    it("should show only the fallback until the image resolves, then only the image", async () => {
      render(
        <Avatar name="John Doe">
          <AvatarImage src="/avatar.jpg" name="John Doe" />
          <AvatarFallback name="John Doe" />
        </Avatar>
      );
      await waitFor(() => {
        expect(
          screen.getByAltText("Profile picture of John Doe")
        ).toBeInTheDocument();
      });
      expect(screen.queryByText("JD")).not.toBeInTheDocument();
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
          {/* cSpell:ignore D'Arcy */}
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

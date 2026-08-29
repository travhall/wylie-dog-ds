/**
 * Avatar Component Accessibility Tests
 * Tests for semantic roles, automatic alt text generation, and initials
 */

import { render, screen, waitFor } from "@testing-library/react";
import { vi, beforeEach, afterEach } from "vitest";
import { Avatar, AvatarImage, AvatarFallback } from "../avatar";
import {
  expectToPassA11yAudit,
  testScreenReaderAnnouncements,
  describeA11y,
} from "../lib/test-utils";

/**
 * Radix's `Avatar.Image` loads through an off-screen `new window.Image()`
 * and only mounts the rendered `<img>` once loading status resolves to
 * "loaded" — jsdom never actually fetches image URLs, so tests must stub
 * `window.Image` to resolve synchronously. See avatar.test.tsx for the
 * fuller explanation.
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

describeA11y("Avatar", () => {
  describe("Semantic Role Handling", () => {
    it("uses profile context by default", async () => {
      const { container } = render(
        <Avatar name="John Doe">
          <AvatarFallback name="John Doe" />
        </Avatar>
      );

      await expectToPassA11yAudit(container);

      const avatar = screen.getByRole("img");
      testScreenReaderAnnouncements(avatar, {
        role: "img",
        ariaLabel: "John Doe's profile picture",
      });
    });

    it("supports user context", () => {
      render(
        <Avatar name="Jane Smith" semanticRole="user">
          <AvatarFallback name="Jane Smith" />
        </Avatar>
      );

      const avatar = screen.getByRole("img");
      expect(avatar).toHaveAttribute("aria-label", "Jane Smith's avatar");
    });

    it("supports decorative context", () => {
      render(
        <Avatar semanticRole="decorative">
          <AvatarFallback>?</AvatarFallback>
        </Avatar>
      );

      const avatar = screen.getByRole("presentation");
      expect(avatar).not.toHaveAttribute("aria-label");
    });

    it("generates appropriate labels without name", () => {
      render(
        <Avatar semanticRole="profile">
          <AvatarFallback />
        </Avatar>
      );

      const avatar = screen.getByRole("img");
      expect(avatar).toHaveAttribute("aria-label", "Profile picture");
    });
  });

  describe("AvatarImage Accessibility", () => {
    it("generates alt text from name", async () => {
      render(
        <Avatar name="John Doe">
          <AvatarImage src="/john.jpg" name="John Doe" />
        </Avatar>
      );

      // Query the actual img element specifically, once it has loaded
      const image = await screen.findByAltText("Profile picture of John Doe");
      expect(image).toHaveAttribute("alt", "Profile picture of John Doe");
      expect(image).toHaveAttribute("loading", "lazy");
    });

    it("supports custom alt text", async () => {
      render(
        <Avatar>
          <AvatarImage src="/custom.jpg" alt="Custom description" />
        </Avatar>
      );

      // Query by alt text, once it has loaded
      const image = await screen.findByAltText("Custom description");
      expect(image).toHaveAttribute("alt", "Custom description");
    });

    it("supports empty alt text for decorative images", async () => {
      const { container } = render(
        <Avatar>
          <AvatarImage src="/decorative.jpg" alt="" />
        </Avatar>
      );

      // Find the actual img element by src attribute, once it has loaded
      await waitFor(() => {
        expect(
          container.querySelector('img[src="/decorative.jpg"]')
        ).toBeInTheDocument();
      });
      const image = container.querySelector('img[src="/decorative.jpg"]');
      expect(image?.getAttribute("alt")).toBe("");
    });

    it("provides fallback alt text without name", async () => {
      render(
        <Avatar>
          <AvatarImage src="/unknown.jpg" />
        </Avatar>
      );

      // Query by alt text, once it has loaded
      const image = await screen.findByAltText("Profile picture");
      expect(image).toHaveAttribute("alt", "Profile picture");
    });
  });

  describe("AvatarFallback Accessibility", () => {
    it("generates initials from name", () => {
      render(
        <Avatar name="John Doe">
          <AvatarFallback name="John Doe" />
        </Avatar>
      );

      // Fallback should be decorative since parent Avatar has aria-label
      const fallback = screen.getByText("JD");
      expect(fallback).toHaveAttribute("aria-hidden", "true");
    });

    it("handles long names correctly", () => {
      render(
        <Avatar name="John Michael Alexander Doe">
          <AvatarFallback name="John Michael Alexander Doe" />
        </Avatar>
      );

      // Should only show first 2 initials
      expect(screen.getByText("JM")).toBeInTheDocument();
    });

    it("supports custom initials", () => {
      render(
        <Avatar name="John Doe">
          <AvatarFallback name="John Doe" initials="JS" />
        </Avatar>
      );

      expect(screen.getByText("JS")).toBeInTheDocument();
    });

    it("supports custom content", () => {
      render(
        <Avatar>
          <AvatarFallback>
            <span>Custom Content</span>
          </AvatarFallback>
        </Avatar>
      );

      expect(screen.getByText("Custom Content")).toBeInTheDocument();
    });

    it("handles names without spaces", () => {
      render(
        <Avatar name="Madonna">
          <AvatarFallback name="Madonna" />
        </Avatar>
      );

      expect(screen.getByText("M")).toBeInTheDocument();
    });
  });

  describe("Size Variants", () => {
    const sizes = ["sm", "md", "lg", "xl"] as const;

    sizes.forEach((size) => {
      it(`passes accessibility audit with ${size} size`, async () => {
        const { container } = render(
          <Avatar size={size} name="Test User">
            <AvatarFallback name="Test User" />
          </Avatar>
        );

        await expectToPassA11yAudit(container);
      });
    });
  });

  describe("Complete Avatar Patterns", () => {
    it("handles full avatar with image and fallback", async () => {
      const { container } = render(
        <Avatar name="John Doe" semanticRole="profile">
          <AvatarImage src="/john.jpg" name="John Doe" />
          <AvatarFallback name="John Doe" />
        </Avatar>
      );

      await expectToPassA11yAudit(container);

      // Avatar container should have proper labeling
      const avatar = screen.getByLabelText("John Doe's profile picture");
      expect(avatar).toBeInTheDocument();

      // Image should have proper alt text, once it has loaded
      const image = await screen.findByAltText("Profile picture of John Doe");
      expect(image).toHaveAttribute("alt", "Profile picture of John Doe");
    });

    it("handles avatar without image (fallback only)", async () => {
      const { container } = render(
        <Avatar name="Jane Smith" semanticRole="user">
          <AvatarFallback name="Jane Smith" />
        </Avatar>
      );

      await expectToPassA11yAudit(container);

      const avatar = screen.getByRole("img");
      expect(avatar).toHaveAttribute("aria-label", "Jane Smith's avatar");
      expect(screen.getByText("JS")).toBeInTheDocument();
    });

    it("handles team member list pattern", async () => {
      const users = [
        { name: "John Doe", image: "/john.jpg" },
        { name: "Jane Smith", image: null },
        { name: "Mike Johnson", image: "/mike.jpg" },
      ];

      const { container } = render(
        <div>
          {users.map((user) => (
            <Avatar key={user.name} name={user.name} semanticRole="profile">
              {user.image && <AvatarImage src={user.image} name={user.name} />}
              <AvatarFallback name={user.name} />
            </Avatar>
          ))}
        </div>
      );

      await expectToPassA11yAudit(container);

      // Each avatar should be properly labeled
      expect(
        screen.getByLabelText("John Doe's profile picture")
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText("Jane Smith's profile picture")
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText("Mike Johnson's profile picture")
      ).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles empty name gracefully", async () => {
      const { container } = render(
        <Avatar name="">
          <AvatarFallback name="" />
        </Avatar>
      );

      await expectToPassA11yAudit(container);
      expect(screen.getByLabelText("Profile picture")).toBeInTheDocument();
    });

    it("handles special characters in names", async () => {
      const { container } = render(
        <Avatar name="José María">
          <AvatarFallback name="José María" />
        </Avatar>
      );
      // cSpell:ignore José María

      await expectToPassA11yAudit(container);
      expect(screen.getByText("JM")).toBeInTheDocument();
      expect(
        screen.getByLabelText("José María's profile picture")
      ).toBeInTheDocument();
    });
  });
});

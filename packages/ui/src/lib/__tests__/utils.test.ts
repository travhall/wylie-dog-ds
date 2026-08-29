import { describe, it, expect } from "vitest";
import { cn } from "../utils";

describe("utils", () => {
  describe("cn", () => {
    it("should combine multiple class names", () => {
      expect(cn("foo", "bar", "baz")).toBe("foo bar baz");
    });

    it("should filter out falsy values", () => {
      expect(cn("foo", false, "bar", undefined, "baz", null)).toBe(
        "foo bar baz"
      );
    });

    it("should handle empty input", () => {
      expect(cn()).toBe("");
    });

    it("should handle all falsy values", () => {
      expect(cn(false, undefined, null)).toBe("");
    });

    it("should handle conditional classes", () => {
      const isActive = true;
      const isDisabled = false;
      expect(cn("base", isActive && "active", isDisabled && "disabled")).toBe(
        "base active"
      );
    });

    it("should handle single class", () => {
      expect(cn("single")).toBe("single");
    });

    it("should resolve conflicting plain Tailwind utilities so the last wins", () => {
      expect(cn("p-2", "p-4")).toBe("p-4");
    });

    it("should resolve conflicting arbitrary-property token classes (this repo's -(--token-name) convention) so the last wins", () => {
      expect(cn("bg-(--color-avatar-background)", "bg-(--color-x)")).toBe(
        "bg-(--color-x)"
      );
    });

    it("should still filter falsy values before merging", () => {
      expect(cn("a", undefined, false, null, "b")).toBe("a b");
    });

    it("should preserve non-conflicting classes", () => {
      const result = cn("flex", "items-center");
      expect(result).toContain("flex");
      expect(result).toContain("items-center");
    });
  });
});

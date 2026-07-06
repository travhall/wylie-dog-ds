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
  });
});

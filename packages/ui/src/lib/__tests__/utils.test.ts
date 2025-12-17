import { describe, it, expect } from "vitest";
import { cn, createVariants, mergeProps } from "../utils";

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

  describe("createVariants", () => {
    it("should return variants object unchanged", () => {
      const variants = {
        primary: "bg-blue-500",
        secondary: "bg-gray-500",
        danger: "bg-red-500",
      };
      expect(createVariants(variants)).toEqual(variants);
    });

    it("should work with empty variants", () => {
      const variants = {};
      expect(createVariants(variants)).toEqual(variants);
    });

    it("should maintain reference equality", () => {
      const variants = {
        small: "text-sm",
        medium: "text-base",
        large: "text-lg",
      };
      const result = createVariants(variants);
      expect(result).toBe(variants);
    });
  });

  describe("mergeProps", () => {
    it("should merge default props with provided props", () => {
      const defaultProps = { foo: "default", bar: "default" };
      const props = { bar: "override", baz: "new" };
      const result = mergeProps(defaultProps, props);

      expect(result).toEqual({
        foo: "default",
        bar: "override",
        baz: "new",
      });
    });

    it("should override default props with provided props", () => {
      const defaultProps = { className: "default-class", disabled: false };
      const props = { className: "custom-class", disabled: true };
      const result = mergeProps(defaultProps, props);

      expect(result.className).toBe("custom-class");
      expect(result.disabled).toBe(true);
    });

    it("should work with empty default props", () => {
      const defaultProps = {};
      const props = { foo: "bar" };
      const result = mergeProps(defaultProps, props);

      expect(result).toEqual({ foo: "bar" });
    });

    it("should work with partial defaults", () => {
      const defaultProps = { a: 1, b: 2 };
      const props = { a: 1, b: 2, c: 3 };
      const result = mergeProps(defaultProps, props);

      expect(result).toEqual({ a: 1, b: 2, c: 3 });
    });

    it("should handle nested objects by reference", () => {
      const nestedDefault = { nested: { value: 1 } };
      const nestedProps = { nested: { value: 2 } };
      const result = mergeProps(nestedDefault, nestedProps);

      expect(result.nested.value).toBe(2);
    });
  });
});

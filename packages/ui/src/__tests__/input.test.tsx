import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { vi } from "vitest";
import { Input } from "../input";

expect.extend(toHaveNoViolations);

describe("Input", () => {
  describe("Accessibility", () => {
    it("should pass accessibility audit", async () => {
      const { container } = render(<Input aria-label="Test input" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should pass accessibility audit with error state", async () => {
      const { container } = render(
        <div>
          <Input
            aria-label="Email"
            error
            errorId="email-error"
            aria-describedby="email-error"
          />
          <span id="email-error" role="alert">
            Invalid email
          </span>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have proper ARIA attributes for error state", () => {
      render(<Input aria-label="Email" error errorId="email-error" />);

      const input = screen.getByLabelText("Email");
      expect(input).toHaveAttribute("aria-invalid", "true");
      expect(input).toHaveAttribute("aria-describedby", "email-error");
    });

    it("should combine multiple describedby IDs", () => {
      render(
        <Input
          aria-label="Password"
          descriptionId="password-hint"
          errorId="password-error"
          error
        />
      );

      const input = screen.getByLabelText("Password");
      expect(input).toHaveAttribute(
        "aria-describedby",
        "password-hint password-error"
      );
    });

    it("should be keyboard focusable", () => {
      render(<Input aria-label="Test input" />);
      const input = screen.getByLabelText("Test input");

      input.focus();
      expect(input).toHaveFocus();
    });

    it("should not be focusable when disabled", () => {
      render(<Input aria-label="Test input" disabled />);
      const input = screen.getByLabelText("Test input");

      expect(input).toBeDisabled();
      input.focus();
      expect(input).not.toHaveFocus();
    });
  });

  describe("Functionality", () => {
    it("should render with default props", () => {
      render(<Input aria-label="Test input" />);
      const input = screen.getByLabelText("Test input");

      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("type", "text");
    });

    it("should accept and display user input", () => {
      render(<Input aria-label="Username" />);
      const input = screen.getByLabelText("Username") as HTMLInputElement;

      fireEvent.change(input, { target: { value: "john_doe" } });
      expect(input.value).toBe("john_doe");
    });

    it("should call onChange handler", () => {
      const handleChange = vi.fn();
      render(<Input aria-label="Test input" onChange={handleChange} />);
      const input = screen.getByLabelText("Test input");

      fireEvent.change(input, { target: { value: "test" } });
      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it("should call onFocus and onBlur handlers", () => {
      const handleFocus = vi.fn();
      const handleBlur = vi.fn();
      render(
        <Input
          aria-label="Test input"
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      );
      const input = screen.getByLabelText("Test input");

      fireEvent.focus(input);
      expect(handleFocus).toHaveBeenCalledTimes(1);

      fireEvent.blur(input);
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it("should support different input types", () => {
      const types = [
        "text",
        "email",
        "password",
        "number",
        "tel",
        "url",
      ] as const;

      types.forEach((type) => {
        const { unmount } = render(
          <Input aria-label={`${type} input`} type={type} />
        );
        const input = screen.getByLabelText(`${type} input`);
        expect(input).toHaveAttribute("type", type);
        unmount();
      });
    });

    it("should support placeholder text", () => {
      render(<Input aria-label="Email" placeholder="Enter your email" />);
      const input = screen.getByPlaceholderText("Enter your email");
      expect(input).toBeInTheDocument();
    });

    it("should support default value", () => {
      render(<Input aria-label="Username" defaultValue="john_doe" />);
      const input = screen.getByLabelText("Username") as HTMLInputElement;
      expect(input.value).toBe("john_doe");
    });

    it("should support controlled value", () => {
      const { rerender } = render(
        <Input
          aria-label="Email"
          value="test@example.com"
          onChange={() => {}}
        />
      );
      const input = screen.getByLabelText("Email") as HTMLInputElement;

      expect(input.value).toBe("test@example.com");

      rerender(
        <Input aria-label="Email" value="new@example.com" onChange={() => {}} />
      );
      expect(input.value).toBe("new@example.com");
    });

    it("should handle disabled state", () => {
      render(<Input aria-label="Test input" disabled />);
      const input = screen.getByLabelText("Test input");

      expect(input).toBeDisabled();
      expect(input).toHaveAttribute("disabled");
    });

    it("should handle readonly state", () => {
      render(<Input aria-label="Test input" readOnly value="readonly" />);
      const input = screen.getByLabelText("Test input") as HTMLInputElement;

      expect(input).toHaveAttribute("readonly");
      expect(input.value).toBe("readonly");

      // Attempt to change - should not work
      fireEvent.change(input, { target: { value: "changed" } });
      expect(input.value).toBe("readonly");
    });

    it("should support required attribute", () => {
      render(<Input aria-label="Test input" required />);
      const input = screen.getByLabelText("Test input");
      expect(input).toBeRequired();
    });
  });

  describe("Variants & Styling", () => {
    it("should support all size variants", async () => {
      const sizes = ["sm", "md", "lg"] as const;

      for (const size of sizes) {
        const { container, unmount } = render(
          <Input aria-label="Test" size={size} />
        );
        const results = await axe(container);
        expect(results).toHaveNoViolations();
        unmount();
      }
    });

    it("should apply size classes correctly", () => {
      const { rerender } = render(<Input aria-label="Test" size="sm" />);
      let input = screen.getByLabelText("Test");
      expect(input).toHaveClass("h-8", "px-3", "text-xs");

      rerender(<Input aria-label="Test" size="md" />);
      input = screen.getByLabelText("Test");
      expect(input).toHaveClass("h-10", "px-3", "text-sm");

      rerender(<Input aria-label="Test" size="lg" />);
      input = screen.getByLabelText("Test");
      expect(input).toHaveClass("h-12", "px-4", "text-base");
    });

    it("should apply error styling when error prop is true", () => {
      render(<Input aria-label="Test" error />);
      const input = screen.getByLabelText("Test");
      expect(input).toHaveClass("border-[var(--color-input-border-error)]");
    });

    it("should accept custom className", () => {
      render(<Input aria-label="Test" className="custom-class" />);
      const input = screen.getByLabelText("Test");
      expect(input).toHaveClass("custom-class");
    });
  });

  describe("Edge Cases", () => {
    it("should handle very long input values", () => {
      const longValue = "a".repeat(1000);
      render(<Input aria-label="Test" value={longValue} onChange={() => {}} />);
      const input = screen.getByLabelText("Test") as HTMLInputElement;
      expect(input.value).toBe(longValue);
    });

    it("should handle rapid input changes", () => {
      const handleChange = vi.fn();
      render(<Input aria-label="Test" onChange={handleChange} />);
      const input = screen.getByLabelText("Test");

      for (let i = 0; i < 10; i++) {
        fireEvent.change(input, { target: { value: `test${i}` } });
      }

      expect(handleChange).toHaveBeenCalledTimes(10);
    });

    it("should handle special characters", () => {
      const specialChars = '!@#$%^&*()_+-=[]{}|;:",.<>?/~`';
      render(
        <Input aria-label="Test" value={specialChars} onChange={() => {}} />
      );
      const input = screen.getByLabelText("Test") as HTMLInputElement;
      expect(input.value).toBe(specialChars);
    });

    it("should handle empty value", () => {
      render(<Input aria-label="Test" value="" onChange={() => {}} />);
      const input = screen.getByLabelText("Test") as HTMLInputElement;
      expect(input.value).toBe("");
    });

    it("should handle numeric input for number type", () => {
      render(<Input aria-label="Age" type="number" />);
      const input = screen.getByLabelText("Age") as HTMLInputElement;

      fireEvent.change(input, { target: { value: "25" } });
      expect(input.value).toBe("25");
    });
  });

  describe("Integration", () => {
    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<Input aria-label="Test" ref={ref} />);

      expect(ref.current).toBeInstanceOf(HTMLInputElement);
      expect(ref.current?.tagName).toBe("INPUT");
    });

    it("should allow focus via ref", () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<Input aria-label="Test" ref={ref} />);

      ref.current?.focus();
      expect(ref.current).toHaveFocus();
    });

    it("should work with form submission", () => {
      const handleSubmit = vi.fn((e) => e.preventDefault());
      render(
        <form onSubmit={handleSubmit}>
          <Input aria-label="Username" name="username" />
          <button type="submit">Submit</button>
        </form>
      );

      const input = screen.getByLabelText("Username");
      const button = screen.getByRole("button");

      fireEvent.change(input, { target: { value: "testuser" } });
      fireEvent.click(button);

      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });

    it("should work with label element", () => {
      render(
        <div>
          <label htmlFor="email-input">Email Address</label>
          <Input id="email-input" />
        </div>
      );

      const input = screen.getByLabelText("Email Address");
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("id", "email-input");
    });

    it("should support maxLength attribute", () => {
      render(<Input aria-label="Test" maxLength={10} />);
      const input = screen.getByLabelText("Test") as HTMLInputElement;

      expect(input).toHaveAttribute("maxLength", "10");

      // Note: maxLength enforcement is browser-specific behavior
      // In jsdom, it's not automatically enforced, but the attribute is present
      fireEvent.change(input, { target: { value: "1234567890" } });
      expect(input.value).toBe("1234567890");
    });

    it("should support pattern attribute for validation", () => {
      render(<Input aria-label="Phone" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" />);
      const input = screen.getByLabelText("Phone");
      expect(input).toHaveAttribute("pattern", "[0-9]{3}-[0-9]{3}-[0-9]{4}");
    });

    it("should support autoComplete attribute", () => {
      render(<Input aria-label="Email" autoComplete="email" />);
      const input = screen.getByLabelText("Email");
      expect(input).toHaveAttribute("autoComplete", "email");
    });
  });
});

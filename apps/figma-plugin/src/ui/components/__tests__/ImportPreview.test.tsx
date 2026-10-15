import { h } from "preact";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/preact";
import { ImportPreview, type ImportPreviewSummary } from "../ImportPreview";

const baseSummary: ImportPreviewSummary = {
  format: "W3C DTCG",
  confidence: 0.923,
  collectionsFound: 2,
  tokensToImport: 14,
  transformations: [],
  warnings: [],
  errors: [],
};

function setup(overrides: Partial<ImportPreviewSummary> = {}) {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  render(
    <ImportPreview
      summary={{ ...baseSummary, ...overrides }}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
  return { onConfirm, onCancel };
}

describe("ImportPreview", () => {
  describe("a clean import", () => {
    it("shows the detected format, a rounded confidence and the counts", () => {
      setup();
      expect(screen.getByText("Ready to Import")).toBeInTheDocument();
      expect(screen.getByText("W3C DTCG")).toBeInTheDocument();
      expect(screen.getByText("92% confidence")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
      expect(screen.getByText("Collections")).toBeInTheDocument();
      expect(screen.getByText("14")).toBeInTheDocument();
      expect(screen.getByText("Tokens")).toBeInTheDocument();
    });

    it("uses singular labels for a single collection and token", () => {
      setup({ collectionsFound: 1, tokensToImport: 1 });
      expect(screen.getByText("Collection")).toBeInTheDocument();
      expect(screen.getByText("Token")).toBeInTheDocument();
    });

    it("hides the transformation, warning and error sections", () => {
      setup();
      expect(screen.queryByText(/Transformation/)).not.toBeInTheDocument();
      expect(screen.queryByText("Warnings")).not.toBeInTheDocument();
      expect(screen.queryByText("Errors")).not.toBeInTheDocument();
    });

    it("confirms and cancels", () => {
      const { onConfirm, onCancel } = setup();
      fireEvent.click(screen.getByText("Import Tokens"));
      expect(onConfirm).toHaveBeenCalledTimes(1);
      fireEvent.click(screen.getByText("Cancel"));
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it("highlights the Import button on hover", () => {
      setup();
      const button = screen.getByText("Import Tokens").closest("button")!;
      fireEvent.mouseEnter(button);
      expect(button.style.backgroundColor).toBe("var(--accent-primary-hover)");
      fireEvent.mouseLeave(button);
      expect(button.style.backgroundColor).toBe("var(--accent-primary)");
    });
  });

  describe("transformations", () => {
    const transformations = [
      { type: "type-conversion", description: "px to number" },
      { type: "type-conversion", description: "rem to number" },
      { type: "name-change", description: "dots to slashes" },
    ];

    it("lists a collapsed, pluralised count that expands to groups by type", () => {
      setup({ transformations });
      const toggle = screen.getByText(/3 Transformations Required/);
      expect(screen.queryByText(/px to number/)).not.toBeInTheDocument();

      fireEvent.click(toggle);
      expect(screen.getByText("type conversion (2)")).toBeInTheDocument();
      expect(screen.getByText(/px to number/)).toBeInTheDocument();
      expect(screen.getByText(/\(\+ more\)/)).toBeInTheDocument();
      expect(screen.getByText("name change (1)")).toBeInTheDocument();
      expect(screen.getByText("dots to slashes")).toBeInTheDocument();

      fireEvent.click(toggle);
      expect(screen.queryByText(/px to number/)).not.toBeInTheDocument();
    });

    it("uses the singular for one transformation", () => {
      setup({ transformations: [transformations[2]] });
      expect(screen.getByText(/1 Transformation Required/)).toBeInTheDocument();
    });
  });

  describe("warnings", () => {
    it("lists every warning and still allows the import", () => {
      const { onConfirm } = setup({ warnings: ["First", "Second"] });
      expect(screen.getByText("Warnings")).toBeInTheDocument();
      expect(screen.getByText("• First")).toBeInTheDocument();
      expect(screen.getByText("• Second")).toBeInTheDocument();
      fireEvent.click(screen.getByText("Import Tokens"));
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });
  });

  describe("errors", () => {
    it("lists every error, changes the header, and blocks the import", () => {
      const { onCancel } = setup({
        errors: ["Bad $type", "No root"],
      });
      expect(screen.getByText("Import Preview")).toBeInTheDocument();
      expect(screen.queryByText("Ready to Import")).not.toBeInTheDocument();
      expect(screen.getByText("Errors")).toBeInTheDocument();
      expect(screen.getByText("• Bad $type")).toBeInTheDocument();
      expect(screen.getByText("• No root")).toBeInTheDocument();

      const confirm = screen.getByText("Cannot Import").closest("button")!;
      expect(confirm).toBeDisabled();
      fireEvent.mouseEnter(confirm);
      fireEvent.mouseLeave(confirm);
      expect(confirm.style.backgroundColor).toBe("var(--surface-tertiary)");

      fireEvent.click(screen.getByText("Cancel"));
      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });
});

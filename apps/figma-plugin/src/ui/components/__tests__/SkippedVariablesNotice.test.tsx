import { h } from "preact";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/preact";
import { SkippedVariablesNotice } from "../SkippedVariablesNotice";
import type { UnsupportedVariable } from "../../../plugin/variables/processor";

const skip = (
  name: string,
  collection = "Semantic",
  resolvedType = "EASING"
): UnsupportedVariable => ({
  id: `${collection}/${name}`,
  name,
  collection,
  resolvedType,
  reason: `${resolvedType} is not exported yet`,
});

describe("SkippedVariablesNotice", () => {
  it("shows the count and keeps the list collapsed", () => {
    render(
      <SkippedVariablesNotice
        skipped={[skip("easing/default"), skip("timing/fast")]}
        onDismiss={vi.fn()}
      />
    );
    expect(screen.getByText("2 variables were left out")).toBeInTheDocument();
    expect(screen.queryByText("easing/default")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Show list" })).toHaveAttribute(
      "aria-expanded",
      "false"
    );
  });

  it("uses singular wording for one variable", () => {
    render(
      <SkippedVariablesNotice skipped={[skip("a")]} onDismiss={vi.fn()} />
    );
    expect(screen.getByText("1 variable was left out")).toBeInTheDocument();
  });

  it("expands to a list grouped by collection with reasons", () => {
    render(
      <SkippedVariablesNotice
        skipped={[
          skip("easing/default", "Semantic"),
          skip("accent", "Primitive", "COLOR"),
        ]}
        onDismiss={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Show list" }));
    expect(screen.getByRole("button", { name: "Hide list" })).toHaveAttribute(
      "aria-expanded",
      "true"
    );
    expect(
      screen.getByRole("heading", { name: "Semantic" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Primitive" })
    ).toBeInTheDocument();
    expect(screen.getByText("easing/default")).toBeInTheDocument();
    expect(screen.getByText(/COLOR is not exported yet/)).toBeInTheDocument();
  });

  it("calls onDismiss", () => {
    const onDismiss = vi.fn();
    render(
      <SkippedVariablesNotice skipped={[skip("a")]} onDismiss={onDismiss} />
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Dismiss skipped variables notice" })
    );
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  describe("tokens a push left out of the repository's format", () => {
    const repoFormat = (
      name: string,
      collection = "primitive"
    ): UnsupportedVariable => ({
      id: `repo-format:${collection}:${name}`,
      name,
      collection,
      resolvedType: "",
      reason: "no DTCG type for this value",
      origin: "repo-format",
    });

    it("calls them tokens and says they are still in Figma", () => {
      render(
        <SkippedVariablesNotice
          skipped={[repoFormat("color.bad"), repoFormat("color.worse")]}
          onDismiss={vi.fn()}
        />
      );
      expect(screen.getByText("2 tokens were left out")).toBeInTheDocument();
      expect(
        screen.getByText(/can't be written in the repository's DTCG format/)
      ).toBeInTheDocument();
      expect(screen.getByText(/They are still in Figma/)).toBeInTheDocument();
      expect(
        screen.queryByText(/can't export these variable types/)
      ).not.toBeInTheDocument();
    });

    it("lists each token with its reason, and no empty type brackets", () => {
      render(
        <SkippedVariablesNotice
          skipped={[repoFormat("color.bad")]}
          onDismiss={vi.fn()}
        />
      );
      fireEvent.click(screen.getByRole("button", { name: "Show list" }));
      expect(screen.getByText("color.bad")).toBeInTheDocument();
      expect(
        screen.getByText("no DTCG type for this value")
      ).toBeInTheDocument();
      expect(screen.queryByText(/\(\)/)).not.toBeInTheDocument();
    });

    it("says both things when Figma and the format each left something out", () => {
      render(
        <SkippedVariablesNotice
          skipped={[skip("easing/default"), repoFormat("color.bad")]}
          onDismiss={vi.fn()}
        />
      );
      expect(screen.getByText("2 tokens were left out")).toBeInTheDocument();
      expect(
        screen.getByText(/can't export these variable types/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/can't be written in the repository's DTCG format/)
      ).toBeInTheDocument();
    });
  });
});

import { h } from "preact";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/preact";
import { EnhancedErrorDisplay } from "../EnhancedErrorDisplay";
import { ErrorHandler } from "../../../shared/error-handler";
import { classifyFailure } from "../../../shared/sync-failure";

const http = (status: number) =>
  Object.assign(new Error(`HTTP ${status}`), {
    status,
    response: { headers: {} },
  });

const classified = (error: unknown, ctx = {}) =>
  ErrorHandler.fromFailure(classifyFailure(error, ctx));

describe("EnhancedErrorDisplay with a classified error", () => {
  it("shows what happened as the headline, not a generic line, and no 'Fixable' label", () => {
    render(
      <EnhancedErrorDisplay
        error={classified(http(404), {
          stage: "folder",
          repo: "acme/tokens",
          folder: "design/",
          branch: "main",
        })}
        onDismiss={() => {}}
      />
    );
    expect(
      screen.getByText(/"design\/" is not in acme\/tokens on main/)
    ).toBeInTheDocument();
    expect(screen.queryByText("Fixable")).not.toBeInTheDocument();
    expect(screen.queryByText(/Try this/)).not.toBeInTheDocument();
  });

  it("offers Edit setup for a missing folder and calls onAction with it", () => {
    const onAction = vi.fn();
    render(
      <EnhancedErrorDisplay
        error={classified(http(404), { stage: "folder", repo: "a/b" })}
        onDismiss={() => {}}
        onRetry={() => {}}
        onAction={onAction}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Edit setup" }));
    expect(onAction).toHaveBeenCalledWith("edit-setup");
    // the fix is the setup, so no competing Try Again
    expect(screen.queryByText("Try Again")).not.toBeInTheDocument();
  });

  it("offers Enter a new token for a rejected token", () => {
    const onAction = vi.fn();
    render(
      <EnhancedErrorDisplay
        error={classified(http(401))}
        onDismiss={() => {}}
        onAction={onAction}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Enter a new token" }));
    expect(onAction).toHaveBeenCalledWith("new-token");
  });

  it("keeps Try Again for a retryable error", () => {
    const onRetry = vi.fn();
    render(
      <EnhancedErrorDisplay
        error={classified(new TypeError("Failed to fetch"))}
        onDismiss={() => {}}
        onRetry={onRetry}
        onAction={() => {}}
      />
    );
    fireEvent.click(screen.getByText("Try Again"));
    expect(onRetry).toHaveBeenCalled();
  });

  it("shows the original error text under technical details", () => {
    render(
      <EnhancedErrorDisplay
        error={classified(http(404), { stage: "repo", repo: "a/b" })}
        onDismiss={() => {}}
      />
    );
    fireEvent.click(screen.getByText("Show Details"));
    expect(screen.getByText("HTTP 404")).toBeInTheDocument();
  });

  it("links Read Docs to a real README section", () => {
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    render(
      <EnhancedErrorDisplay
        error={classified(http(401))}
        onDismiss={() => {}}
      />
    );
    fireEvent.click(screen.getByText(/Read Docs/));
    expect(open).toHaveBeenCalledWith(
      "https://github.com/travhall/wylie-dog-ds/blob/main/apps/figma-plugin/README.md#authentication",
      "_blank"
    );
    open.mockRestore();
  });

  it("offers no docs link for a failure the docs do not cover", () => {
    render(
      <EnhancedErrorDisplay
        error={classified(new TypeError("Failed to fetch"))}
        onDismiss={() => {}}
      />
    );
    expect(screen.queryByText(/Read Docs/)).not.toBeInTheDocument();
  });
});

describe("EnhancedErrorDisplay with a plain message", () => {
  it("still sorts a string and shows the generic help", () => {
    render(<EnhancedErrorDisplay error="something odd" onDismiss={() => {}} />);
    expect(screen.getByText("Needs attention")).toBeInTheDocument();
  });
});

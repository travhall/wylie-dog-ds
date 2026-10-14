import { h } from "preact";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/preact";
import { TokensTab } from "../TokensTab";
import { UIProvider, useUIContext } from "../../../state";
import type { Collection } from "../../../hooks/usePluginMessages";

const collections: Collection[] = [
  { id: "c1", name: "primitive", modes: [], variableIds: ["v1", "v2"] },
  { id: "c2", name: "semantic", modes: [], variableIds: ["v3"] },
];

function Select({ id }: { id: string }) {
  const { dispatch } = useUIContext();
  return (
    <button onClick={() => dispatch({ type: "TOGGLE_COLLECTION", id })}>
      select-{id}
    </button>
  );
}

function setup(overrides: Partial<Parameters<typeof TokensTab>[0]> = {}) {
  const props = {
    collections,
    onToggleCollection: vi.fn(),
    onViewDetails: vi.fn(),
    onSelectAll: vi.fn(),
    onDeselectAll: vi.fn(),
    loading: false,
    onImportFile: vi.fn(),
    onGenerateDemoTokens: vi.fn(),
    onSetupGitHub: vi.fn(),
    onDownloadJSON: vi.fn(),
    onPushToGitHub: vi.fn(),
    ...overrides,
  };
  render(
    <UIProvider>
      <Select id="c1" />
      <TokensTab {...props} />
    </UIProvider>
  );
  return props;
}

describe("TokensTab", () => {
  it("shows the empty state actions when there are no collections", () => {
    const props = setup({ collections: [] });
    fireEvent.click(screen.getByText("Import token file"));
    fireEvent.click(screen.getByText("Try demo tokens"));
    fireEvent.click(screen.getByText("Connect GitHub"));
    expect(props.onImportFile).toHaveBeenCalledTimes(1);
    expect(props.onGenerateDemoTokens).toHaveBeenCalledTimes(1);
    expect(props.onSetupGitHub).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("Select all")).not.toBeInTheDocument();
  });

  it("offers to pull when GitHub is already configured", () => {
    setup({ collections: [], githubConfigured: true });
    expect(screen.getByText("Pull from GitHub")).toBeInTheDocument();
  });

  it("lists collections with a count and toggles one when its card is clicked", () => {
    const props = setup();
    expect(screen.getByText("2 collections")).toBeInTheDocument();
    expect(screen.getByText("primitive")).toBeInTheDocument();
    expect(screen.getByText("semantic")).toBeInTheDocument();
    fireEvent.click(screen.getByText("primitive"));
    expect(props.onToggleCollection).toHaveBeenCalledWith("c1");
  });

  it("calls select all and enables clear only when something is selected", () => {
    const props = setup();
    fireEvent.click(screen.getByText("Select all"));
    expect(props.onSelectAll).toHaveBeenCalledTimes(1);

    const clear = screen
      .getByText("Clear")
      .closest("button") as HTMLButtonElement;
    expect(clear).toBeDisabled();
    fireEvent.click(screen.getByText("select-c1"));
    expect(clear).not.toBeDisabled();
    fireEvent.click(clear);
    expect(props.onDeselectAll).toHaveBeenCalledTimes(1);
  });

  it("shows the selection footer with the count once a collection is selected", () => {
    setup();
    expect(screen.queryByText("1 selected")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("select-c1"));
    expect(screen.getByText("1 selected")).toBeInTheDocument();
  });

  it("hides collection names while loading", () => {
    setup({ loading: true });
    expect(screen.queryByText("primitive")).not.toBeInTheDocument();
  });
});

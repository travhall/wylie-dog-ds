import { h } from "preact";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/preact";
import { SyncTab } from "../SyncTab";
import { UIProvider } from "../../../state";
import type { GitHubConfig } from "../../../../shared/types";
import type { ConflictAwareGitHubClient } from "../../../../plugin/sync/conflict-aware-github-client";

const repoOnly = {
  owner: "acme",
  repo: "design-tokens",
  branch: "main",
  tokenPath: "tokens",
} as unknown as GitHubConfig;

function renderTab(
  githubConfig: GitHubConfig | null,
  githubConfigured: boolean
) {
  return render(
    <UIProvider>
      <SyncTab
        githubClient={{} as ConflictAwareGitHubClient}
        githubConfig={githubConfig}
        githubConfigured={githubConfigured}
        collections={[]}
        loading={false}
        onPushToGitHub={vi.fn()}
        onPullFromGitHub={vi.fn()}
        onImportFile={vi.fn()}
        onGitHubConfigComplete={vi.fn()}
      />
    </UIProvider>
  );
}

describe("SyncTab token prompt", () => {
  it("asks for the user's token when the file has a repo but this user has no token", () => {
    renderTab(repoOnly, false);
    expect(screen.getByText("Add your GitHub token")).toBeInTheDocument();
    expect(screen.getByText(/acme\/design-tokens/)).toBeInTheDocument();
    expect(screen.queryByText("Connect GitHub")).not.toBeInTheDocument();
  });

  it("shows the normal connect view when nothing is configured", () => {
    renderTab(null, false);
    expect(screen.getByText("Connect GitHub")).toBeInTheDocument();
    expect(screen.queryByText("Add your GitHub token")).not.toBeInTheDocument();
  });
});

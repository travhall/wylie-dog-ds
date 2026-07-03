import { describe, it, expect } from "vitest";
import { getProvider } from "../provider-registry";
import type { GitHubConfig } from "../../../shared/types";

const baseConfig: GitHubConfig = {
  owner: "acme",
  repo: "tokens",
  branch: "main",
  tokenPath: "tokens",
  syncMode: "direct",
};

describe("getProvider", () => {
  it("returns a GitHub provider for provider: github", () => {
    const provider = getProvider({ ...baseConfig, provider: "github" });
    expect(provider.id).toBe("github");
    expect(typeof provider.pullTokens).toBe("function");
    expect(typeof provider.syncTokens).toBe("function");
    expect(typeof provider.listFiles).toBe("function");
  });

  it("defaults to GitHub when provider is absent", () => {
    const provider = getProvider(baseConfig);
    expect(provider.id).toBe("github");
  });

  it("throws for gitlab (not yet supported)", () => {
    expect(() => getProvider({ ...baseConfig, provider: "gitlab" })).toThrow(
      /not supported/i
    );
  });

  it("throws for bitbucket (not yet supported)", () => {
    expect(() => getProvider({ ...baseConfig, provider: "bitbucket" })).toThrow(
      /not supported/i
    );
  });
});

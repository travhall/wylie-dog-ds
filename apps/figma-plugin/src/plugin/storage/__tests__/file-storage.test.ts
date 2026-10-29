import { beforeEach, describe, expect, it, vi } from "vitest";
import { ACCESS_TOKEN_STORAGE_KEY, FileConfigStorage } from "../file-storage";
import type { GitHubConfig } from "../../../shared/types";

const base = {
  owner: "o",
  repo: "r",
  branch: "main",
  tokenPath: "tokens",
} as unknown as GitHubConfig;

describe("FileConfigStorage token handling", () => {
  let pluginData: Record<string, string>;
  let client: Record<string, unknown>;
  const storage = new FileConfigStorage();

  beforeEach(() => {
    pluginData = {};
    client = {};
    vi.stubGlobal("figma", {
      root: {
        getPluginData: (k: string) => pluginData[k] ?? "",
        setPluginData: (k: string, v: string) => {
          pluginData[k] = v;
        },
      },
      clientStorage: {
        getAsync: async (k: string) => client[k],
        setAsync: async (k: string, v: unknown) => {
          client[k] = v;
        },
        deleteAsync: async (k: string) => {
          delete client[k];
        },
      },
    });
  });

  it("never writes accessToken to plugin data; stores it in clientStorage", async () => {
    await storage.setGitHubConfig({ ...base, accessToken: "ghp_secret" });
    expect(pluginData["github-config"]).not.toContain("ghp_secret");
    expect(JSON.parse(pluginData["github-config"]).owner).toBe("o");
    expect(client[ACCESS_TOKEN_STORAGE_KEY]).toBe("ghp_secret");
  });

  it("merges the user's token on read", async () => {
    await storage.setGitHubConfig({ ...base, accessToken: "ghp_secret" });
    const cfg = await storage.getGitHubConfig();
    expect(cfg?.accessToken).toBe("ghp_secret");
  });

  it("returns config without token when user has none", async () => {
    pluginData["github-config"] = JSON.stringify(base);
    const cfg = await storage.getGitHubConfig();
    expect(cfg?.repo).toBe("r");
    expect(cfg?.accessToken).toBeUndefined();
  });

  it("migrates a legacy file token to clientStorage and strips it from the file", async () => {
    pluginData["github-config"] = JSON.stringify({
      ...base,
      accessToken: "ghp_legacy",
    });
    const cfg = await storage.getGitHubConfig();
    expect(cfg?.accessToken).toBe("ghp_legacy");
    expect(client[ACCESS_TOKEN_STORAGE_KEY]).toBe("ghp_legacy");
    expect(pluginData["github-config"]).not.toContain("ghp_legacy");
  });

  it("keeps the user's own token over a legacy file token, still strips file", async () => {
    client[ACCESS_TOKEN_STORAGE_KEY] = "ghp_mine";
    pluginData["github-config"] = JSON.stringify({
      ...base,
      accessToken: "ghp_theirs",
    });
    const cfg = await storage.getGitHubConfig();
    expect(cfg?.accessToken).toBe("ghp_mine");
    expect(client[ACCESS_TOKEN_STORAGE_KEY]).toBe("ghp_mine");
    expect(pluginData["github-config"]).not.toContain("ghp_theirs");
  });

  it("clear removes the file config and keeps the user token", async () => {
    await storage.setGitHubConfig({ ...base, accessToken: "ghp_secret" });
    await storage.clearGitHubConfig();
    expect(pluginData["github-config"]).toBe("");
    expect(client[ACCESS_TOKEN_STORAGE_KEY]).toBe("ghp_secret");
  });

  it("clearGitHubToken removes the user token and keeps the file config", async () => {
    await storage.setGitHubConfig({ ...base, accessToken: "ghp_secret" });
    await storage.clearGitHubToken();
    expect(client[ACCESS_TOKEN_STORAGE_KEY]).toBeUndefined();
    expect(pluginData["github-config"]).not.toBe("");
    const cfg = await storage.getGitHubConfig();
    expect(cfg?.owner).toBe(base.owner);
    expect(cfg?.accessToken).toBeUndefined();
  });
});

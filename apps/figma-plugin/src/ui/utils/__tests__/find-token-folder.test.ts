import { describe, expect, it, vi } from "vitest";
import { chooseTokenFolder, findTokenFolder } from "../find-token-folder";

describe("chooseTokenFolder", () => {
  it("prefers the folder holding a resolver file", () => {
    expect(
      chooseTokenFolder([
        "README.md",
        "design-tokens/colors.json",
        "style/dictionary/tokens.resolver.json",
        "style/dictionary/palette.json",
      ])
    ).toEqual({ path: "style/dictionary/", found: "resolver" });
  });

  it("takes Wylie Dog's folder when it has a resolver, else the shallowest", () => {
    expect(
      chooseTokenFolder([
        "tokens/tokens.resolver.json",
        "packages/tokens/io/sync/tokens.resolver.json",
      ]).path
    ).toBe("packages/tokens/io/sync/");
    expect(
      chooseTokenFolder(["a/b/tokens.resolver.json", "z/tokens.resolver.json"])
        .path
    ).toBe("z/");
  });

  it("falls back to a conventional folder with JSON files directly in it", () => {
    expect(
      chooseTokenFolder(["src/tokens/colors.json", "src/tokens/space.json"])
    ).toEqual({ path: "src/tokens/", found: "known-folder" });
    // the native Wylie Dog layout has no resolver
    expect(
      chooseTokenFolder(["packages/tokens/io/sync/primitive.json"])
    ).toEqual({ path: "packages/tokens/io/sync/", found: "known-folder" });
  });

  it("ignores a conventional folder that only has JSON deeper down or other files", () => {
    expect(
      chooseTokenFolder(["tokens/nested/colors.json", "tokens/README.md"])
    ).toEqual({ path: "tokens/", found: "none" });
  });

  it("keeps the current path when the repository has files under it", () => {
    expect(
      chooseTokenFolder(
        ["mine/colors.json", "tokens/tokens.resolver.json"],
        "mine/"
      )
    ).toEqual({ path: "mine/", found: "current" });
    expect(
      chooseTokenFolder(["tokens/tokens.resolver.json"], "/gone/")
    ).toEqual({ path: "tokens/", found: "resolver" });
  });

  it("offers tokens/ for a repository with no token files", () => {
    expect(chooseTokenFolder(["README.md", "src/index.ts"])).toEqual({
      path: "tokens/",
      found: "none",
    });
    expect(chooseTokenFolder([])).toEqual({ path: "tokens/", found: "none" });
  });

  it("does not use a resolver at the repository root", () => {
    expect(chooseTokenFolder(["tokens.resolver.json"]).found).toBe("none");
  });
});

describe("findTokenFolder", () => {
  const repo = { owner: "acme", repo: "t", branch: "feat/x", token: "tok" };
  const reply = (ok: boolean, body: unknown = {}) =>
    vi.fn(async () => ({ ok, json: async () => body }));

  it("reads the branch's file tree once, with the token", async () => {
    const fetchFn = reply(true, {
      tree: [
        { path: "tokens", type: "tree" },
        { path: "tokens/tokens.resolver.json", type: "blob" },
      ],
    });
    await expect(findTokenFolder(repo, undefined, fetchFn)).resolves.toEqual({
      path: "tokens/",
      found: "resolver",
    });
    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(fetchFn).toHaveBeenCalledWith(
      "https://api.github.com/repos/acme/t/git/trees/feat%2Fx?recursive=1",
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer tok" }),
      })
    );
  });

  it("returns null when the repository cannot be read", async () => {
    expect(await findTokenFolder(repo, undefined, reply(false))).toBeNull();
    expect(await findTokenFolder(repo, undefined, reply(true, {}))).toBeNull();
    const throwing = vi.fn(async () => {
      throw new Error("offline");
    });
    expect(await findTokenFolder(repo, undefined, throwing)).toBeNull();
  });
});

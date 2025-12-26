import { describe, it, expect } from "vitest";
import { parseGitHubUrl } from "../parseGitHubUrl";

describe("parseGitHubUrl", () => {
  it("should parse standard GitHub URL", () => {
    const result = parseGitHubUrl("https://github.com/travishall/wylie-dog-ds");
    expect(result).toEqual({
      owner: "travishall",
      repo: "wylie-dog-ds",
      branch: "main",
      tokenPath: "",
    });
  });

  it("should parse GitHub URL with branch", () => {
    const result = parseGitHubUrl(
      "https://github.com/travishall/wylie-dog-ds/tree/develop"
    );
    expect(result).toEqual({
      owner: "travishall",
      repo: "wylie-dog-ds",
      branch: "develop",
      tokenPath: "",
    });
  });

  it("should parse GitHub URL with path", () => {
    const result = parseGitHubUrl(
      "https://github.com/travishall/wylie-dog-ds/tree/main/packages/tokens"
    );
    expect(result).toEqual({
      owner: "travishall",
      repo: "wylie-dog-ds",
      branch: "main",
      tokenPath: "packages/tokens",
    });
  });

  it("should parse shortened GitHub URL", () => {
    const result = parseGitHubUrl("travishall/wylie-dog-ds");
    expect(result).toEqual({
      owner: "travishall",
      repo: "wylie-dog-ds",
      branch: "main",
      tokenPath: "",
    });
  });

  it("should return null for invalid URLs", () => {
    const result = parseGitHubUrl("not-a-valid-url");
    expect(result).toBeNull();
  });

  it("should handle GitHub.com URL variations", () => {
    const result = parseGitHubUrl("http://github.com/travishall/wylie-dog-ds");
    expect(result).toEqual({
      owner: "travishall",
      repo: "wylie-dog-ds",
      branch: "main",
      tokenPath: "",
    });
  });

  it("should handle trailing slashes", () => {
    const result = parseGitHubUrl(
      "https://github.com/travishall/wylie-dog-ds/"
    );
    expect(result).toEqual({
      owner: "travishall",
      repo: "wylie-dog-ds",
      branch: "main",
      tokenPath: "",
    });
  });

  it("should handle .git extension", () => {
    const result = parseGitHubUrl(
      "https://github.com/travishall/wylie-dog-ds.git"
    );
    expect(result).toEqual({
      owner: "travishall",
      repo: "wylie-dog-ds",
      branch: "main",
      tokenPath: "",
    });
  });
});

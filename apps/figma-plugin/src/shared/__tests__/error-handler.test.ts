import { describe, expect, it } from "vitest";
import { ErrorHandler, ErrorType } from "../error-handler";
import { classifyFailure, SyncFailureError } from "../sync-failure";

const http = (status: number, message = `HTTP ${status}`) =>
  Object.assign(new Error(message), { status, response: { headers: {} } });

describe("ErrorHandler.fromFailure", () => {
  it("carries the kind, the action and the message, and offers no generic tips", () => {
    const failure = classifyFailure(http(401), { repo: "acme/tokens" });
    const error = ErrorHandler.fromFailure(failure);
    expect(error).toMatchObject({
      type: ErrorType.AUTHENTICATION_ERROR,
      kind: "token-rejected",
      action: "new-token",
      message: failure.message,
      details: failure.detail,
      suggestions: [],
      recoverable: true,
    });
  });

  it("maps each kind to the error type that picks its icon and colour", () => {
    const type = (error: unknown, ctx = {}) =>
      ErrorHandler.fromFailure(classifyFailure(error, ctx)).type;
    expect(type(http(404), { stage: "folder" })).toBe(
      ErrorType.REPOSITORY_ERROR
    );
    expect(type(new TypeError("Failed to fetch"))).toBe(
      ErrorType.NETWORK_ERROR
    );
    expect(type(http(422))).toBe(ErrorType.CONFLICT_ERROR);
    expect(type(new Error("Failed to parse a.json: x"))).toBe(
      ErrorType.TOKEN_FORMAT_ERROR
    );
  });

  it("keeps the rate limit's retry time", () => {
    const error = ErrorHandler.fromFailure(
      classifyFailure(
        Object.assign(new Error("rate limit"), {
          status: 429,
          response: { headers: { "retry-after": "60" } },
        }),
        {},
        Date.parse("2026-11-14T12:00:00Z")
      )
    );
    expect(error.retryAt).toBe("2026-11-14T12:01:00.000Z");
  });
});

describe("ErrorHandler.fromException", () => {
  it("uses the classification a SyncFailureError carries", () => {
    const failure = classifyFailure(http(404), {
      stage: "folder",
      repo: "acme/tokens",
      folder: "design/",
    });
    const error = ErrorHandler.fromException(new SyncFailureError(failure));
    expect(error.kind).toBe("folder-not-found");
    expect(error.message).toContain('"design/"');
  });

  it("classifies by HTTP status, not by a number inside the text", () => {
    expect(ErrorHandler.fromException(http(401)).kind).toBe("token-rejected");
    const noisy = ErrorHandler.fromException(
      new Error("Imported 1401 tokens, 3 skipped")
    );
    expect(noisy.kind).toBeUndefined();
    expect(noisy.type).toBe(ErrorType.UNKNOWN_ERROR);
    expect(noisy.message).toBe("Imported 1401 tokens, 3 skipped");
  });

  it("still reports conflicts and unknown errors", () => {
    expect(
      ErrorHandler.fromException(new Error("a conflict was found")).type
    ).toBe(ErrorType.CONFLICT_ERROR);
    expect(ErrorHandler.fromException("weird").message).toBe("weird");
  });
});

describe("ErrorHandler.fromResult", () => {
  it("prefers the classification, then the text, then the fallback", () => {
    const failure = classifyFailure(http(403), { repo: "acme/tokens" });
    const classified = ErrorHandler.fromResult(
      { error: "x", failure },
      "fallback"
    );
    expect(typeof classified).toBe("object");
    expect((classified as { kind: string }).kind).toBe("no-access");
    expect(ErrorHandler.fromResult({ error: "plain" }, "fallback")).toBe(
      "plain"
    );
    expect(ErrorHandler.fromResult({}, "fallback")).toBe("fallback");
  });
});

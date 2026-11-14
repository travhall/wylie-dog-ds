// What went wrong talking to GitHub, in words a person can act on.
//
// Errors used to reach the screen as strings and were sorted by looking for "404"
// or "401" inside the text, then shown with one generic tip list per type. The
// client knows the HTTP status and what it was reading; this keeps that. It turns
// a thrown error (an Octokit RequestError with `status` and response headers, or
// one of this plugin's own errors) into a failure with a kind, a message that
// names the repository, folder or file, and the one action that fixes it.

export type FailureKind =
  | "token-rejected"
  | "no-access"
  | "rate-limited"
  | "repo-not-found"
  | "folder-not-found"
  | "file-not-found"
  | "not-found"
  | "branch-moved"
  | "offline"
  | "bad-file"
  | "other";

/** The one thing the person can do about it. */
export type FailureAction = "new-token" | "edit-setup" | "retry" | "wait";

/** What the client was doing when it failed; decides what a 404 means. */
export type FailureStage = "repo" | "folder" | "file";

export interface FailureContext {
  stage?: FailureStage;
  /** owner/repo, for the message */
  repo?: string;
  branch?: string;
  folder?: string;
}

/** Plain data, so it can cross the iframe boundary and sit in UI state. */
export interface SyncFailure {
  kind: FailureKind;
  /** One or two sentences for the person. */
  message: string;
  action?: FailureAction;
  /** Rate limited: when GitHub allows requests again (ISO time). */
  retryAt?: string;
  status?: number;
  /** The original error text, for "technical details". */
  detail: string;
}

interface HttpLike {
  status?: number;
  message?: string;
  response?: { headers?: Record<string, string | number | undefined> };
}

const header = (e: HttpLike, name: string) => {
  const value = e.response?.headers?.[name];
  return value === undefined ? undefined : String(value);
};

const where = (c: FailureContext) => c.repo ?? "the repository";

function statusOf(error: HttpLike, message: string): number | undefined {
  if (typeof error.status === "number") return error.status;
  const match = /\bHTTP (\d{3})\b/.exec(message);
  return match ? Number(match[1]) : undefined;
}

/** When a rate-limited request may be retried, from GitHub's response headers. */
function retryTime(error: HttpLike, now: number): string | undefined {
  const after = header(error, "retry-after");
  if (after && Number.isFinite(Number(after))) {
    return new Date(now + Number(after) * 1000).toISOString();
  }
  const reset = header(error, "x-ratelimit-reset");
  if (reset && Number.isFinite(Number(reset))) {
    return new Date(Number(reset) * 1000).toISOString();
  }
  return undefined;
}

export function formatClock(iso: string, locale?: string): string {
  return new Date(iso).toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function classifyFailure(
  error: unknown,
  context: FailureContext = {},
  now: number = Date.now()
): SyncFailure {
  const e = (typeof error === "object" && error ? error : {}) as HttpLike;
  const detail =
    error instanceof Error ? error.message : (e.message ?? String(error));
  const status = statusOf(e, detail);
  const base = { detail, ...(status !== undefined && { status }) };

  // GitHub says so in the text when the headers are not at hand
  const limited =
    (status === 429 ||
      (status === 403 &&
        (header(e, "x-ratelimit-remaining") === "0" ||
          /rate limit/i.test(detail)))) &&
    true;
  if (limited) {
    const retryAt = retryTime(e, now);
    return {
      kind: "rate-limited",
      message: retryAt
        ? `GitHub's rate limit was reached. Try again at ${formatClock(retryAt)}.`
        : "GitHub's rate limit was reached. Wait a few minutes, then try again.",
      action: "wait",
      ...(retryAt && { retryAt }),
      ...base,
    };
  }

  if (status === 401 || /bad credentials/i.test(detail)) {
    return {
      kind: "token-rejected",
      message:
        "GitHub rejected your access token. It may have expired or been revoked.",
      action: "new-token",
      ...base,
    };
  }

  if (status === 403) {
    return {
      kind: "no-access",
      message: `Your token can't do this on ${where(context)}. For a private repository it needs access to it: a classic token needs the repo scope, a fine-grained token needs this repository selected with Contents read and write.`,
      action: "new-token",
      ...base,
    };
  }

  if (/is not a directory in the repository/i.test(detail)) {
    return folderMissing(context, base);
  }

  if (/not found or no access/i.test(detail)) {
    return repoMissing(context, base);
  }

  if (status === 404) {
    switch (context.stage) {
      case "repo":
        return repoMissing(context, base);
      case "folder":
        return folderMissing(context, base);
      case "file": {
        const file = /fetch (\S+?):/i.exec(detail)?.[1];
        return {
          kind: "file-not-found",
          message: file
            ? `${where(context)} has no file ${file}${context.branch ? ` on ${context.branch}` : ""}.`
            : `A token file is missing from ${where(context)}.`,
          action: "edit-setup",
          ...base,
        };
      }
      default:
        return {
          kind: "not-found",
          message: `GitHub could not find the repository, branch or token folder${context.repo ? ` in ${context.repo}` : ""}. Check them in the setup.`,
          action: "edit-setup",
          ...base,
        };
    }
  }

  if (
    status === 409 ||
    status === 422 ||
    /new commits since sync started|not a fast forward/i.test(detail)
  ) {
    return {
      kind: "branch-moved",
      message:
        "The branch changed while you were syncing. Nothing was lost. Try again.",
      action: "retry",
      ...base,
    };
  }

  // A file that could not be parsed. Only phrases that say so: a bare "json"
  // also appears in file names ("network error updating spacing.json").
  if (
    /failed to parse|is not valid json|unexpected token[^]*in json|in json at position|JSON\.parse/i.test(
      detail
    )
  ) {
    const file =
      /parse (\S+?):/i.exec(detail)?.[1] ??
      /^(\S+?)(?: in the repository)? is not valid JSON/i.exec(detail)?.[1];
    return {
      kind: "bad-file",
      message: file
        ? `${file} isn't valid JSON, so it can't be read. Fix it in the repository and try again.`
        : "A token file isn't valid JSON, so it can't be read. Fix it in the repository and try again.",
      ...base,
    };
  }

  // No HTTP status at all: the request never got an answer
  if (
    status === undefined &&
    (error instanceof TypeError ||
      /failed to fetch|networkerror|network request failed|load failed|offline/i.test(
        detail
      ))
  ) {
    return {
      kind: "offline",
      message: "Can't reach GitHub. Check your connection, then try again.",
      action: "retry",
      ...base,
    };
  }

  return {
    kind: "other",
    message: detail || "Something went wrong talking to GitHub.",
    action: "retry",
    ...base,
  };
}

function repoMissing(
  context: FailureContext,
  base: { detail: string; status?: number }
): SyncFailure {
  return {
    kind: "repo-not-found",
    message: `GitHub can't find ${where(context)}. Check the owner and name, and that your token can see it.`,
    action: "edit-setup",
    ...base,
  };
}

function folderMissing(
  context: FailureContext,
  base: { detail: string; status?: number }
): SyncFailure {
  const folder = context.folder ? `"${context.folder}"` : "The token folder";
  return {
    kind: "folder-not-found",
    message: `${folder} is not in ${where(context)}${context.branch ? ` on ${context.branch}` : ""}. Change the token folder in the setup.`,
    action: "edit-setup",
    ...base,
  };
}

/**
 * An error that carries its classification. Its `message` stays the original
 * text, so code that reads messages is unchanged; the UI reads `failure`.
 */
export class SyncFailureError extends Error {
  readonly failure: SyncFailure;
  constructor(failure: SyncFailure) {
    super(failure.detail);
    this.name = "SyncFailureError";
    this.failure = failure;
    Object.setPrototypeOf(this, SyncFailureError.prototype);
  }
}

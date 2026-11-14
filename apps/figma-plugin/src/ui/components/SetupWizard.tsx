import { conventionsFor } from "../../plugin/conventions";
import { findTokenFolder, type TokenFolder } from "../utils/find-token-folder";
import {
  describeRepositoryStatus,
  parseRepositoryInput,
} from "../utils/repository-input";
import { h } from "preact";
import { useState, useEffect, useRef } from "preact/hooks";
import { Icon } from "./common/Icon";
import type { GitHubConfig, SyncMode } from "../../shared/types";

interface SetupWizardProps {
  onComplete: (config: GitHubConfig) => void;
  onClose: () => void;
  initialConfig?: GitHubConfig | null; // Pre-populate for editing existing config
}

interface StepProps {
  onNext: (data: Partial<GitHubConfig>) => void;
  onBack: () => void;
  data: Partial<GitHubConfig>;
  isFirst: boolean;
  isLast: boolean;
}

// Step 1: Access Token
function AccessTokenStep({ onNext, data, isFirst }: StepProps) {
  const [accessToken, setAccessToken] = useState(data.accessToken || "");
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    error?: string;
    login?: string;
  } | null>(null);

  const validateToken = async (token: string) => {
    if (!token.trim()) return;

    setIsValidating(true);
    try {
      const response = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setValidationResult({ valid: true, login: data.login });
        return true;
      } else if (response.status === 401) {
        setValidationResult({
          valid: false,
          error:
            "That token is invalid or expired. Create a new one and paste it here.",
        });
        return false;
      } else if (response.status === 403) {
        setValidationResult({
          valid: false,
          error:
            'Token accepted, but it\'s missing repo access. Give it the "repo" scope (classic) or Contents: Read and write (fine-grained).',
        });
        return false;
      } else {
        setValidationResult({
          valid: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
        });
        return false;
      }
    } catch (error) {
      setValidationResult({
        valid: false,
        error: "Couldn't reach GitHub. Check your connection and try again.",
      });
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const handleNext = async () => {
    if (await validateToken(accessToken)) {
      onNext({ accessToken });
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "var(--space-4)" }}>
        <h3
          style={{
            margin: "0 0 var(--space-2) 0",
            fontSize: "var(--font-size-md)",
            fontWeight: "var(--font-weight-bold)",
          }}
        >
          GitHub Access Token
        </h3>
        <p
          style={{
            margin: "0",
            fontSize: "var(--font-size-sm)",
            color: "var(--text-secondary)",
            lineHeight: "var(--line-height-relaxed)",
          }}
        >
          Token Bridge needs a GitHub token that can read and write the files in
          one repository.
        </p>
        <ol
          style={{
            margin: "var(--space-2) 0 0 0",
            paddingLeft: "var(--space-4)",
            fontSize: "var(--font-size-sm)",
            color: "var(--text-secondary)",
            lineHeight: "var(--line-height-relaxed)",
          }}
        >
          <li>
            <a
              href="https://github.com/settings/personal-access-tokens/new?name=Token%20Bridge&description=Figma%20plugin%20for%20design%20tokens&contents=write"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--accent-primary)", textDecoration: "none" }}
              aria-label="Create a fine-grained token (opens in new tab)"
            >
              Create a fine-grained token →
            </a>
          </li>
          <li>
            Under "Repository access", choose "Only select repositories" and
            pick your token repository.
          </li>
          <li>
            Under "Repository permissions", set Contents to "Read and write".
          </li>
          <li>Generate the token, copy it and paste it below.</li>
        </ol>
        <p
          style={{
            margin: "var(--space-2) 0 0 0",
            fontSize: "var(--font-size-xs)",
            color: "var(--text-tertiary)",
            lineHeight: "var(--line-height-relaxed)",
          }}
        >
          Prefer a classic token?{" "}
          <a
            href="https://github.com/settings/tokens/new?scopes=repo&description=Token%20Bridge"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--accent-primary)", textDecoration: "none" }}
            aria-label="Create a classic token (opens in new tab)"
          >
            Create one
          </a>{" "}
          with the "repo" scope. It can reach every repository you can, so a
          fine-grained token is the safer choice.
        </p>
      </div>

      <div style={{ marginBottom: "var(--space-4)" }}>
        <label
          htmlFor="access-token-input"
          style={{
            display: "block",
            fontSize: "var(--font-size-sm)",
            fontWeight: "var(--font-weight-bold)",
            marginBottom: "var(--space-1)",
          }}
        >
          Access Token
        </label>
        <input
          id="access-token-input"
          type="password"
          value={accessToken}
          onChange={(e) => {
            setAccessToken(e.currentTarget.value);
            setValidationResult(null);
          }}
          placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
          aria-invalid={validationResult ? !validationResult.valid : undefined}
          aria-describedby={
            validationResult ? "token-validation-msg" : undefined
          }
          style={{
            width: "100%",
            padding: "var(--space-2) var(--space-3)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-sm)",
            fontSize: "var(--font-size-sm)",
            fontFamily: "monospace",
          }}
        />

        {validationResult && (
          <div
            id="token-validation-msg"
            role="alert"
            style={{
              marginTop: "var(--space-1)",
              fontSize: "var(--font-size-xs)",
              color: validationResult.valid ? "var(--success)" : "var(--error)",
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-1)",
              }}
            >
              <Icon
                name={validationResult.valid ? "check" : "close"}
                size={12}
                color={
                  validationResult.valid ? "var(--success)" : "var(--error)"
                }
              />
              {validationResult.valid
                ? validationResult.login
                  ? `Connected as ${validationResult.login}`
                  : "Token is valid"
                : validationResult.error}
            </span>
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          gap: "var(--space-2)",
          justifyContent: "flex-end",
        }}
      >
        <button
          onClick={handleNext}
          disabled={!accessToken.trim() || isValidating}
          aria-busy={isValidating}
          style={{
            padding: "var(--space-2) var(--space-4)",
            backgroundColor:
              !accessToken.trim() || isValidating
                ? "var(--surface-tertiary)"
                : "var(--accent-primary)",
            color: "var(--text-inverse)",
            border: "none",
            borderRadius: "var(--radius-sm)",
            cursor:
              !accessToken.trim() || isValidating ? "not-allowed" : "pointer",
            fontSize: "var(--font-size-base)",
            fontWeight: "var(--font-weight-bold)",
          }}
        >
          {isValidating ? "Validating..." : "Next →"}
        </button>
      </div>
    </div>
  );
}

// Step 2: Repository Selection
function RepositoryStep({ onNext, onBack, data }: StepProps) {
  const [owner, setOwner] = useState(data.owner || "");
  const [repo, setRepo] = useState(data.repo || "");
  const [branch, setBranch] = useState(data.branch || "main");
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    error?: string;
  } | null>(null);
  const [suggestedRepos, setSuggestedRepos] = useState<
    Array<{ name: string; full_name: string; private: boolean }>
  >([]);

  useEffect(() => {
    // Offer the user's recent repositories whenever there is a token. (Not only
    // when Owner is empty: editing a saved setup fills Owner in, and the list
    // used to stay hidden then.)
    if (data.accessToken) {
      fetchUserRepos();
    }
  }, [data.accessToken]);

  const fetchUserRepos = async () => {
    try {
      const response = await fetch(
        "https://api.github.com/user/repos?sort=updated&per_page=10",
        {
          headers: {
            Authorization: `Bearer ${data.accessToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );

      if (response.ok) {
        const repos = await response.json();
        setSuggestedRepos(repos);
      }
    } catch (error) {
      console.warn("Failed to fetch repositories:", error);
    }
  };

  // A pasted owner/repo or web address in either box becomes Owner and Repository
  const applyPastedRepository = (text: string): boolean => {
    const parsed = parseRepositoryInput(text);
    if (!parsed) return false;
    setOwner(parsed.owner);
    setRepo(parsed.repo);
    if (parsed.branch) setBranch(parsed.branch);
    setValidationResult(null);
    return true;
  };

  const validateRepository = async () => {
    // The boxes may still hold a pasted address (typed, not yet split)
    const pasted = parseRepositoryInput(repo);
    const checkOwner = (pasted?.owner ?? owner).trim();
    const checkRepo = (pasted?.repo ?? repo).trim();
    if (pasted) {
      setOwner(pasted.owner);
      setRepo(pasted.repo);
      if (pasted.branch) setBranch(pasted.branch);
    }
    if (!checkOwner || !checkRepo) return;

    setIsValidating(true);
    try {
      const response = await fetch(
        `https://api.github.com/repos/${checkOwner}/${checkRepo}`,
        {
          headers: {
            Authorization: `Bearer ${data.accessToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );

      if (response.ok) {
        const repoData = await response.json();
        setValidationResult({ valid: true });
        setBranch(pasted?.branch || branch || repoData.default_branch);
        return true;
      } else {
        setValidationResult({
          valid: false,
          error: describeRepositoryStatus(response.status),
        });
        return false;
      }
    } catch (error) {
      console.error("Repository check failed:", error);
      setValidationResult({
        valid: false,
        error: `Could not reach GitHub (${error instanceof Error ? error.message : String(error)}). Check your connection, then try again.`,
      });
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const handleNext = async () => {
    if (await validateRepository()) {
      // Use what was checked: a pasted address was split into owner and name
      const pasted = parseRepositoryInput(repo);
      onNext({
        owner: pasted?.owner ?? owner,
        repo: pasted?.repo ?? repo,
        branch: pasted?.branch ?? branch,
      });
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "var(--space-4)" }}>
        <h3
          style={{
            margin: "0 0 var(--space-2) 0",
            fontSize: "var(--font-size-md)",
            fontWeight: "var(--font-weight-bold)",
          }}
        >
          Repository Selection
        </h3>
        <p
          style={{
            margin: "0",
            fontSize: "var(--font-size-sm)",
            color: "var(--text-secondary)",
            lineHeight: "var(--line-height-relaxed)",
          }}
        >
          Choose the GitHub repository where you want to store your design
          tokens.
        </p>
      </div>

      {/* Suggested repositories */}
      {suggestedRepos.length > 0 && (
        <div style={{ marginBottom: "var(--space-4)" }}>
          <label
            id="recent-repos-label"
            style={{
              display: "block",
              fontSize: "var(--font-size-base)",
              fontWeight: "var(--font-weight-bold)",
              marginBottom: "var(--space-2)",
            }}
          >
            Recent Repositories
          </label>
          <div
            role="listbox"
            aria-labelledby="recent-repos-label"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-1)",
              maxHeight: "120px",
              overflowY: "auto",
            }}
          >
            {suggestedRepos.slice(0, 5).map((suggestedRepo) => {
              const isSelected = `${owner}/${repo}` === suggestedRepo.full_name;
              return (
                <button
                  key={suggestedRepo.full_name}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    const [repoOwner, repoName] =
                      suggestedRepo.full_name.split("/");
                    setOwner(repoOwner);
                    setRepo(repoName);
                    setValidationResult(null);
                  }}
                  style={{
                    padding: "var(--space-2) var(--space-3)",
                    backgroundColor: isSelected
                      ? "var(--info-light)"
                      : "var(--surface-secondary)",
                    border: `1px solid ${isSelected ? "var(--accent-secondary)" : "var(--border-default)"}`,
                    borderRadius: "var(--radius-sm)",
                    cursor: "pointer",
                    fontSize: "var(--font-size-sm)",
                    textAlign: "left",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>{suggestedRepo.full_name}</span>
                  {suggestedRepo.private && (
                    <span
                      aria-label="Private repository"
                      style={{
                        fontSize: "var(--font-size-xs)",
                        backgroundColor: "var(--surface-tertiary)",
                        padding: "2px var(--space-1)",
                        borderRadius: "var(--radius-sm)",
                      }}
                    >
                      Private
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Manual repository input */}
      <div style={{ marginBottom: "var(--space-3)" }}>
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <div style={{ flex: 1 }}>
            <label
              htmlFor="owner-input"
              style={{
                display: "block",
                fontSize: "var(--font-size-base)",
                fontWeight: "var(--font-weight-bold)",
                marginBottom: "var(--space-1)",
              }}
            >
              Owner
            </label>
            <input
              id="owner-input"
              type="text"
              value={owner}
              onChange={(e) => {
                const text = e.currentTarget.value;
                if (applyPastedRepository(text)) return;
                setOwner(text);
                setValidationResult(null);
              }}
              placeholder="username"
              style={{
                width: "100%",
                padding: "var(--space-2) var(--space-3)",
                border: "1px solid var(--border-strong)",
                borderRadius: "var(--radius-sm)",
                fontSize: "var(--font-size-sm)",
              }}
            />
          </div>
          <div style={{ flex: 2 }}>
            <label
              htmlFor="repo-input"
              style={{
                display: "block",
                fontSize: "var(--font-size-base)",
                fontWeight: "var(--font-weight-bold)",
                marginBottom: "var(--space-1)",
              }}
            >
              Repository
            </label>
            <input
              id="repo-input"
              type="text"
              value={repo}
              onChange={(e) => {
                const text = e.currentTarget.value;
                if (applyPastedRepository(text)) return;
                setRepo(text);
                setValidationResult(null);
              }}
              placeholder="repository-name"
              style={{
                width: "100%",
                padding: "var(--space-2) var(--space-3)",
                border: "1px solid var(--border-strong)",
                borderRadius: "var(--radius-sm)",
                fontSize: "var(--font-size-sm)",
              }}
            />
          </div>
        </div>
      </div>

      <div style={{ marginBottom: "var(--space-4)" }}>
        <label
          htmlFor="branch-input"
          style={{
            display: "block",
            fontSize: "var(--font-size-sm)",
            fontWeight: "var(--font-weight-bold)",
            marginBottom: "var(--space-1)",
          }}
        >
          Branch
        </label>
        <input
          id="branch-input"
          type="text"
          value={branch}
          onChange={(e) => setBranch(e.currentTarget.value)}
          placeholder="main"
          aria-invalid={validationResult ? !validationResult.valid : undefined}
          aria-describedby={
            validationResult ? "repo-validation-msg" : undefined
          }
          style={{
            width: "100%",
            padding: "var(--space-2) var(--space-3)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-sm)",
            fontSize: "var(--font-size-sm)",
          }}
        />

        {validationResult && (
          <div
            id="repo-validation-msg"
            role="alert"
            style={{
              marginTop: "var(--space-1)",
              fontSize: "var(--font-size-xs)",
              color: validationResult.valid ? "var(--success)" : "var(--error)",
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-1)",
              }}
            >
              <Icon
                name={validationResult.valid ? "check" : "close"}
                size={12}
                color={
                  validationResult.valid ? "var(--success)" : "var(--error)"
                }
              />
              {validationResult.valid
                ? "Repository is accessible"
                : validationResult.error}
            </span>
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          gap: "var(--space-2)",
          justifyContent: "space-between",
        }}
      >
        <button
          onClick={onBack}
          style={{
            padding: "var(--space-2) var(--space-4)",
            backgroundColor: "var(--surface-secondary)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-sm)",
            cursor: "pointer",
            fontSize: "var(--font-size-sm)",
            transition: "var(--transition-base)",
          }}
        >
          ← Back
        </button>
        <button
          onClick={handleNext}
          disabled={
            !owner.trim() || !repo.trim() || !branch.trim() || isValidating
          }
          aria-busy={isValidating}
          style={{
            padding: "var(--space-2) var(--space-4)",
            backgroundColor:
              !owner.trim() || !repo.trim() || !branch.trim() || isValidating
                ? "var(--surface-tertiary)"
                : "var(--accent-primary)",
            color: "var(--text-inverse)",
            border: "none",
            borderRadius: "var(--radius-sm)",
            cursor:
              !owner.trim() || !repo.trim() || !branch.trim() || isValidating
                ? "not-allowed"
                : "pointer",
            fontSize: "var(--font-size-base)",
            fontWeight: "var(--font-weight-bold)",
          }}
        >
          {isValidating ? "Validating..." : "Next →"}
        </button>
      </div>
    </div>
  );
}

// Step 3: Configuration
function ConfigurationStep({ onNext, onBack, data, isLast }: StepProps) {
  const [tokenPath, setTokenPath] = useState(data.tokenPath || "tokens/");
  const [syncMode, setSyncMode] = useState<SyncMode>(
    data.syncMode || "pull-request"
  );
  // Wylie Dog's conventions: an explicit earlier choice, else what the folder implies
  const [wylieConventions, setWylieConventions] = useState(
    data.isWylieDogProject ??
      conventionsFor({ tokenPath: data.tokenPath || "" }) === "wylie-dog"
  );
  const [search, setSearch] = useState<
    | { status: "looking" }
    | { status: "failed" }
    | { status: "done"; folder: TokenFolder }
  >({ status: "looking" });
  // What the person typed or ticked is never overwritten by a late answer
  const pathTouched = useRef(false);
  const conventionsTouched = useRef(false);

  useEffect(() => {
    if (!data.owner || !data.repo || !data.branch || !data.accessToken) {
      setSearch({ status: "failed" });
      return;
    }
    let cancelled = false;
    findTokenFolder(
      {
        owner: data.owner,
        repo: data.repo,
        branch: data.branch,
        token: data.accessToken,
      },
      data.tokenPath
    ).then((folder) => {
      if (cancelled) return;
      if (!folder) {
        setSearch({ status: "failed" });
        return;
      }
      setSearch({ status: "done", folder });
      if (!pathTouched.current) setTokenPath(folder.path);
      if (!conventionsTouched.current && data.isWylieDogProject === undefined) {
        setWylieConventions(
          conventionsFor({ tokenPath: folder.path }) === "wylie-dog"
        );
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleNext = () => {
    onNext({ tokenPath, syncMode, isWylieDogProject: wylieConventions });
  };

  const searchMessage = (() => {
    if (search.status === "looking") return "Looking for token files…";
    if (search.status === "failed") {
      return "Could not look inside the repository. Enter the folder by hand.";
    }
    const { path, found, tokenFiles } = search.folder;
    const files = `${tokenFiles} token file${tokenFiles === 1 ? "" : "s"}`;
    switch (found) {
      case "current":
        return tokenFiles > 0
          ? `Found ${files} in "${path}".`
          : `Found token files in "${path}".`;
      case "resolver":
        return `Found tokens.resolver.json and ${files} in "${path}", and filled it in below.`;
      case "known-folder":
        return `Found ${files} in "${path}" and filled it in below.`;
      default:
        return `No token files in this repository yet. They will be created in "${path}"; change it to use another folder.`;
    }
  })();

  return (
    <div>
      <div style={{ marginBottom: "var(--space-4)" }}>
        <h3
          style={{
            margin: "0 0 var(--space-2) 0",
            fontSize: "var(--font-size-md)",
            fontWeight: "var(--font-weight-bold)",
          }}
        >
          Configuration
        </h3>
        <p
          style={{
            margin: "0",
            fontSize: "var(--font-size-sm)",
            color: "var(--text-secondary)",
            lineHeight: "var(--line-height-relaxed)",
          }}
        >
          Configure how tokens will be stored and synchronized.
        </p>
      </div>

      <div style={{ marginBottom: "var(--space-4)" }}>
        <label
          htmlFor="token-path-input"
          style={{
            display: "block",
            fontSize: "var(--font-size-sm)",
            fontWeight: "var(--font-weight-bold)",
            marginBottom: "var(--space-1)",
          }}
        >
          Token Storage Path
        </label>
        <input
          id="token-path-input"
          type="text"
          value={tokenPath}
          onChange={(e) => {
            pathTouched.current = true;
            setTokenPath(e.currentTarget.value);
          }}
          placeholder="tokens/"
          aria-describedby="path-hint path-search"
          style={{
            width: "100%",
            padding: "var(--space-2) var(--space-3)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-sm)",
            fontSize: "var(--font-size-sm)",
          }}
        />
        <div
          id="path-hint"
          style={{
            fontSize: "var(--font-size-xs)",
            color: "var(--text-secondary)",
            marginTop: "2px",
          }}
        >
          Directory path where token files will be stored (e.g., "tokens/",
          "design-system/tokens/")
        </div>
        <div
          id="path-search"
          role="status"
          style={{
            fontSize: "var(--font-size-xs)",
            color: "var(--text-secondary)",
            marginTop: "2px",
          }}
        >
          {searchMessage}
        </div>
      </div>

      <div style={{ marginBottom: "var(--space-4)" }}>
        <label
          style={{
            display: "flex",
            alignItems: "flex-start",
            cursor: "pointer",
            gap: "var(--space-2)",
          }}
        >
          <input
            type="checkbox"
            checked={wylieConventions}
            onChange={(e) => {
              conventionsTouched.current = true;
              setWylieConventions(e.currentTarget.checked);
            }}
            style={{ marginTop: "2px" }}
          />
          <div>
            <div
              style={{
                fontSize: "var(--font-size-sm)",
                fontWeight: "var(--font-weight-bold)",
              }}
            >
              Use Wylie Dog conventions
            </div>
            <div
              style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--text-secondary)",
                lineHeight: "var(--line-height-relaxed)",
              }}
            >
              Sets Figma variable scopes from token names, and hides the
              primitive and components collections from publishing. Leave it off
              for any other project.
            </div>
          </div>
        </label>
      </div>

      <div style={{ marginBottom: "var(--space-4)" }}>
        <label
          id="sync-mode-label"
          style={{
            display: "block",
            fontSize: "var(--font-size-base)",
            fontWeight: "var(--font-weight-bold)",
            marginBottom: "var(--space-2)",
          }}
        >
          Sync Mode
        </label>

        <div
          role="radiogroup"
          aria-labelledby="sync-mode-label"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-2)",
          }}
        >
          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              cursor: "pointer",
              gap: "var(--space-2)",
            }}
          >
            <input
              type="radio"
              name="syncMode"
              value="pull-request"
              checked={syncMode === "pull-request"}
              onChange={() => setSyncMode("pull-request")}
              style={{ marginTop: "2px" }}
            />
            <div>
              <div
                style={{
                  fontSize: "var(--font-size-sm)",
                  fontWeight: "var(--font-weight-bold)",
                }}
              >
                Pull Request Mode (Recommended)
              </div>
              <div
                style={{
                  fontSize: "var(--font-size-xs)",
                  color: "var(--text-secondary)",
                  lineHeight: "var(--line-height-relaxed)",
                }}
              >
                Each Push opens a pull request on GitHub. Review it there, then
                merge it. Safer for teams.
              </div>
            </div>
          </label>

          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              cursor: "pointer",
              gap: "var(--space-2)",
            }}
          >
            <input
              type="radio"
              name="syncMode"
              value="direct"
              checked={syncMode === "direct"}
              onChange={() => setSyncMode("direct")}
              style={{ marginTop: "2px" }}
            />
            <div>
              <div
                style={{
                  fontSize: "var(--font-size-sm)",
                  fontWeight: "var(--font-weight-bold)",
                }}
              >
                Direct Sync
              </div>
              <div
                style={{
                  fontSize: "var(--font-size-xs)",
                  color: "var(--text-secondary)",
                  lineHeight: "var(--line-height-relaxed)",
                }}
              >
                Each Push commits straight to the branch. Faster, with no review
                step.
              </div>
            </div>
          </label>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "var(--space-2)",
          justifyContent: "space-between",
        }}
      >
        <button
          onClick={onBack}
          style={{
            padding: "var(--space-2) var(--space-4)",
            backgroundColor: "var(--surface-secondary)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-sm)",
            cursor: "pointer",
            fontSize: "var(--font-size-sm)",
            transition: "var(--transition-base)",
          }}
        >
          ← Back
        </button>
        <button
          onClick={handleNext}
          disabled={!tokenPath.trim()}
          style={{
            padding: "var(--space-2) var(--space-4)",
            backgroundColor: !tokenPath.trim()
              ? "var(--surface-tertiary)"
              : "var(--success)",
            color: "var(--text-inverse)",
            border: "none",
            borderRadius: "var(--radius-sm)",
            cursor: !tokenPath.trim() ? "not-allowed" : "pointer",
            fontSize: "var(--font-size-base)",
            fontWeight: "var(--font-weight-bold)",
          }}
        >
          {isLast ? (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-1)",
              }}
            >
              Complete Setup
              <Icon name="check" size={14} color="var(--text-inverse)" />
            </span>
          ) : (
            "Next →"
          )}
        </button>
      </div>
    </div>
  );
}

export function SetupWizard({
  onComplete,
  onClose,
  initialConfig,
}: SetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [config, setConfig] = useState<Partial<GitHubConfig>>(
    initialConfig || {}
  );

  const steps = [
    { component: AccessTokenStep, title: "Access Token" },
    { component: RepositoryStep, title: "Repository" },
    { component: ConfigurationStep, title: "Configuration" },
  ];

  const handleNext = (stepData: Partial<GitHubConfig>) => {
    const newConfig = { ...config, ...stepData };
    setConfig(newConfig);

    if (currentStep === steps.length - 1) {
      onComplete(newConfig as GitHubConfig);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  // Inline rendering — fills its container naturally (no fixed overlay or modal shell)
  return (
    <div aria-labelledby="wizard-title">
      {/* Header */}
      <div
        style={{
          marginBottom: "var(--space-4)",
        }}
      >
        <h2
          id="wizard-title"
          style={{
            margin: "0 0 var(--space-1) 0",
            fontSize: "var(--font-size-md)",
            fontWeight: "var(--font-weight-bold)",
          }}
        >
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
            }}
          >
            <Icon name="github" size={16} color="var(--text-primary)" />
            GitHub Setup Wizard
          </span>
        </h2>
        <div
          aria-live="polite"
          style={{
            fontSize: "var(--font-size-xs)",
            color: "var(--text-secondary)",
          }}
        >
          Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
        </div>
      </div>

      {/* Progress indicator */}
      <div
        role="progressbar"
        aria-valuenow={currentStep + 1}
        aria-valuemin={1}
        aria-valuemax={steps.length}
        aria-label="Setup progress"
        style={{
          display: "flex",
          gap: "var(--space-1)",
          marginBottom: "var(--space-6)",
          justifyContent: "center",
        }}
      >
        {steps.map((_, index) => (
          <div
            key={index}
            style={{
              width: "40px",
              height: "4px",
              backgroundColor:
                index <= currentStep
                  ? "var(--accent-primary)"
                  : "var(--border-default)",
              borderRadius: "var(--radius-sm)",
              transition: "background-color 0.3s ease",
            }}
          />
        ))}
      </div>

      {/* Current step */}
      <CurrentStepComponent
        onNext={handleNext}
        onBack={handleBack}
        data={config}
        isFirst={currentStep === 0}
        isLast={currentStep === steps.length - 1}
      />
    </div>
  );
}

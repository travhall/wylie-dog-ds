import { h } from "preact";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/preact";
import { SetupWizard } from "../SetupWizard";
import type { GitHubConfig } from "../../../shared/types";

const TOKEN = "test-token-not-real";

type Reply = {
  ok: boolean;
  status?: number;
  statusText?: string;
  json?: unknown;
};

const reply = ({
  ok,
  status = ok ? 200 : 500,
  statusText = "",
  json = {},
}: Reply) => ({ ok, status, statusText, json: async () => json }) as Response;

const repos = [
  { name: "tokens", full_name: "acme/tokens", private: false },
  { name: "secret", full_name: "acme/secret", private: true },
];

/** Routes fetch by URL so each test only describes what differs. */
function stubFetch(routes: {
  user?: Reply | Error;
  repos?: Reply | Error;
  repo?: Reply | Error;
}) {
  const fn = vi.fn(async (url: string) => {
    const route = url.endsWith("/user")
      ? routes.user
      : url.includes("/user/repos")
        ? routes.repos
        : routes.repo;
    if (route instanceof Error) throw route;
    return reply(route ?? { ok: true });
  });
  vi.stubGlobal("fetch", fn);
  return fn;
}

const okUser: Reply = { ok: true, json: { login: "octocat" } };
const okRepo: Reply = { ok: true, json: { default_branch: "develop" } };
const noRepos: Reply = { ok: true, json: [] };

function setup(initialConfig?: GitHubConfig | null) {
  const onComplete = vi.fn();
  const onClose = vi.fn();
  render(
    <SetupWizard
      onComplete={onComplete}
      onClose={onClose}
      initialConfig={initialConfig}
    />
  );
  return { onComplete, onClose };
}

const type = (label: string | RegExp, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });

const next = () => screen.getByRole("button", { name: /Next|Validating/ });

async function toRepositoryStep() {
  type("Access Token", TOKEN);
  fireEvent.click(next());
  await screen.findByText("Repository Selection");
}

async function toConfigurationStep() {
  await toRepositoryStep();
  type("Owner", "acme");
  type("Repository", "tokens");
  fireEvent.click(next());
  await screen.findByText("Configuration");
}

const askedForRepos = (fetchMock: ReturnType<typeof stubFetch>) =>
  fetchMock.mock.calls.some(([url]) => String(url).includes("/user/repos"));

describe("SetupWizard", () => {
  beforeEach(() => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe("shell", () => {
    it("starts on step 1 with a progress bar", () => {
      stubFetch({});
      setup();
      expect(screen.getByText(/Step 1 of 3: Access Token/)).toBeInTheDocument();
      const bar = screen.getByRole("progressbar", { name: "Setup progress" });
      expect(bar).toHaveAttribute("aria-valuenow", "1");
      expect(bar).toHaveAttribute("aria-valuemax", "3");
    });
  });

  describe("step 1: access token", () => {
    it("keeps Next disabled until a non-blank token is entered", () => {
      stubFetch({});
      setup();
      expect(next()).toBeDisabled();
      type("Access Token", "   ");
      expect(next()).toBeDisabled();
      type("Access Token", TOKEN);
      expect(next()).toBeEnabled();
    });

    it("pre-fills the token when editing an existing configuration", () => {
      stubFetch({});
      setup({ accessToken: TOKEN } as GitHubConfig);
      expect(screen.getByLabelText("Access Token")).toHaveValue(TOKEN);
    });

    it("sends the token to GitHub and moves on when it is valid", async () => {
      const fetchMock = stubFetch({ user: okUser, repos: noRepos });
      setup();
      await toRepositoryStep();
      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.github.com/user",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${TOKEN}`,
          }),
        })
      );
      expect(screen.getByText(/Step 2 of 3: Repository/)).toBeInTheDocument();
      expect(screen.getByRole("progressbar")).toHaveAttribute(
        "aria-valuenow",
        "2"
      );
    });

    it("accepts a valid token that returns no login", async () => {
      stubFetch({ user: { ok: true, json: {} }, repos: noRepos });
      setup();
      await toRepositoryStep();
    });

    it("shows a busy state while validating", async () => {
      let finish: (r: Response) => void = () => {};
      vi.stubGlobal(
        "fetch",
        vi.fn(() => new Promise<Response>((resolve) => (finish = resolve)))
      );
      setup();
      type("Access Token", TOKEN);
      fireEvent.click(next());
      const busy = await screen.findByRole("button", { name: "Validating..." });
      expect(busy).toBeDisabled();
      expect(busy).toHaveAttribute("aria-busy", "true");
      finish(reply({ ok: false, status: 401 }));
      await screen.findByRole("alert");
    });

    it.each([
      [401, "", /invalid or expired/],
      [403, "", /missing repo access/],
      [502, "Bad Gateway", /HTTP 502: Bad Gateway/],
    ])(
      "explains a %s response and stays on the step",
      async (status, statusText, message) => {
        stubFetch({ user: { ok: false, status, statusText } });
        setup();
        type("Access Token", TOKEN);
        fireEvent.click(next());
        expect(await screen.findByRole("alert")).toHaveTextContent(message);
        expect(screen.getByLabelText("Access Token")).toHaveAttribute(
          "aria-invalid",
          "true"
        );
        expect(screen.getByText(/Step 1 of 3/)).toBeInTheDocument();
      }
    );

    it("explains a network failure", async () => {
      stubFetch({ user: new Error("offline") });
      setup();
      type("Access Token", TOKEN);
      fireEvent.click(next());
      expect(await screen.findByRole("alert")).toHaveTextContent(
        "Couldn't reach GitHub"
      );
    });

    it("clears the message when the token is edited", async () => {
      stubFetch({ user: { ok: false, status: 401 } });
      setup();
      type("Access Token", TOKEN);
      fireEvent.click(next());
      await screen.findByRole("alert");
      type("Access Token", `${TOKEN}2`);
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  describe("step 2: repository", () => {
    it("suggests recent repositories and fills the form when one is picked", async () => {
      const fetchMock = stubFetch({
        user: okUser,
        repos: { ok: true, json: repos },
      });
      setup();
      await toRepositoryStep();
      expect(await screen.findAllByRole("option")).toHaveLength(2);
      expect(askedForRepos(fetchMock)).toBe(true);
      expect(screen.getByLabelText("Private repository")).toBeInTheDocument();

      fireEvent.click(screen.getByRole("option", { name: /acme\/secret/ }));
      expect(screen.getByLabelText("Owner")).toHaveValue("acme");
      expect(screen.getByLabelText("Repository")).toHaveValue("secret");
      expect(
        screen.getByRole("option", { name: /acme\/secret/ })
      ).toHaveAttribute("aria-selected", "true");
      expect(
        screen.getByRole("option", { name: /acme\/tokens/ })
      ).toHaveAttribute("aria-selected", "false");
    });

    it("shows at most five suggestions", async () => {
      const many = Array.from({ length: 8 }, (_, i) => ({
        name: `r${i}`,
        full_name: `acme/r${i}`,
        private: false,
      }));
      stubFetch({ user: okUser, repos: { ok: true, json: many } });
      setup();
      await toRepositoryStep();
      expect(await screen.findAllByRole("option")).toHaveLength(5);
    });

    it("shows no suggestions when the list request fails", async () => {
      stubFetch({ user: okUser, repos: { ok: false, status: 500 } });
      setup();
      await toRepositoryStep();
      expect(screen.queryByRole("option")).not.toBeInTheDocument();
    });

    it("carries on when the list request throws", async () => {
      stubFetch({ user: okUser, repos: new Error("offline") });
      setup();
      await toRepositoryStep();
      await waitFor(() =>
        expect(console.warn).toHaveBeenCalledWith(
          "Failed to fetch repositories:",
          expect.any(Error)
        )
      );
    });

    it("does not look up suggestions when an owner is already set", async () => {
      const fetchMock = stubFetch({ user: okUser });
      setup({
        accessToken: TOKEN,
        owner: "acme",
        repo: "tokens",
      } as GitHubConfig);
      fireEvent.click(next());
      await screen.findByText("Repository Selection");
      expect(askedForRepos(fetchMock)).toBe(false);
      expect(screen.getByLabelText("Owner")).toHaveValue("acme");
    });

    it("needs owner, repository and branch before Next is enabled", async () => {
      stubFetch({ user: okUser, repos: noRepos });
      setup();
      await toRepositoryStep();
      expect(next()).toBeDisabled();
      type("Owner", "acme");
      expect(next()).toBeDisabled();
      type("Repository", "tokens");
      expect(next()).toBeEnabled();
      expect(screen.getByLabelText("Branch")).toHaveValue("main");
      type("Branch", "");
      expect(next()).toBeDisabled();
    });

    it("explains a repository that cannot be found, and clears the message on edit", async () => {
      stubFetch({
        user: okUser,
        repos: noRepos,
        repo: { ok: false, status: 404 },
      });
      setup();
      await toRepositoryStep();
      type("Owner", "acme");
      type("Repository", "nope");
      fireEvent.click(next());
      expect(await screen.findByRole("alert")).toHaveTextContent(
        "Repository not found or no access"
      );
      expect(screen.getByLabelText("Branch")).toHaveAttribute(
        "aria-invalid",
        "true"
      );
      type("Repository", "other");
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("clears the message when the owner is edited", async () => {
      stubFetch({
        user: okUser,
        repos: noRepos,
        repo: { ok: false, status: 404 },
      });
      setup();
      await toRepositoryStep();
      type("Owner", "acme");
      type("Repository", "nope");
      fireEvent.click(next());
      await screen.findByRole("alert");
      type("Owner", "someone");
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("explains a network failure while validating", async () => {
      stubFetch({
        user: okUser,
        repos: noRepos,
        repo: new Error("offline"),
      });
      setup();
      await toRepositoryStep();
      type("Owner", "acme");
      type("Repository", "tokens");
      fireEvent.click(next());
      expect(await screen.findByRole("alert")).toHaveTextContent(
        "Failed to validate repository"
      );
    });

    it("lets you go back and keeps the token", async () => {
      stubFetch({ user: okUser, repos: noRepos });
      setup();
      await toRepositoryStep();
      fireEvent.click(screen.getByText("← Back"));
      expect(screen.getByText(/Step 1 of 3/)).toBeInTheDocument();
      expect(screen.getByLabelText("Access Token")).toHaveValue(TOKEN);
    });
  });

  describe("step 3: configuration", () => {
    const stubAll = () =>
      stubFetch({ user: okUser, repos: noRepos, repo: okRepo });

    it("starts with the default path and pull-request mode", async () => {
      stubAll();
      setup();
      await toConfigurationStep();
      expect(
        screen.getByText(/Step 3 of 3: Configuration/)
      ).toBeInTheDocument();
      expect(screen.getByLabelText("Token Storage Path")).toHaveValue(
        "packages/tokens/io/sync/"
      );
      expect(
        screen.getByRole("radio", { name: /Pull Request Mode/ })
      ).toBeChecked();
      expect(
        screen.getByRole("radio", { name: /Direct Sync/ })
      ).not.toBeChecked();
    });

    it("completes with everything collected across the steps", async () => {
      stubAll();
      const { onComplete } = setup();
      await toConfigurationStep();
      type("Token Storage Path", "tokens/");
      fireEvent.click(screen.getByRole("radio", { name: /Direct Sync/ }));
      fireEvent.click(screen.getByRole("button", { name: /Complete Setup/ }));
      expect(onComplete).toHaveBeenCalledWith({
        accessToken: TOKEN,
        owner: "acme",
        repo: "tokens",
        branch: "main",
        tokenPath: "tokens/",
        syncMode: "direct",
      });
    });

    it("can switch back to pull-request mode", async () => {
      stubAll();
      const { onComplete } = setup();
      await toConfigurationStep();
      fireEvent.click(screen.getByRole("radio", { name: /Direct Sync/ }));
      fireEvent.click(screen.getByRole("radio", { name: /Pull Request Mode/ }));
      fireEvent.click(screen.getByRole("button", { name: /Complete Setup/ }));
      expect(onComplete).toHaveBeenCalledWith(
        expect.objectContaining({ syncMode: "pull-request" })
      );
    });

    it("blocks completion with an empty path", async () => {
      stubAll();
      setup();
      await toConfigurationStep();
      type("Token Storage Path", "  ");
      expect(
        screen.getByRole("button", { name: /Complete Setup/ })
      ).toBeDisabled();
    });

    it("pre-fills the path and mode when editing an existing configuration", async () => {
      stubAll();
      setup({
        accessToken: TOKEN,
        owner: "acme",
        repo: "tokens",
        branch: "main",
        tokenPath: "design/",
        syncMode: "direct",
      } as GitHubConfig);
      fireEvent.click(next());
      await screen.findByText("Repository Selection");
      fireEvent.click(next());
      await screen.findByText("Configuration");
      expect(screen.getByLabelText("Token Storage Path")).toHaveValue(
        "design/"
      );
      expect(screen.getByRole("radio", { name: /Direct Sync/ })).toBeChecked();
    });

    it("lets you go back to the repository step", async () => {
      stubAll();
      setup();
      await toConfigurationStep();
      fireEvent.click(screen.getByText("← Back"));
      expect(screen.getByText(/Step 2 of 3/)).toBeInTheDocument();
      expect(screen.getByLabelText("Owner")).toHaveValue("acme");
    });
  });
});

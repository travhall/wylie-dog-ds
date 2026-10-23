import Link from "next/link";
import { buttonVariants } from "@wyliedog/ui/button";
import { getShowcaseMeta } from "@/lib/showcase-metadata";
import { getColorModes } from "@/lib/token-values";

const PLUGIN_SOURCE_URL =
  "https://github.com/travhall/wylie-dog-ds/tree/main/apps/figma-plugin";

const SAMPLE_TOKENS = [
  "--color-background-default",
  "--color-foreground-default",
  "--color-background-primary",
  "--color-border-default",
  "--color-foreground-success-muted",
];

export default function PluginPage() {
  const meta = getShowcaseMeta();

  const steps = [
    {
      num: "01",
      label: "Install the plugin in Figma",
      desc: "Token Bridge is a Figma plugin. Build it from apps/figma-plugin, then in the Figma desktop app choose Plugins, Development, Import plugin from manifest, and select manifest.json.",
    },
    {
      num: "02",
      label: "Connect a GitHub repository",
      desc: "Enter the owner, repository, branch and the folder that holds the token files (here, packages/tokens/io/sync), plus a GitHub personal access token with the repo scope, or Contents read and write for a fine-grained token. The token is stored per Figma user and is never written into the file.",
    },
    {
      num: "03",
      label: "Pull tokens into Figma",
      desc: `Pull reads the token files from GitHub, or import a file from disk. The format is detected automatically and a summary is shown before anything changes. The ${meta.tokens.total.toLocaleString()} tokens become three variable collections: primitive, semantic and components.`,
    },
    {
      num: "04",
      label: "Edit variables in Figma",
      desc: "Designers work with the real token names. Semantic and component collections carry a Light and a Dark mode, matching the token files.",
    },
    {
      num: "05",
      label: "Push back to the repository",
      desc: "Select collections and push. In direct mode the files are committed to the configured branch; in pull-request mode they go to a new branch and a pull request opens. If the remote changed too, each conflict is shown and you keep the Figma value or take the GitHub value, one by one or in bulk.",
    },
  ];

  const collections = [
    {
      name: "primitive",
      file: "primitive.json",
      count: meta.tokens.primitive,
      modes: "Value",
      holds:
        "Raw values: color scales in OKLCH, spacing, type, radius, shadow and motion scales.",
    },
    {
      name: "semantic",
      file: "semantic.json",
      count: meta.tokens.semantic,
      modes: "Light, Dark",
      holds:
        "Role-based aliases such as background, text, border, interactive and status.",
    },
    {
      name: "components",
      file: "components.json",
      count: meta.tokens.component,
      modes: "Light, Dark",
      holds: "Component-scoped tokens that alias the semantic collection.",
    },
  ];

  const guards = [
    {
      title: "Unsupported variables are listed, not exported",
      desc: "Native EASING and TIMING variables, composed colors, and anything that aliases them cannot be exported yet. After an export or push, a notice lists what was skipped and why.",
    },
    {
      title: "Tokens stay out of the file",
      desc: "The GitHub token lives in Figma's per-user storage. The file's plugin data holds only the repository settings, so a shared or duplicated file does not carry a credential.",
    },
    {
      title: "Formats it can read",
      desc: "W3C DTCG, Tokens Studio, Style Dictionary (flat and nested) and the native format used by this repository. Export always writes the native format, one JSON file per collection.",
    },
    {
      title: "Narrow network access",
      desc: "The plugin manifest allows only api.github.com, raw.githubusercontent.com and Google Fonts.",
    },
  ];

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-(--color-border-default)">
        <div className="absolute inset-0 grid-bg opacity-60" />
        <div className="absolute inset-0 hero-gradient" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-28 lg:pb-32">
          <div className="grid md:grid-cols-12 gap-10 lg:gap-12 items-center">
            <div className="md:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-(--color-border-default) bg-(--color-background-default)/60 px-3 py-1">
                <span className="font-mono text-[11px] uppercase tracking-wider text-(--color-foreground-muted)">
                  05 · Token Bridge
                </span>
                <span className="text-(--color-foreground-faint)">·</span>
                <span className="font-mono text-[11px] uppercase tracking-wider text-(--color-foreground-faint)">
                  v{meta.versions.plugin} · development build
                </span>
              </div>

              <h1 className="mt-6 font-serif text-5xl sm:text-6xl lg:text-[4.5rem] font-semibold text-(--color-foreground-default) tracking-tight leading-[0.98]">
                Figma variables and{" "}
                <span
                  style={{ color: "var(--color-foreground-primary-muted)" }}
                >
                  the token files, in sync.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-lg text-(--color-foreground-muted)">
                Token Bridge is a Figma plugin that pulls the token files in{" "}
                <code className="font-mono text-base">@wyliedog/tokens</code>{" "}
                into Figma Variables and pushes your edits back to GitHub,
                either as a direct commit or as a pull request.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <a href="#how" className={buttonVariants({ size: "lg" })}>
                  How it works
                </a>
                <a
                  href={PLUGIN_SOURCE_URL}
                  className={buttonVariants({ variant: "outline", size: "lg" })}
                >
                  View the source
                </a>
              </div>
            </div>

            <div className="md:col-span-5">
              <div className="glass rounded-2xl p-5 sm:p-6">
                <p className="font-mono text-[10px] uppercase tracking-wider text-(--color-foreground-faint)">
                  Collections it syncs
                </p>
                <ul className="mt-3 space-y-2">
                  {collections.map((c) => (
                    <li
                      key={c.name}
                      className="flex items-center justify-between rounded-lg border border-(--color-border-default) bg-(--color-background-default) px-3 py-2"
                    >
                      <span className="font-mono text-xs text-(--color-foreground-default)">
                        {c.name}
                      </span>
                      <span className="font-mono text-[11px] text-(--color-foreground-faint)">
                        {c.count} tokens · {c.modes}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 font-mono text-[11px] text-(--color-foreground-faint)">
                  {meta.tokens.total.toLocaleString()} tokens total
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section
        id="how"
        className="border-b border-(--color-border-default) bg-(--color-background-muted)"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <p className="font-mono text-[11px] uppercase tracking-wider text-(--color-foreground-faint)">
            How it works
          </p>
          <h2 className="mt-2 font-serif text-3xl lg:text-4xl font-semibold text-(--color-foreground-default) tracking-tight">
            Five steps from the repository to Figma and back
          </h2>

          <ol className="mt-10 grid gap-4 md:grid-cols-2">
            {steps.map((step) => (
              <li
                key={step.num}
                className="rounded-xl border border-(--color-border-default) bg-(--color-background-default) p-5"
              >
                <span className="font-mono text-xs text-(--color-foreground-faint)">
                  {step.num}
                </span>
                <h3 className="mt-1 font-semibold text-(--color-foreground-default)">
                  {step.label}
                </h3>
                <p className="mt-2 text-sm text-(--color-foreground-muted) leading-relaxed">
                  {step.desc}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── What syncs ── */}
      <section className="border-b border-(--color-border-default)">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <p className="font-mono text-[11px] uppercase tracking-wider text-(--color-foreground-faint)">
            What syncs
          </p>
          <h2 className="mt-2 font-serif text-3xl lg:text-4xl font-semibold text-(--color-foreground-default) tracking-tight">
            Three files, three collections
          </h2>

          <div className="mt-8 overflow-x-auto rounded-xl border border-(--color-border-default)">
            <table className="w-full text-sm">
              <thead className="bg-(--color-background-muted) text-left">
                <tr>
                  <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-wider text-(--color-foreground-faint)">
                    File in packages/tokens/io/sync
                  </th>
                  <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-wider text-(--color-foreground-faint)">
                    Collection
                  </th>
                  <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-wider text-(--color-foreground-faint)">
                    Tokens
                  </th>
                  <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-wider text-(--color-foreground-faint)">
                    Modes
                  </th>
                  <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-wider text-(--color-foreground-faint)">
                    Holds
                  </th>
                </tr>
              </thead>
              <tbody>
                {collections.map((c) => (
                  <tr
                    key={c.name}
                    className="border-t border-(--color-border-default)"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-(--color-foreground-default)">
                      {c.file}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-(--color-foreground-default)">
                      {c.name}
                    </td>
                    <td className="px-4 py-3 text-(--color-foreground-muted)">
                      {c.count}
                    </td>
                    <td className="px-4 py-3 text-(--color-foreground-muted)">
                      {c.modes}
                    </td>
                    <td className="px-4 py-3 text-(--color-foreground-muted)">
                      {c.holds}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Light and dark values ── */}
      <section className="border-b border-(--color-border-default) bg-(--color-background-muted)">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <p className="font-mono text-[11px] uppercase tracking-wider text-(--color-foreground-faint)">
            Light and dark
          </p>
          <h2 className="mt-2 font-serif text-3xl lg:text-4xl font-semibold text-(--color-foreground-default) tracking-tight">
            Both modes live in the semantic collection
          </h2>
          <p className="mt-3 max-w-2xl text-(--color-foreground-muted)">
            These values are read from the built token CSS, so this table
            changes when the tokens do.
          </p>

          <div className="mt-8 overflow-x-auto rounded-xl border border-(--color-border-default) bg-(--color-background-default)">
            <table className="w-full text-sm">
              <thead className="text-left">
                <tr>
                  <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-wider text-(--color-foreground-faint)">
                    Token
                  </th>
                  <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-wider text-(--color-foreground-faint)">
                    Light
                  </th>
                  <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-wider text-(--color-foreground-faint)">
                    Dark
                  </th>
                </tr>
              </thead>
              <tbody>
                {SAMPLE_TOKENS.map((token) => {
                  const { light, dark } = getColorModes(token);
                  return (
                    <tr
                      key={token}
                      className="border-t border-(--color-border-default)"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-(--color-foreground-default)">
                        {token}
                      </td>
                      {[light, dark].map((value, i) => (
                        <td key={i} className="px-4 py-3">
                          <span className="inline-flex items-center gap-2">
                            <span
                              className="h-4 w-4 rounded border border-(--color-border-default)"
                              style={{ background: value }}
                            />
                            <span className="font-mono text-[11px] text-(--color-foreground-muted)">
                              {value}
                            </span>
                          </span>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Guardrails ── */}
      <section className="border-b border-(--color-border-default)">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <p className="font-mono text-[11px] uppercase tracking-wider text-(--color-foreground-faint)">
            Worth knowing
          </p>
          <h2 className="mt-2 font-serif text-3xl lg:text-4xl font-semibold text-(--color-foreground-default) tracking-tight">
            What it does and does not do
          </h2>

          <dl className="mt-8 grid gap-4 md:grid-cols-2">
            {guards.map((g) => (
              <div
                key={g.title}
                className="rounded-xl border border-(--color-border-default) bg-(--color-background-default) p-5"
              >
                <dt className="font-semibold text-(--color-foreground-default)">
                  {g.title}
                </dt>
                <dd className="mt-2 text-sm text-(--color-foreground-muted) leading-relaxed">
                  {g.desc}
                </dd>
              </div>
            ))}
          </dl>

          <p className="mt-8 max-w-2xl text-sm text-(--color-foreground-muted)">
            GitHub is the only supported provider, and a personal access token
            is the only sign-in method.
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24 text-center">
          <h2 className="font-serif text-3xl lg:text-4xl font-semibold text-(--color-foreground-default) tracking-tight">
            Keep design and code on the same tokens.
          </h2>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/tokens" className={buttonVariants({ size: "lg" })}>
              View token reference
            </Link>
            <a
              href={PLUGIN_SOURCE_URL}
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              View the source
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

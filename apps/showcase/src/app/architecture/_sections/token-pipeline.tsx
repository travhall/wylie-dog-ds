import manifest from "@wyliedog/tokens/manifest.json";
import { Button, buttonVariants } from "@wyliedog/ui/button";
import { Card } from "@wyliedog/ui/card";
import { getShowcaseMeta } from "@/lib/showcase-metadata";
import { describeAlias, getAlias, primitiveVar } from "@/lib/token-values";

export function TokenPipelineSection() {
  const meta = getShowcaseMeta();

  const primary = getAlias("color.background.primary");

  const primaryRamp = (
    manifest.primitives.colors as Record<
      string,
      Record<string, { value: string }>
    >
  )[primary.palette];

  return (
    <section className="border-b border-(--color-border-default) bg-(--color-background-muted)">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
        <div className="grid lg:grid-cols-12 gap-10 mb-10">
          <div className="lg:col-span-5">
            <span className="font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint)">
              Token pipeline
            </span>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-(--color-foreground-default)">
              From JSON to{" "}
              <span style={{ color: "var(--color-foreground-primary-muted)" }}>
                CSS variables
              </span>
              , in three tiers.
            </h2>
          </div>
          <div className="lg:col-span-7">
            <p className="text-(--color-foreground-muted) text-lg leading-relaxed">
              Source files describe the design intent in human terms. Style
              Dictionary expands them into raw values, role aliases, and
              component-specific surfaces — all emitted as a single{" "}
              <span className="font-mono text-sm">tokens.css</span> that
              Tailwind 4 reads at build time.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 lg:gap-4">
          {[
            {
              stage: "01 · source",
              path: "packages/tokens/io/sync/",
              title: "primitive.json (excerpt)",
              content: (
                <div className="mt-3 rounded-md border border-(--color-border-default) bg-(--color-background-default) p-3 font-mono text-xs leading-relaxed">
                  {[
                    { indent: 0, rest: "{" },
                    { indent: 1, key: "primitive", rest: ": {" },
                    { indent: 2, key: "variables", rest: ": {" },
                    {
                      indent: 3,
                      key: `color.${primary.palette}.${primary.step}`,
                      rest: ": {",
                    },
                    { indent: 4, key: "$type", rest: ': "color",' },
                    {
                      indent: 4,
                      key: "$value",
                      rest: `: "${primaryRamp[primary.step].value}"`,
                    },
                    { indent: 3, rest: "}" },
                    { indent: 2, rest: "}" },
                    { indent: 1, rest: "}" },
                    { indent: 0, rest: "}" },
                  ].map((line, i) => (
                    <div
                      key={i}
                      className="text-(--color-foreground-muted)"
                      style={{ paddingLeft: `${line.indent * 0.75}rem` }}
                    >
                      {line.key && (
                        <span
                          style={{
                            color: "var(--color-foreground-primary-muted)",
                          }}
                        >
                          &quot;{line.key}&quot;
                        </span>
                      )}
                      {line.rest}
                    </div>
                  ))}
                </div>
              ),
              footer: `${meta.tokens.primitive} primitive entries`,
            },
            {
              stage: "02 · transform",
              path: "style-dictionary.config.js",
              title: "build pipeline",
              content: (
                <ul className="mt-3 space-y-2 text-xs font-mono">
                  {[
                    "parse JSON refs",
                    "resolve alias chains",
                    "tokens-studio transforms",
                    "custom CSS formats",
                  ].map((step, i) => (
                    <li key={step} className="flex items-center gap-2">
                      <span
                        className="grid h-4 w-4 place-items-center rounded text-xs"
                        style={{
                          background:
                            "color-mix(in oklch, var(--color-background-primary) 18%, transparent)",
                          color: "var(--color-foreground-primary-muted)",
                        }}
                      >
                        {i + 1}
                      </span>
                      <span className="text-(--color-foreground-muted)">
                        {step}
                      </span>
                    </li>
                  ))}
                  <li className="mt-3 flex items-center gap-2 rounded-md border border-(--color-border-default) px-2 py-1.5">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{
                        background: "var(--color-foreground-success-muted)",
                      }}
                    />
                    <span className="text-(--color-foreground-muted)">
                      style-dictionary build
                    </span>
                  </li>
                </ul>
              ),
              footer: `${meta.tokens.total} vars emitted`,
            },
            {
              stage: "03 · output",
              path: "packages/tokens/dist/",
              title: "tokens.css",
              content: (
                <div className="mt-3 rounded-md border border-(--color-border-default) bg-(--color-background-default) p-3 font-mono text-xs leading-relaxed">
                  <div className="text-(--color-foreground-faint) italic">
                    {"/* primitive */"}
                  </div>
                  <div>
                    <span
                      style={{
                        color: "var(--color-foreground-primary-muted)",
                      }}
                    >
                      {primitiveVar(primary)}
                    </span>
                    <span className="text-(--color-foreground-muted)">
                      : {primaryRamp[primary.step].value};
                    </span>
                  </div>
                  <div className="mt-1 text-(--color-foreground-faint) italic">
                    {"/* semantic */"}
                  </div>
                  <div>
                    <span
                      style={{
                        color: "var(--color-foreground-primary-muted)",
                      }}
                    >
                      --color-background-primary
                    </span>
                    <span className="text-(--color-foreground-muted)">
                      :{" "}
                      {
                        manifest.semantics.background[
                          "color-background-primary"
                        ].value
                      }
                      ;
                    </span>
                  </div>
                  <div className="mt-1 text-(--color-foreground-faint) italic">
                    {"/* component */"}
                  </div>
                  <div>
                    <span
                      style={{
                        color: "var(--color-foreground-primary-muted)",
                      }}
                    >
                      --color-button-primary-background
                    </span>
                    <span className="text-(--color-foreground-muted)">
                      :{" "}
                      {
                        manifest.components.button["button-primary-background"]
                          .value
                      }
                      ;
                    </span>
                  </div>
                </div>
              ),
              footer: `${meta.tokens.primitive} primitive · ${meta.tokens.semantic} semantic · ${meta.tokens.component} component`,
            },
            {
              stage: "04 · consume",
              path: "JSX · Tailwind 4",
              title: "Button.tsx",
              content: (
                <div className="mt-3">
                  <div className="rounded-md border border-(--color-border-default) bg-(--color-background-default) p-3 font-mono text-xs leading-relaxed">
                    <div className="text-(--color-foreground-muted)">
                      {"<"}button
                    </div>
                    <div className="pl-3 text-(--color-foreground-muted)">
                      className=&quot;
                    </div>
                    <div
                      className="pl-6"
                      style={{
                        color: "var(--color-foreground-primary-muted)",
                      }}
                    >
                      bg-(--color-button-primary-background)
                    </div>
                    <div
                      className="pl-6"
                      style={{
                        color: "var(--color-foreground-primary-muted)",
                      }}
                    >
                      text-(--color-foreground-inverse)
                    </div>
                    <div className="pl-6 text-(--color-foreground-muted)">
                      px-4 h-10
                    </div>
                    <div className="pl-3 text-(--color-foreground-muted)">
                      &quot;&gt;
                    </div>
                    <div className="pl-3 text-(--color-foreground-muted)">
                      Save changes
                    </div>
                    <div className="text-(--color-foreground-muted)">
                      {"<"}/button&gt;
                    </div>
                  </div>
                  <div className="mt-2 rounded-md border border-(--color-border-default) bg-(--color-background-default) p-3">
                    <p className="font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint) mb-2">
                      render
                    </p>
                    <Button size="sm">Save changes</Button>
                  </div>
                </div>
              ),
              footer: null,
            },
          ].map((stage) => (
            <Card
              key={stage.stage}
              className="gap-0 relative rounded-xl p-5 pt-7 shadow-none"
            >
              <div className="absolute -top-2.5 left-4 px-2 py-0.5 bg-(--color-background-default) border border-(--color-border-default) rounded-full font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint)">
                {stage.stage}
              </div>
              <span className="font-mono text-xs leading-6 text-(--color-foreground-faint)">
                {stage.path}
              </span>
              <h3 className="mt-1 font-semibold text-sm text-(--color-foreground-default)">
                {stage.title}
              </h3>
              {stage.content}
              {stage.footer && (
                <div className="mt-3 flex items-center gap-2 text-xs font-mono text-(--color-foreground-faint)">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  </svg>
                  {stage.footer}
                </div>
              )}
            </Card>
          ))}
        </div>

        <div className="mt-10 grid lg:grid-cols-3 gap-6">
          {[
            [
              "Tier 1 · primitive",
              `Raw OKLCH ramps. ${primitiveVar(primary)} doesn't know what it'll be used for — it just is.`,
            ],
            [
              "Tier 2 · semantic",
              `Role aliases. --color-background-primary maps to ${describeAlias("color.background.primary")}, and re-resolves under any future theme.`,
            ],
            [
              "Tier 3 · component",
              "Surface-specific. --color-button-primary-background points at the semantic role — never at the primitive directly.",
            ],
          ].map(([label, desc]) => (
            <div key={label}>
              <p className="font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint)">
                {label}
              </p>
              <p className="mt-2 text-sm text-(--color-foreground-muted) leading-relaxed">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

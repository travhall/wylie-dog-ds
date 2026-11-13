import { Card } from "@wyliedog/ui/card";
import { getShowcaseMeta } from "@/lib/showcase-metadata";

export function ComponentLayerSection() {
  const meta = getShowcaseMeta();

  return (
    <section className="border-b border-(--color-border-default) bg-(--color-background-muted)">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
        <div className="grid lg:grid-cols-12 gap-10 mb-12">
          <div className="lg:col-span-5">
            <span className="font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint)">
              Component layer
            </span>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-(--color-foreground-default)">
              Every component, the same five layers.
            </h2>
          </div>
          <div className="lg:col-span-7">
            <p className="text-(--color-foreground-muted) text-lg leading-relaxed">
              No bespoke component shapes. Components in{" "}
              <span className="font-mono text-sm">@wyliedog/ui</span> are{" "}
              <span className="font-mono text-sm">forwardRef</span> wrappers,
              {` ${meta.stack.radixBackedComponents} of them around a Radix primitive`}
              , with CVA driving variants, Tailwind classes backed by tokens,
              and an <span className="font-mono text-sm">asChild</span> escape
              hatch through Slot where it applies. The excerpt below is
              simplified.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Code panel */}
          <div className="lg:col-span-7">
            <div
              className="dark rounded-xl overflow-hidden border border-(--color-border-default) shadow-sm"
              style={{
                background: "var(--color-background-default)",
                color: "var(--color-foreground-default)",
              }}
            >
              <div
                className="flex items-center gap-2 px-4 py-2.5 border-b"
                style={{
                  background: "var(--color-background-muted)",
                  borderColor: "var(--color-border-default)",
                }}
              >
                <div className="flex gap-1.5">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: "var(--color-background-danger)" }}
                  />
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: "var(--color-background-warning)" }}
                  />
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: "var(--color-background-success)" }}
                  />
                </div>
                <span
                  className="ml-2 font-mono text-xs"
                  style={{ color: "var(--color-foreground-faint)" }}
                >
                  Button.tsx
                </span>
              </div>
              <div className="px-4 py-4 font-mono text-xs leading-[1.8] overflow-x-auto">
                <div>
                  <span style={{ color: "var(--color-foreground-link)" }}>
                    import
                  </span>{" "}
                  <span style={{ color: "var(--color-foreground-default)" }}>
                    {"{ forwardRef }"}
                  </span>{" "}
                  <span style={{ color: "var(--color-foreground-link)" }}>
                    from
                  </span>{" "}
                  <span
                    style={{ color: "var(--color-foreground-success-muted)" }}
                  >
                    &quot;react&quot;
                  </span>
                </div>
                <div>
                  <span style={{ color: "var(--color-foreground-link)" }}>
                    import
                  </span>{" "}
                  <span style={{ color: "var(--color-foreground-default)" }}>
                    {"{ Slot }"}
                  </span>{" "}
                  <span style={{ color: "var(--color-foreground-link)" }}>
                    from
                  </span>{" "}
                  <span
                    style={{ color: "var(--color-foreground-success-muted)" }}
                  >
                    &quot;@radix-ui/react-slot&quot;
                  </span>
                </div>
                <div>
                  <span style={{ color: "var(--color-foreground-link)" }}>
                    import
                  </span>{" "}
                  <span style={{ color: "var(--color-foreground-default)" }}>
                    {"{ cva, type VariantProps }"}
                  </span>{" "}
                  <span style={{ color: "var(--color-foreground-link)" }}>
                    from
                  </span>{" "}
                  <span
                    style={{ color: "var(--color-foreground-success-muted)" }}
                  >
                    &quot;class-variance-authority&quot;
                  </span>
                </div>
                <div>
                  <span style={{ color: "var(--color-foreground-link)" }}>
                    import
                  </span>{" "}
                  <span style={{ color: "var(--color-foreground-default)" }}>
                    {"{ cn }"}
                  </span>{" "}
                  <span style={{ color: "var(--color-foreground-link)" }}>
                    from
                  </span>{" "}
                  <span
                    style={{ color: "var(--color-foreground-success-muted)" }}
                  >
                    &quot;./lib/utils&quot;
                  </span>
                </div>
                <div className="mt-3">
                  <span style={{ color: "var(--color-foreground-link)" }}>
                    const
                  </span>{" "}
                  <span
                    style={{ color: "var(--color-foreground-warning-muted)" }}
                  >
                    buttonVariants
                  </span>{" "}
                  <span style={{ color: "var(--color-foreground-default)" }}>
                    =
                  </span>{" "}
                  <span style={{ color: "var(--color-foreground-link)" }}>
                    cva
                  </span>
                  <span style={{ color: "var(--color-foreground-default)" }}>
                    (
                  </span>
                </div>
                <div className="pl-4">
                  <span
                    style={{ color: "var(--color-foreground-success-muted)" }}
                  >
                    &quot;inline-flex items-center justify-center rounded-md
                    font-medium&quot;
                  </span>
                  <span style={{ color: "var(--color-foreground-default)" }}>
                    ,
                  </span>
                </div>
                <div className="pl-4">
                  <span style={{ color: "var(--color-foreground-default)" }}>
                    {"{"}
                  </span>
                </div>
                <div className="pl-8">
                  <span
                    style={{ color: "var(--color-foreground-warning-muted)" }}
                  >
                    variants
                  </span>
                  <span style={{ color: "var(--color-foreground-default)" }}>
                    : {"{"}
                  </span>
                </div>
                <div className="pl-12">
                  <span
                    style={{ color: "var(--color-foreground-warning-muted)" }}
                  >
                    variant
                  </span>
                  <span style={{ color: "var(--color-foreground-default)" }}>
                    : {"{"}
                  </span>
                </div>
                <div className="pl-16">
                  <span
                    style={{ color: "var(--color-foreground-warning-muted)" }}
                  >
                    default
                  </span>
                  <span style={{ color: "var(--color-foreground-default)" }}>
                    :
                  </span>{" "}
                  <span
                    style={{ color: "var(--color-foreground-success-muted)" }}
                  >
                    &quot;bg-(--color-background-primary)
                    text-(--color-foreground-inverse)&quot;
                  </span>
                  <span style={{ color: "var(--color-foreground-default)" }}>
                    ,
                  </span>
                </div>
                <div className="pl-16">
                  <span
                    style={{ color: "var(--color-foreground-warning-muted)" }}
                  >
                    outline
                  </span>
                  <span style={{ color: "var(--color-foreground-default)" }}>
                    :
                  </span>{" "}
                  <span
                    style={{ color: "var(--color-foreground-success-muted)" }}
                  >
                    &quot;border border-(--color-border-default)
                    bg-transparent&quot;
                  </span>
                  <span style={{ color: "var(--color-foreground-default)" }}>
                    ,
                  </span>
                </div>
                <div className="pl-12">
                  <span style={{ color: "var(--color-foreground-default)" }}>
                    {"},"}
                  </span>
                </div>
                <div className="pl-8">
                  <span style={{ color: "var(--color-foreground-default)" }}>
                    {"}"}
                  </span>
                </div>
                <div className="pl-4">
                  <span style={{ color: "var(--color-foreground-default)" }}>
                    {"}"}
                  </span>
                </div>
                <div>
                  <span style={{ color: "var(--color-foreground-default)" }}>
                    )
                  </span>
                </div>
                <div className="mt-3">
                  <span style={{ color: "var(--color-foreground-link)" }}>
                    export const
                  </span>{" "}
                  <span
                    style={{ color: "var(--color-foreground-warning-muted)" }}
                  >
                    Button
                  </span>{" "}
                  <span style={{ color: "var(--color-foreground-default)" }}>
                    = forwardRef&lt;
                  </span>
                  <span
                    style={{ color: "var(--color-foreground-primary-muted)" }}
                  >
                    HTMLButtonElement
                  </span>
                  <span style={{ color: "var(--color-foreground-default)" }}>
                    ,
                  </span>{" "}
                  <span
                    style={{ color: "var(--color-foreground-primary-muted)" }}
                  >
                    ButtonProps
                  </span>
                  <span style={{ color: "var(--color-foreground-default)" }}>
                    &gt;(
                  </span>
                </div>
                <div className="pl-4">
                  <span style={{ color: "var(--color-foreground-default)" }}>
                    ({"{"}
                  </span>{" "}
                  <span
                    style={{ color: "var(--color-foreground-warning-muted)" }}
                  >
                    className, variant, size, asChild, ...props
                  </span>{" "}
                  <span style={{ color: "var(--color-foreground-default)" }}>
                    {"}"}, ref) =&gt; {"{"}
                  </span>
                </div>
                <div className="pl-8">
                  <span style={{ color: "var(--color-foreground-link)" }}>
                    const
                  </span>{" "}
                  <span
                    style={{ color: "var(--color-foreground-warning-muted)" }}
                  >
                    Comp
                  </span>{" "}
                  <span style={{ color: "var(--color-foreground-default)" }}>
                    =
                  </span>{" "}
                  <span
                    style={{ color: "var(--color-foreground-warning-muted)" }}
                  >
                    asChild
                  </span>{" "}
                  <span style={{ color: "var(--color-foreground-default)" }}>
                    ?
                  </span>{" "}
                  <span
                    style={{ color: "var(--color-foreground-primary-muted)" }}
                  >
                    Slot
                  </span>{" "}
                  <span style={{ color: "var(--color-foreground-default)" }}>
                    :
                  </span>{" "}
                  <span
                    style={{ color: "var(--color-foreground-success-muted)" }}
                  >
                    &quot;button&quot;
                  </span>
                </div>
                <div className="pl-8">
                  <span style={{ color: "var(--color-foreground-link)" }}>
                    return
                  </span>{" "}
                  <span style={{ color: "var(--color-foreground-default)" }}>
                    &lt;
                  </span>
                  <span
                    style={{ color: "var(--color-foreground-primary-muted)" }}
                  >
                    Comp
                  </span>{" "}
                  <span
                    style={{ color: "var(--color-foreground-warning-muted)" }}
                  >
                    ref
                  </span>
                  <span style={{ color: "var(--color-foreground-default)" }}>
                    ={"{"}ref{"}"}
                  </span>{" "}
                  <span
                    style={{ color: "var(--color-foreground-warning-muted)" }}
                  >
                    className
                  </span>
                  <span style={{ color: "var(--color-foreground-default)" }}>
                    ={"{"}cn(buttonVariants({"{"} variant, size {"}"}),
                    className){"}"}
                  </span>{" "}
                  <span style={{ color: "var(--color-foreground-default)" }}>
                    {"{"} ...props {"}"} /&gt;
                  </span>
                </div>
                <div className="pl-4">
                  <span style={{ color: "var(--color-foreground-default)" }}>
                    {"}"}
                  </span>
                </div>
                <div>
                  <span style={{ color: "var(--color-foreground-default)" }}>
                    )
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Layer list */}
          <div className="lg:col-span-5 space-y-3">
            {[
              {
                n: "①",
                title: "forwardRef-first wrapper types",
                desc: "Every component accepts a ref, enabling integration with form libraries and animation tools without wrapper divs.",
              },
              {
                n: "②",
                title: "CVA variants, compact type strings",
                desc: "Class variance authority keeps variant logic co-located with the component, generating precise TypeScript types automatically.",
              },
              {
                n: "③",
                title: "className merges, static class strings",
                desc: "cn() merges caller className last so any consumer can override without !important or specificity battles.",
              },
              {
                n: "④",
                title: "Base classes: component + token",
                desc: "Base styles use component token variables — bg-(--color-button-primary-background) — which alias semantic tones, so every component automatically respects the active theme.",
              },
              {
                n: "⑤",
                title: "asChild via @radix-ui/react-slot",
                desc: "Pass asChild to render any element or component as the root, preserving all Radix accessibility behavior without an extra DOM node.",
              },
            ].map((layer) => (
              <Card key={layer.n} className="gap-3 p-4 flex-row shadow-none">
                <span
                  className="shrink-0 font-mono text-sm font-semibold"
                  style={{ color: "var(--color-foreground-primary-muted)" }}
                >
                  {layer.n}
                </span>
                <div>
                  <p className="font-semibold text-sm text-(--color-foreground-default)">
                    {layer.title}
                  </p>
                  <p className="mt-1 text-sm text-(--color-foreground-muted) leading-relaxed">
                    {layer.desc}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

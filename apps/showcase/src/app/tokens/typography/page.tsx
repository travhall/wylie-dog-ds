import manifest from "@wyliedog/tokens/manifest.json";
import { Card } from "@wyliedog/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@wyliedog/ui/table";
import { TokensSubpageShell } from "@/components/tokens-subpage-shell";
import type { ManifestToken } from "@/lib/token-values";
import { formatSize, toPx } from "@/lib/token-units";

export default function TypographyPage() {
  const { primitives } = manifest;

  const typographyPrimitives = {
    families: Object.entries(
      (primitives.typography?.family || {}) as Record<string, ManifestToken>
    ).map(([name, token]) => ({
      name,
      value: token.value,
      var: token.variable,
    })),
    sizes: Object.entries(
      (primitives.typography?.size || {}) as Record<string, ManifestToken>
    )
      .map(([name, token]) => ({
        name: name.split("-").slice(-1)[0],
        value: token.value,
        var: token.variable,
        px: toPx(token.value),
      }))
      .sort((a, b) => a.px - b.px),
    weights: Object.entries(
      (primitives.typography?.weight || {}) as Record<string, ManifestToken>
    ).map(([name, token]) => ({
      name: name.split("-").slice(-1)[0],
      value: token.value,
      var: token.variable,
    })),
    lineHeights: Object.entries(
      (primitives.typography?.lineHeight || {}) as Record<string, ManifestToken>
    ).map(([name, token]) => ({
      name: name.split("-").slice(-1)[0],
      value: token.value,
      var: token.variable,
    })),
  };

  return (
    <TokensSubpageShell
      categoryLabel="Typography"
      headline={
        <>
          A pairing that ships{" "}
          <span className="text-(--color-foreground-primary-muted)">
            long-form
          </span>
          , dashboards, and code.
        </>
      }
      description="Every family, size, weight, and line height, in full — the complete reference behind the hub's editorial sample."
    >
      <div className="space-y-4">
        <Card className="gap-0 rounded-xl p-6 space-y-4 shadow-none">
          <div>
            <h2 className="font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint)">
              Families and sizes
            </h2>
          </div>
          <div className="space-y-4">
            <div
              tabIndex={0}
              role="region"
              aria-label="Families and sizes table"
              className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus-ring) overflow-x-auto [&>div]:overflow-visible"
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      scope="col"
                      className="font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint)"
                    >
                      Size
                    </TableHead>
                    {typographyPrimitives.families.map((f) => (
                      <TableHead
                        key={f.name}
                        scope="col"
                        className="font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint)"
                      >
                        {f.name} · {f.value}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {typographyPrimitives.sizes.map((s) => (
                    <TableRow key={s.name}>
                      <TableHead
                        scope="row"
                        className="h-auto py-3 align-top font-normal"
                      >
                        <div className="text-sm text-(--color-foreground-default)">
                          {s.name}
                        </div>
                        <div className="text-xs font-mono text-(--color-foreground-faint)">
                          {formatSize(s.value)}
                        </div>
                        <div className="text-xs font-mono text-(--color-foreground-faint)">
                          fontSize: {s.var}
                        </div>
                      </TableHead>
                      {typographyPrimitives.families.map((f) => {
                        // Extract the font family type (sans, mono, serif)
                        const familyType = f.name.split("-").pop();
                        // Use standard Tailwind font utilities (mapped to tokens via config)
                        const fontFamilyClass = `font-${familyType}`;

                        return (
                          <TableCell key={f.name} className="align-top">
                            <span
                              className={`${fontFamilyClass} text-(--color-foreground-default)`}
                              style={{ fontSize: s.value }}
                            >
                              Sample
                            </span>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </Card>

        <Card className="gap-0 rounded-xl p-6 space-y-8 shadow-none">
          <div>
            <h2 className="font-mono text-xs uppercase tracking-wider text-(--color-foreground-faint)">
              Attributes
            </h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-(--color-foreground-default)">
                Weights
              </h3>
              {typographyPrimitives.weights.map((w) => (
                <div key={w.name} className="flex items-center justify-between">
                  <span
                    style={{ fontWeight: w.value }}
                    className="text-lg text-(--color-foreground-default)"
                  >
                    {w.name}
                  </span>
                  <span className="text-xs font-mono text-(--color-foreground-faint)">
                    {w.value}
                  </span>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-(--color-foreground-default)">
                Line heights
              </h3>
              {typographyPrimitives.lineHeights.map((lh) => (
                <div
                  key={lh.name}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm text-(--color-foreground-default)">
                    {lh.name}
                  </span>
                  <span className="text-xs font-mono text-(--color-foreground-faint)">
                    {lh.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </TokensSubpageShell>
  );
}

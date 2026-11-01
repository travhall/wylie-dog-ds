import manifest from "@wyliedog/tokens/manifest.json";
import { ColorPairs } from "@/components/color-pairs";
import { TokensSubpageShell } from "@/components/tokens-subpage-shell";

export default function ColorsPage() {
  const { primitives, semantics } = manifest;

  const formatGroupName = (name: string) =>
    name.charAt(0).toUpperCase() + name.slice(1);

  const colorPrimitives = Object.entries(primitives.colors).map(
    ([name, shades]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      shades: Object.entries(shades).sort((a, b) => {
        const aVal = parseInt(a[0]) || 0;
        const bVal = parseInt(b[0]) || 0;
        return aVal - bVal;
      }),
    })
  );

  const brandNames = [
    "Fiery-coral",
    "Polar-night",
    "Sandcastle",
    "Petrified-wood",
    "Black-bear",
  ];
  const brandPalettes = brandNames
    .map((n) => colorPrimitives.find((c) => c.name === n))
    .filter((c): c is (typeof colorPrimitives)[number] => c !== undefined);
  const utilityPalettes = colorPrimitives.filter(
    (c) => !brandNames.includes(c.name)
  );

  const semanticGroups = Object.entries(semantics)
    .map(([group, tokens]) => ({
      group: formatGroupName(group),
      tokens: Object.entries(tokens)
        .filter(([, token]) => token.type === "color")
        .map(([name, token]) => ({
          name: name
            .replace(/^color-/, "")
            .split("-")
            .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
            .join(" "),
          var: token.variable,
          description: token.description,
        })),
    }))
    .filter((g) => g.tokens.length > 0);

  return (
    <TokensSubpageShell
      categoryLabel="Color"
      headline={
        <>
          OKLCH means the ramp{" "}
          <span className="text-(--color-foreground-primary-muted)">is</span>{" "}
          the math.
        </>
      }
      description="Every primitive palette and its semantic mapping, in full — the complete reference behind every swatch shown on the hub."
    >
      {/* Brand palettes */}
      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="font-serif text-2xl font-semibold text-(--color-foreground-default)">
            Brand palettes
          </h2>
          <p className="max-w-2xl text-sm text-(--color-foreground-muted)">
            The five ramps that carry the identity: fiery coral for action,
            polar night as the cool counterpoint, and three warm neutrals.
          </p>
        </div>
        <PaletteList palettes={brandPalettes} />
      </section>

      {/* Pairs */}
      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="font-serif text-2xl font-semibold text-(--color-foreground-default)">
            Pairs and contrast
          </h2>
          <p className="max-w-2xl text-sm text-(--color-foreground-muted)">
            A foreground token is guaranteed readable on its matching
            background. These are the pairs, with their measured contrast in
            Light and Dark.
          </p>
        </div>
        <ColorPairs />
      </section>

      {/* Utility ramps */}
      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="font-serif text-2xl font-semibold text-(--color-foreground-default)">
            Utility ramps
          </h2>
          <p className="max-w-2xl text-sm text-(--color-foreground-muted)">
            General-purpose ramps. Status and feedback colors resolve to these
            through the semantic layer, so components do not reference them
            directly.
          </p>
        </div>
        <PaletteList palettes={utilityPalettes} />
      </section>

      {/* Semantics */}
      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="font-serif text-2xl font-semibold text-(--color-foreground-default)">
            Semantic mapping
          </h2>
          <p className="max-w-2xl text-sm text-(--color-foreground-muted)">
            Every semantic color by part, with its full variable name.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {semanticGroups.map((group) => (
            <div
              key={group.group}
              className="overflow-hidden rounded-xl border border-(--color-border-default) bg-(--color-background-default)"
            >
              <h3 className="border-b border-(--color-border-default) bg-(--color-background-muted) px-5 py-3 font-semibold text-(--color-foreground-default)">
                {group.group}
              </h3>
              <div>
                <div className="divide-y divide-(--color-border-default)">
                  {group.tokens.map((token) => (
                    <div
                      key={token.name}
                      className="flex items-center justify-between gap-3 px-5 py-3"
                    >
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-(--color-foreground-default)">
                          {token.name}
                        </div>
                        <div className="break-all font-mono text-xs text-(--color-foreground-muted)">
                          {token.var}
                        </div>
                      </div>
                      <div
                        className="h-8 w-8 shrink-0 rounded-md border border-(--color-border-default)"
                        style={{ backgroundColor: token.var }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </TokensSubpageShell>
  );
}

interface PaletteListProps {
  palettes: Array<{
    name: string;
    shades: Array<[string, { variable: string; value: string }]>;
  }>;
}

function PaletteList({ palettes }: PaletteListProps) {
  return (
    <div className="space-y-10">
      {palettes.map((color) => (
        <div key={color.name} className="space-y-4">
          <h3 className="font-serif text-xl font-semibold text-(--color-foreground-default)">
            {color.name}
          </h3>
          <div className="grid grid-cols-6 gap-3 md:grid-cols-11">
            {color.shades.map(([shade, token]) => (
              <div key={shade} className="space-y-2">
                <div
                  className="aspect-square rounded-lg border border-(--color-border-default)"
                  style={{ backgroundColor: token.variable }}
                  title={`${token.variable}\n${token.value}`}
                />
                <div className="text-center font-mono text-xs text-(--color-foreground-muted)">
                  {shade}
                  <span className="sr-only">{`, ${token.value}`}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

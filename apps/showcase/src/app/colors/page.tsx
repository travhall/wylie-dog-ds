import { Card, CardContent, CardHeader, CardTitle } from "@wyliedog/ui/card";
import { Badge } from "@wyliedog/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@wyliedog/ui/tabs";
import { color } from "@wyliedog/tokens/hierarchical";

const semanticGroups = [
  {
    title: "Background",
    tokens: [
      ["Primary", "--color-background-primary"],
      ["Secondary", "--color-background-secondary"],
      ["Tertiary", "--color-background-tertiary"],
      ["Inverse", "--color-background-inverse"],
      ["Brand", "--color-background-brand"],
      ["Success", "--color-background-success"],
      ["Warning", "--color-background-warning"],
      ["Danger", "--color-background-danger"],
      ["Info", "--color-background-info"],
    ],
  },
  {
    title: "Surface",
    tokens: [
      ["Primary", "--color-surface-primary"],
      ["Secondary", "--color-surface-secondary"],
      ["Raised", "--color-surface-raised"],
      ["Overlay", "--color-surface-overlay"],
      ["Brand", "--color-surface-brand"],
      ["Success", "--color-surface-success"],
      ["Warning", "--color-surface-warning"],
      ["Danger", "--color-surface-danger"],
      ["Info", "--color-surface-info"],
    ],
  },
  {
    title: "Text",
    tokens: [
      ["Primary", "--color-text-primary"],
      ["Secondary", "--color-text-secondary"],
      ["Tertiary", "--color-text-tertiary"],
      ["Disabled", "--color-text-disabled"],
      ["Inverse", "--color-text-inverse"],
      ["Brand", "--color-text-brand"],
      ["Success", "--color-text-success"],
      ["Warning", "--color-text-warning"],
      ["Danger", "--color-text-danger"],
      ["Info", "--color-text-info"],
    ],
  },
  {
    title: "Border & Interactive",
    tokens: [
      ["Border Primary", "--color-border-primary"],
      ["Border Secondary", "--color-border-secondary"],
      ["Border Focus", "--color-border-focus"],
      ["Border Brand", "--color-border-brand"],
      ["Border Success", "--color-border-success"],
      ["Border Warning", "--color-border-warning"],
      ["Border Danger", "--color-border-danger"],
      ["Border Info", "--color-border-info"],
      ["Interactive Primary", "--color-interactive-primary"],
      ["Interactive Primary Hover", "--color-interactive-primary-hover"],
      ["Interactive Secondary", "--color-interactive-secondary"],
      ["Interactive Secondary Hover", "--color-interactive-secondary-hover"],
      ["Interactive Success", "--color-interactive-success"],
      ["Interactive Warning", "--color-interactive-warning"],
      ["Interactive Danger", "--color-interactive-danger"],
    ],
  },
];

export default function ColorsPage() {
  const primitiveEntries = Object.entries(color).map(([name, shades]) => {
    const sortedShades = Object.entries(shades as Record<string, string>).sort(
      ([a], [b]) => {
        const numA = parseInt(a);
        const numB = parseInt(b);
        if (isNaN(numA) && isNaN(numB)) return a.localeCompare(b);
        if (isNaN(numA)) return 1;
        if (isNaN(numB)) return -1;
        return numA - numB;
      }
    );
    return { name, shades: sortedShades };
  });

  return (
    <div className="py-16 space-y-10">
      <section className="text-center space-y-4">
        <Badge variant="outline">Design Tokens</Badge>
        <h1 className="text-4xl font-bold tracking-tight">
          Color System Reference
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          Live data from <code>@wyliedog/tokens</code>. Use this page to verify
          primitive palettes and the semantic CSS variables used throughout the
          Showcase + UI packages.
        </p>
      </section>

      <Tabs defaultValue="semantic" className="space-y-8">
        <div className="flex justify-center">
          <TabsList>
            <TabsTrigger value="semantic">Semantic tokens</TabsTrigger>
            <TabsTrigger value="primitive">Primitive palettes</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="semantic" className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold">Semantic Tokens</h2>
            <p className="text-muted-foreground">
              These swatches read from CSS custom properties such as{" "}
              <code>var(--color-background-brand)</code>. Any blank tile means
              the variable isn’t being injected.
            </p>
          </div>
          {semanticGroups.map((group) => (
            <Card key={group.title}>
              <CardHeader>
                <CardTitle>{group.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {group.tokens.map(([label, variable]) => (
                    <div
                      key={variable}
                      className="rounded-lg border border-border p-4 flex flex-col gap-2 text-sm bg-background"
                      style={{
                        backgroundColor: `var(${variable}, transparent)`,
                      }}
                    >
                      <span className="font-semibold drop-shadow-sm">
                        {label}
                      </span>
                      <span className="text-xs font-mono">
                        {variable.replace("--color-", "")}
                      </span>
                      <span className="text-xs opacity-80">
                        bg: <code>bg-({variable})</code>
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="primitive" className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold">Primitive Palettes</h2>
            <p className="text-muted-foreground">
              Direct exports from the token primitives. These values match the
              Storybook “All Colors” story.
            </p>
          </div>
          <div className="grid gap-6">
            {primitiveEntries.map(({ name, shades }) => (
              <Card key={name}>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <CardTitle className="capitalize">{name}</CardTitle>
                    <Badge variant="secondary">{shades.length} shades</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
                    {shades.map(([shade, value]) => (
                      <div key={shade} className="space-y-2 text-center">
                        <div
                          className="w-full aspect-square rounded border border-border"
                          style={{ backgroundColor: value }}
                        />
                        <div className="text-sm font-mono">{shade}</div>
                        <div className="text-xs text-muted-foreground wrap-break-word">
                          {value}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

"use client";

import type { ReactNode } from "react";
import { Layers, Palette, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@wyliedog/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@wyliedog/ui/card";
import { CardGrid } from "@wyliedog/ui/card-grid";
import { FeatureGrid } from "@wyliedog/ui/feature-grid";
import { SectionFeatures } from "@wyliedog/ui/compositions/section-features";
import { SectionHero } from "@wyliedog/ui/compositions/section-hero";
import { SiteFooter } from "@wyliedog/ui/compositions/site-footer";
import { SiteHeader } from "@wyliedog/ui/compositions/site-header";

/*
 * Live previews for the composition patterns on /patterns. They are the real
 * @wyliedog/ui compositions, sized down for the card:
 *
 * - `inert` makes each one an illustration: the page keeps a single h1 and one
 *   main landmark, and the placeholder links are not tab stops.
 * - Responsive props get fixed values because breakpoints follow the browser
 *   window, not the card, and a four-column grid would crowd a card.
 * - PageLayout is composed from its parts (SiteHeader, SiteFooter, Card)
 *   because it renders its own <main>, which this page already has.
 */

/* `narrow` keeps a full-width page section at a readable width. */
function Stage({
  children,
  narrow = false,
}: {
  children: ReactNode;
  narrow?: boolean;
}) {
  return (
    <div
      inert
      className={`w-full${narrow ? " max-w-3xl" : ""} overflow-hidden rounded-lg border border-(--color-border-default) bg-(--color-background-default)`}
    >
      {children}
    </div>
  );
}

const navigation = [
  { label: "Docs", href: "#" },
  { label: "Tokens", href: "#" },
  { label: "Components", href: "#" },
];

const logo = (
  <span className="text-base font-semibold text-(--color-foreground-default)">
    Wylie Dog
  </span>
);

const features = [
  {
    icon: <Palette className="size-5" aria-hidden />,
    title: "Tokens",
    description: "One source of truth for Figma and code.",
  },
  {
    icon: <ShieldCheck className="size-5" aria-hidden />,
    title: "Accessible",
    description: "Contrast and focus checked on every build.",
  },
  {
    icon: <Zap className="size-5" aria-hidden />,
    title: "Fast",
    description: "Import only the components you use.",
  },
  {
    icon: <Layers className="size-5" aria-hidden />,
    title: "Composable",
    description: "Small parts that fit together.",
  },
];

const fixedColumns = { sm: 2, md: 2, lg: 2, xl: 2 };

export function SiteHeaderPreview() {
  return (
    <Stage>
      <SiteHeader
        size="sm"
        className="static"
        logo={logo}
        navigation={navigation}
        actions={<Button size="sm">Get started</Button>}
      />
    </Stage>
  );
}

export function SiteFooterPreview() {
  return (
    <Stage narrow>
      <SiteFooter
        description="Design tokens and components."
        columns={[
          {
            title: "Build",
            links: [
              { label: "Components", href: "#" },
              { label: "Tokens", href: "#" },
            ],
          },
          {
            title: "Learn",
            links: [
              { label: "Docs", href: "#" },
              { label: "Source", href: "#" },
            ],
          },
        ]}
        copyright="© Wylie Dog"
        logo={logo}
      />
    </Stage>
  );
}

export function SectionHeroPreview() {
  return (
    <Stage narrow>
      <SectionHero
        headingLevel={2}
        badge="New release"
        title="Tokens that stay in sync"
        description="One source of truth for Figma and code."
        primaryAction={{ label: "Get started", href: "#" }}
        secondaryAction={{ label: "Browse components", href: "#" }}
      />
    </Stage>
  );
}

export function SectionFeaturesPreview() {
  return (
    <Stage narrow>
      <SectionFeatures
        title="Everything in one system"
        columns={2}
        features={features.slice(0, 4)}
      />
    </Stage>
  );
}

export function PageLayoutPreview() {
  return (
    <Stage narrow>
      <div className="flex h-72 flex-col">
        <SiteHeader
          size="sm"
          className="static"
          logo={logo}
          navigation={navigation}
        />
        <div className="flex min-h-0 flex-1">
          <div className="hidden w-32 shrink-0 flex-col gap-2 border-r border-(--color-border-default) p-3 text-sm text-(--color-foreground-muted) sm:flex">
            <span>Overview</span>
            <span>Tokens</span>
            <span>Components</span>
          </div>
          <div className="flex-1 p-4">
            <Card>
              <CardHeader>
                <CardTitle>Main content</CardTitle>
                <CardDescription>
                  The header, sidebar, content and footer share one page.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
        <SiteFooter variant="minimal" copyright="© Wylie Dog" />
      </div>
    </Stage>
  );
}

export function CardGridPreview() {
  return (
    <Stage>
      <div className="p-4">
        <CardGrid columns={fixedColumns} variant="compact">
          {features.map((f) => (
            <Card key={f.title}>
              <CardHeader>
                <CardTitle>{f.title}</CardTitle>
                <CardDescription>{f.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </CardGrid>
      </div>
    </Stage>
  );
}

export function FeatureGridPreview() {
  return (
    <Stage>
      <div className="p-4">
        <FeatureGrid
          columns={fixedColumns}
          variant="compact"
          features={features}
        />
      </div>
    </Stage>
  );
}

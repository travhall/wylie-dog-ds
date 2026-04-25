import type { Meta, StoryObj } from "@storybook/react-vite";
import { SiteHeader } from "@wyliedog/ui/compositions/site-header";
import { SiteFooter } from "@wyliedog/ui/compositions/site-footer";
import { SectionHero } from "@wyliedog/ui/compositions/section-hero";
import { SectionFeatures } from "@wyliedog/ui/compositions/section-features";
import {
  Zap,
  Shield,
  Palette,
  Accessibility,
  Gauge,
  Layers,
} from "lucide-react";

/**
 * End-to-end showcase story: stitches the four composition primitives
 * (SiteHeader, SectionHero, SectionFeatures, SiteFooter) into a complete
 * marketing page.
 *
 * Purpose:
 * - Serves as a first-glance reference for new users ("what does a real page
 *   built from this system look like?").
 * - Validates the compositions compose correctly with realistic content.
 * - Demonstrates passing themed props end-to-end through a single layout.
 */
const meta: Meta = {
  title: "Showcase/Marketing Site",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Complete marketing site composed from SiteHeader, SectionHero, SectionFeatures, and SiteFooter. Use as a reference for building real pages with the design system.",
      },
    },
  },
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj;

const navigation = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Docs", href: "#docs" },
  { label: "Blog", href: "#blog" },
];

const footerColumns = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Changelog", href: "#changelog" },
      { label: "Roadmap", href: "#roadmap" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#about" },
      { label: "Customers", href: "#customers" },
      { label: "Careers", href: "#careers" },
      { label: "Contact", href: "#contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "#docs" },
      { label: "Guides", href: "#guides" },
      { label: "API Reference", href: "#api" },
      { label: "Community", href: "#community" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "#privacy" },
      { label: "Terms", href: "#terms" },
      { label: "Security", href: "#security" },
    ],
  },
];

const coreFeatures = [
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Lightning Fast",
    description:
      "Shipped as ESM-first, tree-shakeable components. Your bundle only pays for what you import.",
    badge: "Performance",
  },
  {
    icon: <Palette className="h-6 w-6" />,
    title: "OKLCH Design Tokens",
    description:
      "Perceptually uniform color space with P3 wide-gamut support. Every token is themeable and round-trips to Figma.",
  },
  {
    icon: <Accessibility className="h-6 w-6" />,
    title: "Accessible by Default",
    description:
      "Built on Radix UI primitives. Full keyboard nav, screen-reader support, and WCAG AA contrast out of the box.",
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Type-Safe",
    description:
      "Strict TypeScript with VariantProps inference from class-variance-authority. No any, no escape hatches.",
  },
  {
    icon: <Layers className="h-6 w-6" />,
    title: "Three-Tier Tokens",
    description:
      "Primitive, semantic, and component layers. Override one scale, theme the whole system — no forks required.",
  },
  {
    icon: <Gauge className="h-6 w-6" />,
    title: "Production Ready",
    description:
      "1400+ tests, visual regression coverage, and dual CJS/ESM output with proper exports-map conditions.",
  },
];

/**
 * The canonical end-to-end showcase. A complete marketing page wired up
 * with realistic navigation, hero copy, feature grid, and footer.
 */
export const Default: Story = {
  render: () => (
    <div className="min-h-screen flex flex-col">
      <SiteHeader navigation={navigation} />
      <main className="flex-1">
        <SectionHero
          badge="v1.0 — Now Available"
          title="The design system that ships with you"
          description="A production-grade component library built on OKLCH tokens, Radix primitives, and Tailwind 4. Themeable, accessible, and fully type-safe."
          primaryAction={{ label: "Get Started", href: "#get-started" }}
          secondaryAction={{ label: "View on GitHub", href: "#github" }}
        />
        <SectionFeatures
          title="Built for real applications"
          description="Every decision in the system is evaluated against production constraints: bundle size, accessibility, theming, and ergonomics."
          features={coreFeatures}
          columns={3}
        />
      </main>
      <SiteFooter
        columns={footerColumns}
        copyright="© 2026 Wylie Dog Design System. MIT Licensed."
      />
    </div>
  ),
};

/**
 * Showcase with the gradient hero variant — demonstrates how theme variants
 * propagate through the composed page without other components changing.
 */
export const GradientHero: Story = {
  render: () => (
    <div className="min-h-screen flex flex-col">
      <SiteHeader variant="transparent" navigation={navigation} />
      <main className="flex-1">
        <SectionHero
          variant="gradient"
          badge="New"
          title="Same system, bold first impression"
          description="Swap a single variant prop and the hero picks up a gradient background. Everything downstream (features, footer) stays unchanged."
          primaryAction={{ label: "Try It Live", href: "#demo" }}
          secondaryAction={{ label: "Read the Docs", href: "#docs" }}
        />
        <SectionFeatures
          variant="cards"
          title="Features, now in cards"
          features={coreFeatures.slice(0, 3)}
          columns={3}
        />
      </main>
      <SiteFooter
        variant="minimal"
        copyright="© 2026 Wylie Dog Design System."
      />
    </div>
  ),
};

/**
 * Centered hero variant — common for launch announcements or simple landing
 * pages where the primary message should sit at the visual center.
 */
export const CenteredHero: Story = {
  render: () => (
    <div className="min-h-screen flex flex-col">
      <SiteHeader navigation={navigation} />
      <main className="flex-1">
        <SectionHero
          variant="centered"
          badge="Launching Today"
          title="One message. One focus. One page."
          description="The centered variant puts all eyes on the primary CTA — ideal for product launches, newsletter signups, or single-purpose landing pages."
          primaryAction={{ label: "Sign Up Free", href: "#signup" }}
          secondaryAction={{ label: "Learn More", href: "#learn" }}
        />
        <SectionFeatures
          title="Why designers pick it"
          features={coreFeatures.slice(0, 4)}
          columns={2}
        />
      </main>
      <SiteFooter
        columns={footerColumns.slice(0, 2)}
        copyright="© 2026 Wylie Dog Design System."
      />
    </div>
  ),
};

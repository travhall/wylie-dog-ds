import { getShowcaseMeta } from "@/lib/showcase-metadata";
import { SectionSubnav } from "@/components/section-subnav";
import { HeroSection } from "./_sections/hero";
import { ColorSection } from "./_sections/color";
import { TypographySection } from "./_sections/typography";
import { SpacingSection } from "./_sections/spacing";
import { RadiusSection } from "./_sections/radius";
import { ElevationSection } from "./_sections/elevation";
import { MotionSection } from "./_sections/motion";
import { CtaSection } from "./_sections/cta";

export default function TokensPage() {
  const meta = getShowcaseMeta();

  return (
    <>
      <HeroSection />
      <SectionSubnav
        sections={[
          { label: "Color", id: "color" },
          { label: "Typography", id: "typography" },
          { label: "Spacing", id: "spacing" },
          { label: "Radius", id: "radius" },
          { label: "Elevation", id: "elevation" },
          { label: "Motion", id: "motion" },
        ]}
        label="Token categories"
        meta={`${meta.tokens.total.toLocaleString()} tokens · v${meta.versions.tokens}`}
      />
      <ColorSection />
      <TypographySection />
      <SpacingSection />
      <RadiusSection />
      <ElevationSection />
      <MotionSection />
      <CtaSection />
    </>
  );
}

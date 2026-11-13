import { HeroSection } from "./_sections/hero";
import { TokensSection } from "./_sections/tokens";
import { ComponentsSection } from "./_sections/components";
import { PatternsSection } from "./_sections/patterns";
import { TokenBridgeSection } from "./_sections/token-bridge";
import { CtaSection } from "./_sections/cta";

export default function ShowcasePage() {
  return (
    <>
      <HeroSection />
      <TokensSection />
      <ComponentsSection />
      <PatternsSection />
      <TokenBridgeSection />
      <CtaSection />
    </>
  );
}

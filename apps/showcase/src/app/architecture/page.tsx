import { HeroSection } from "./_sections/hero";
import { WorkspacesSection } from "./_sections/workspaces";
import { TokenPipelineSection } from "./_sections/token-pipeline";
import { BuildFlowSection } from "./_sections/build-flow";
import { ComponentLayerSection } from "./_sections/component-layer";
import { CtaSection } from "./_sections/cta";

export default function ArchitecturePage() {
  return (
    <>
      <HeroSection />
      <WorkspacesSection />
      <TokenPipelineSection />
      <BuildFlowSection />
      <ComponentLayerSection />
      <CtaSection />
    </>
  );
}

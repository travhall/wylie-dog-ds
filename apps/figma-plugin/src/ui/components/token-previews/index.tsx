import { h } from "preact";
import { ColorTokenPreview } from "./ColorTokenPreview";
import { SpacingTokenPreview } from "./SpacingTokenPreview";
import { TypographyTokenPreview } from "./TypographyTokenPreview";
import { GenericTokenPreview } from "./GenericTokenPreview";

export * from "./ColorTokenPreview";
export * from "./SpacingTokenPreview";
export * from "./TypographyTokenPreview";
export * from "./GenericTokenPreview";

interface TokenPreviewProps {
  type: string;
  value: any;
}

/**
 * Smart token preview component that selects the appropriate
 * preview based on token type
 */
export function TokenPreview({ type, value }: TokenPreviewProps) {
  switch (type) {
    case "color":
      return <ColorTokenPreview value={value} />;

    case "spacing":
    case "dimension":
    case "sizing":
      return <SpacingTokenPreview value={value} />;

    case "fontSize":
    case "fontFamily":
    case "fontWeight":
    case "lineHeight":
    case "letterSpacing":
    case "typography":
      return <TypographyTokenPreview value={value} tokenType={type} />;

    case "borderRadius":
      return <GenericTokenPreview value={value} type={type} />;

    default:
      return <GenericTokenPreview value={value} type={type} />;
  }
}

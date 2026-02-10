// avatar.tsx
import React from "react";
import { cn } from "./lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl";
  /** Semantic role for the avatar context */
  semanticRole?: "profile" | "user" | "decorative";
  /** Name of the person for accessibility context */
  name?: string;
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  (
    { className, size = "md", semanticRole = "profile", name, ...props },
    ref
  ) => {
    const sizes = {
      sm: "h-(--space-avatar-size-sm) w-(--space-avatar-size-sm)",
      md: "h-(--space-avatar-size-md) w-(--space-avatar-size-md)",
      lg: "h-(--space-avatar-size-lg) w-(--space-avatar-size-lg)",
      xl: "h-(--space-avatar-size-xl) w-(--space-avatar-size-xl)",
    };

    const getAriaLabel = () => {
      if (semanticRole === "decorative") return undefined;
      if (name) {
        return semanticRole === "profile"
          ? `${name}'s profile picture`
          : `${name}'s avatar`;
      }
      return semanticRole === "profile" ? "Profile picture" : "User avatar";
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex shrink-0 overflow-hidden rounded-(--space-avatar-rounded) bg-(--color-avatar-background) border border-(--color-avatar-border)",
          sizes[size],
          className
        )}
        role={semanticRole === "decorative" ? "presentation" : "img"}
        aria-label={getAriaLabel()}
        {...props}
      />
    );
  }
);
Avatar.displayName = "Avatar";

export interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Name of the person for accessible alt text generation */
  name?: string;
  /** Custom alt text - if not provided, will be generated from name */
  alt?: string;
}

export const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, name, alt, ...props }, ref) => {
    // Generate accessible alt text if not provided
    const getAltText = () => {
      if (alt !== undefined) return alt; // Explicit alt (including empty string for decorative)
      if (name) return `Profile picture of ${name}`;
      return "Profile picture"; // Fallback
    };

    return (
      <img
        ref={ref}
        className={cn("aspect-square h-full w-full object-cover", className)}
        alt={getAltText()}
        loading="lazy" // Performance improvement
        {...props}
      />
    );
  }
);
AvatarImage.displayName = "AvatarImage";

export interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Name of the person for accessible initials generation */
  name?: string;
  /** Custom initials - if not provided, will be generated from name */
  initials?: string;
}

export const AvatarFallback = React.forwardRef<
  HTMLDivElement,
  AvatarFallbackProps
>(({ className, name, initials, children, ...props }, ref) => {
  // Generate initials from name if not provided
  const getInitials = () => {
    if (initials) return initials;
    if (name) {
      return name
        .split(" ")
        .map((part) => part.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2); // Max 2 characters
    }
    return null;
  };

  const displayContent = children || getInitials();

  return (
    <div
      ref={ref}
      className={cn(
        "flex h-full w-full items-center justify-center rounded-(--space-avatar-rounded) bg-(--color-avatar-fallback-background) text-(--color-avatar-fallback-text) font-medium",
        className
      )}
      aria-hidden="true" // Fallback is decorative since parent Avatar has aria-label
      {...props}
    >
      {displayContent}
    </div>
  );
});
AvatarFallback.displayName = "AvatarFallback";

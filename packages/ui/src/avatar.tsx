// avatar.tsx
import React from "react";
import { cn } from "./lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl";
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size = "md", ...props }, ref) => {
    const sizes = {
      sm: "h-8 w-8",
      md: "h-10 w-10", 
      lg: "h-12 w-12",
      xl: "h-16 w-16",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex shrink-0 overflow-hidden rounded-full bg-[var(--color-avatar-background)] border border-[var(--color-avatar-border)]",
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Avatar.displayName = "Avatar";

export interface AvatarImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {}

export const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, ...props }, ref) => (
    <img
      ref={ref}
      className={cn("aspect-square h-full w-full object-cover", className)}
      {...props}
    />
  )
);
AvatarImage.displayName = "AvatarImage";

export interface AvatarFallbackProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const AvatarFallback = React.forwardRef<HTMLDivElement, AvatarFallbackProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-[var(--color-avatar-fallback-background)] text-[var(--color-avatar-fallback-text)] font-medium",
        className
      )}
      {...props}
    />
  )
);
AvatarFallback.displayName = "AvatarFallback";

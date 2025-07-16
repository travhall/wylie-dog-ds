import React from "react";

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    // Generate variant class
    const variantClass = variant === 'primary' ? 'button-primary' :
                        variant === 'secondary' ? 'button-secondary' :
                        variant === 'ghost' ? 'button-ghost' : '';
    
    // Generate size classes
    const sizeClass = size === 'sm' ? 'text-sm px-3 py-1.5' :
                     size === 'lg' ? 'text-lg px-6 py-3' :
                     'text-base px-4 py-2'; // default md
    
    return (
      <button
        className={cn(
          // Base styles
          "inline-flex items-center justify-center font-medium transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-offset-2",
          // Variant class
          variantClass,
          // Size class
          sizeClass,
          // User className
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

import React from "react";
import { cn } from "../lib/utils";
import { Separator } from "../separator";

export interface FooterColumn {
  title: string;
  links: Array<{
    label: string;
    href: string;
  }>;
}

export interface SiteFooterProps extends React.HTMLAttributes<HTMLElement> {
  variant?: "default" | "minimal";
  logo?: React.ReactNode;
  columns?: FooterColumn[];
  copyright?: string;
  socialLinks?: Array<{
    label: string;
    href: string;
    icon?: React.ReactNode;
  }>;
}

export const SiteFooter = React.forwardRef<HTMLElement, SiteFooterProps>(
  (
    {
      className,
      variant = "default",
      logo,
      columns = [],
      copyright,
      socialLinks = [],
      ...props
    },
    ref
  ) => {
    const variants = {
      default:
        "bg-(--color-background-secondary) border-t border-(--color-border-primary)",
      minimal:
        "bg-(--color-background-primary) border-t border-(--color-border-primary)",
    };

    const currentYear = new Date().getFullYear();
    const copyrightText = copyright || `© ${currentYear} All rights reserved.`;

    return (
      <footer
        className={cn("w-full mt-auto", variants[variant], className)}
        ref={ref}
        {...props}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {variant === "default" && columns.length > 0 && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-8">
                {/* Logo/Brand Column */}
                <div className="col-span-2 md:col-span-1">
                  {logo || (
                    <div className="mb-4">
                      <span className="text-lg font-bold">Logo</span>
                    </div>
                  )}
                  <p className="text-sm text-(--color-text-secondary)">
                    Building amazing experiences with modern design systems.
                  </p>
                </div>

                {/* Footer Columns */}
                {columns.map((column, index) => (
                  <div key={index}>
                    <h3 className="font-semibold text-sm mb-4">
                      {column.title}
                    </h3>
                    <ul className="space-y-2">
                      {column.links.map((link, linkIndex) => (
                        <li key={linkIndex}>
                          <a
                            href={link.href}
                            className="text-sm text-(--color-text-secondary) hover:text-(--color-text-primary) transition-colors"
                          >
                            {link.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <Separator className="mb-8" />
            </>
          )}

          {/* Bottom Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-(--color-text-secondary)">
              {copyrightText}
            </p>

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="flex items-center space-x-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    className="text-(--color-text-secondary) hover:text-(--color-text-primary) transition-colors"
                  >
                    {social.icon || social.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </footer>
    );
  }
);

SiteFooter.displayName = "SiteFooter";

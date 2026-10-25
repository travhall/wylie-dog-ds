import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";
import { Separator } from "../separator";

export const siteFooterVariants = cva("w-full mt-auto", {
  variants: {
    variant: {
      default:
        "bg-(--color-site-footer-background-muted) border-t border-(--color-site-footer-border)",
      minimal:
        "bg-(--color-site-footer-background) border-t border-(--color-site-footer-border)",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface FooterColumn {
  title: string;
  links: Array<{
    label: string;
    href: string;
  }>;
}

export interface SiteFooterProps
  extends
    React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof siteFooterVariants> {
  logo?: React.ReactNode;
  description?: React.ReactNode;
  columns?: FooterColumn[];
  copyright?: string;
  socialLinks?: Array<{
    label: string;
    href: string;
    icon?: React.ReactNode;
  }>;
  renderLink?: (
    link: { label: string; href: string },
    index: number
  ) => React.ReactNode;
  extra?: React.ReactNode;
  containerClassName?: string;
  columnsClassName?: string;
}

export const SiteFooter = React.forwardRef<HTMLElement, SiteFooterProps>(
  (
    {
      className,
      variant,
      logo,
      description,
      columns = [],
      copyright,
      socialLinks = [],
      renderLink,
      extra,
      containerClassName,
      columnsClassName,
      ...props
    },
    ref
  ) => {
    const currentYear = new Date().getFullYear();
    const copyrightText = copyright || `© ${currentYear} All rights reserved.`;

    return (
      <footer
        className={cn(siteFooterVariants({ variant }), className)}
        ref={ref}
        {...props}
      >
        <div
          className={cn(
            "container mx-auto px-(--space-site-footer-container-padding-x-sm) sm:px-(--space-site-footer-container-padding-x-md) lg:px-(--space-site-footer-container-padding-x-lg) py-(--space-site-footer-container-padding-y)",
            containerClassName
          )}
        >
          {(variant ?? "default") === "default" && columns.length > 0 && (
            <>
              <div
                className={cn(
                  "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-(--space-site-footer-columns-gap) mb-(--space-site-footer-columns-margin-bottom)",
                  columnsClassName
                )}
              >
                {/* Logo/Brand Column */}
                <div className="max-md:col-span-2">
                  {logo || (
                    <div className="mb-(--space-site-footer-logo-margin-bottom)">
                      <span className="text-(length:--font-size-site-footer-logo-font-size) font-(--font-weight-site-footer-logo-font-weight)">
                        Logo
                      </span>
                      <p className="text-(length:--font-size-site-footer-font-size) text-(--color-site-footer-text)">
                        Building amazing experiences with modern design systems.
                      </p>
                    </div>
                  )}
                  {description && (
                    <p className="text-(length:--font-size-site-footer-font-size) text-(--color-site-footer-text)">
                      {description}
                    </p>
                  )}
                </div>

                {/* Footer Columns — each is a named nav landmark for screen reader navigation */}
                {columns.map((column, index) => (
                  <nav key={index} aria-label={column.title}>
                    <h3 className="font-(--font-weight-site-footer-column-title-font-weight) text-(length:--font-size-site-footer-column-title-font-size) mb-(--space-site-footer-column-title-margin-bottom)">
                      {column.title}
                    </h3>
                    <ul className="space-y-(--space-site-footer-column-links-gap)">
                      {column.links.map((link, linkIndex) => (
                        <li key={linkIndex}>
                          {renderLink ? (
                            renderLink(link, linkIndex)
                          ) : (
                            <a
                              href={link.href}
                              className="text-(length:--font-size-site-footer-link-font-size) text-(--color-site-footer-link-text) hover:text-(--color-site-footer-link-text-hover) transition-colors"
                            >
                              {link.label}
                            </a>
                          )}
                        </li>
                      ))}
                    </ul>
                  </nav>
                ))}
              </div>

              <Separator className="mb-(--space-site-footer-separator-margin-bottom)" />
            </>
          )}

          {/* Bottom Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-(--space-site-footer-bottom-gap)">
            <p className="text-(length:--font-size-site-footer-font-size) text-(--color-site-footer-text)">
              {copyrightText}
            </p>

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="flex items-center space-x-(--space-site-footer-social-gap)">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    className="text-(--color-site-footer-link-text) hover:text-(--color-site-footer-link-text-hover) transition-colors"
                  >
                    {social.icon || social.label}
                  </a>
                ))}
              </div>
            )}

            {extra}
          </div>
        </div>
      </footer>
    );
  }
);

SiteFooter.displayName = "SiteFooter";

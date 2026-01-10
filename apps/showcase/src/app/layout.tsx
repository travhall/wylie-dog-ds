import type { Metadata } from "next";
import { PageLayout, SiteHeader, SiteFooter } from "@wyliedog/ui/compositions";
import { Button } from "@wyliedog/ui/button";
import { cn } from "@wyliedog/ui/lib/utils";
import Link from "next/link";
import { sansFont, monoFont } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wylie Dog Design System",
  description: "A modern design system built with React and Tailwind CSS",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigation = [
    { label: "Home", href: "/" },
    { label: "Monorepo", href: "/monorepo" },
    { label: "Tokens", href: "/tokens" },
    { label: "Components", href: "/components" },
    { label: "Storybook", href: "/storybook" },
    { label: "Plugin", href: "/plugin" },
  ];

  const footerColumns = [
    {
      title: "Ecosystem",
      links: [
        { label: "Monorepo", href: "/monorepo" },
        { label: "Tokens", href: "/tokens" },
        { label: "Components", href: "/components" },
        { label: "Storybook", href: "/storybook" },
        { label: "Figma Plugin", href: "/plugin" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Documentation", href: "/docs" },
        { label: "Examples", href: "/examples" },
        { label: "GitHub", href: "https://github.com" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "/about" },
        { label: "Blog", href: "/blog" },
        { label: "Contact", href: "/contact" },
      ],
    },
  ];

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          sansFont.variable,
          monoFont.variable,
          "font-sans min-h-screen relative bg-(--color-background-secondary)"
        )}
      >
        {/* Global Background Decoration */}
        <div className="fixed inset-0 grid-bg opacity-[0.03] pointer-events-none -z-10" />
        <div className="fixed inset-0 hero-gradient opacity-40 pointer-events-none -z-10" />

        <PageLayout
          header={
            <div className="sticky top-0 z-50 glass border-b border-(--color-border-secondary)/50">
              <SiteHeader
                navigation={navigation}
                actions={
                  <div className="flex items-center gap-2">
                    <Link href="/docs">
                      <Button variant="outline" size="sm">
                        Docs
                      </Button>
                    </Link>
                    <Link href="https://github.com">
                      <Button variant="outline" size="sm">
                        GitHub
                      </Button>
                    </Link>
                  </div>
                }
              />
            </div>
          }
          footer={
            <SiteFooter
              className="border-t border-(--color-border-primary)/50 bg-(--color-background-secondary)/30"
              columns={footerColumns}
              copyright="© 2026 Wylie Dog Design System. All rights reserved."
            />
          }
        >
          <main className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl animate-in fade-in duration-700">
            {children}
          </main>
        </PageLayout>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { PageLayout, SiteHeader, SiteFooter } from "@wyliedog/ui/compositions";
import { Button } from "@wyliedog/ui/button";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Wylie Dog Design System",
  description: "A modern design system built with React and Tailwind CSS",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigation = [
    { label: "Home", href: "/" },
    { label: "Components", href: "/components" },
    { label: "Colors", href: "/colors" },
    { label: "Patterns", href: "/patterns" },
    { label: "Examples", href: "/examples" },
  ];

  const footerColumns = [
    {
      title: "Product",
      links: [
        { label: "Components", href: "/components" },
        { label: "Colors", href: "/colors" },
        { label: "Patterns", href: "/patterns" },
        { label: "Examples", href: "/examples" },
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
      <body className={inter.className}>
        <PageLayout
          header={
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
          }
          footer={
            <SiteFooter
              columns={footerColumns}
              copyright=" 2024 Wylie Dog Design System. All rights reserved."
            />
          }
        >
          {children}
        </PageLayout>
      </body>
    </html>
  );
}

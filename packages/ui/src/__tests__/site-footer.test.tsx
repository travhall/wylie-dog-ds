import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import {
  describeA11y,
  commonA11yTests,
  expectToPassA11yAudit,
} from "../lib/test-utils";
import { SiteFooter } from "../compositions/site-footer";

const defaultColumns = [
  {
    title: "Product",
    links: [
      { label: "Components", href: "#components" },
      { label: "Docs", href: "#docs" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#about" },
      { label: "Blog", href: "#blog" },
    ],
  },
];

describe("SiteFooter", () => {
  it("renders without crashing", () => {
    render(<SiteFooter />);
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("renders copyright text", () => {
    render(<SiteFooter copyright="© 2025 Wylie Dog." />);
    expect(screen.getByText("© 2025 Wylie Dog.")).toBeInTheDocument();
  });

  it("renders each column as a named nav landmark", () => {
    render(<SiteFooter columns={defaultColumns} />);
    expect(
      screen.getByRole("navigation", { name: "Product" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "Company" })
    ).toBeInTheDocument();
  });

  it("renders column links", () => {
    render(<SiteFooter columns={defaultColumns} />);
    expect(
      screen.getByRole("link", { name: "Components" })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "About" })).toBeInTheDocument();
  });

  it("renders social links with aria-label", () => {
    render(<SiteFooter socialLinks={[{ label: "GitHub", href: "#github" }]} />);
    expect(screen.getByRole("link", { name: "GitHub" })).toBeInTheDocument();
  });

  it("does not render the placeholder paragraph when a real logo is supplied without description", () => {
    render(
      <SiteFooter logo={<span>Real Logo</span>} columns={defaultColumns} />
    );
    expect(screen.getByText("Real Logo")).toBeInTheDocument();
    expect(
      screen.queryByText(
        "Building amazing experiences with modern design systems."
      )
    ).not.toBeInTheDocument();
  });

  it("renders custom link markup via renderLink", () => {
    render(
      <SiteFooter
        columns={defaultColumns}
        renderLink={(link) => (
          <a key={link.href} href={link.href} data-testid="custom-link">
            {link.label.toUpperCase()}
          </a>
        )}
      />
    );
    expect(
      screen.getByRole("link", { name: "COMPONENTS" })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Components" })
    ).not.toBeInTheDocument();
  });

  it("renders the extra slot in the bottom bar", () => {
    render(<SiteFooter extra={<span>All systems operational</span>} />);
    expect(screen.getByText("All systems operational")).toBeInTheDocument();
  });

  it("forwards ref correctly", () => {
    const ref = { current: null };
    render(<SiteFooter ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });
});

describeA11y("SiteFooter", () => {
  commonA11yTests.passesAudit(() => <SiteFooter />);

  it("passes audit with columns and social links", async () => {
    const { container } = render(
      <SiteFooter
        columns={defaultColumns}
        socialLinks={[
          { label: "GitHub", href: "#github" },
          { label: "Twitter", href: "#twitter" },
        ]}
        copyright="© 2025 Wylie Dog."
      />
    );
    await expectToPassA11yAudit(container);
  });

  it("passes audit with minimal variant", async () => {
    const { container } = render(
      <SiteFooter variant="minimal" copyright="© 2025 Wylie Dog." />
    );
    await expectToPassA11yAudit(container);
  });
});

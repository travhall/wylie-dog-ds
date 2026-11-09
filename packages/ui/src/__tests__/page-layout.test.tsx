import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import {
  describeA11y,
  commonA11yTests,
  expectToPassA11yAudit,
} from "../lib/test-utils";
import { PageLayout, SkipLink } from "../compositions/page-layout";

describe("PageLayout", () => {
  it("renders without crashing", () => {
    render(<PageLayout>Content</PageLayout>);
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("renders a skip navigation link", () => {
    render(<PageLayout>Content</PageLayout>);
    expect(screen.getByText("Skip to main content")).toBeInTheDocument();
  });

  it("skip link points to main content id", () => {
    render(<PageLayout>Content</PageLayout>);
    const skipLink = screen.getByText("Skip to main content");
    expect(skipLink).toHaveAttribute("href", "#main-content");
    expect(screen.getByRole("main")).toHaveAttribute("id", "main-content");
  });

  it("main content can receive programmatic focus from the skip link", () => {
    render(<PageLayout>Content</PageLayout>);
    expect(screen.getByRole("main")).toHaveAttribute("tabindex", "-1");
  });

  it("renders header slot", () => {
    render(<PageLayout header={<div>Site Header</div>}>Content</PageLayout>);
    expect(screen.getByText("Site Header")).toBeInTheDocument();
  });

  it("renders footer slot", () => {
    render(<PageLayout footer={<div>Site Footer</div>}>Content</PageLayout>);
    expect(screen.getByText("Site Footer")).toBeInTheDocument();
  });

  it("renders left sidebar with accessible label", () => {
    render(
      <PageLayout sidebar={<div>Nav</div>} sidebarPosition="left">
        Content
      </PageLayout>
    );
    expect(
      screen.getByRole("complementary", { name: "Sidebar" })
    ).toBeInTheDocument();
  });

  it("renders right sidebar with accessible label", () => {
    render(
      <PageLayout sidebar={<div>Nav</div>} sidebarPosition="right">
        Content
      </PageLayout>
    );
    expect(
      screen.getByRole("complementary", { name: "Sidebar" })
    ).toBeInTheDocument();
  });

  it("forwards ref correctly", () => {
    const ref = { current: null };
    render(<PageLayout ref={ref}>Content</PageLayout>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("applies custom className", () => {
    render(<PageLayout className="custom-class">Content</PageLayout>);
    // The outer div should have the custom class
    const main = screen.getByRole("main");
    expect(main.closest(".custom-class")).toBeInTheDocument();
  });
});

describeA11y("PageLayout", () => {
  commonA11yTests.passesAudit(() => <PageLayout>Content</PageLayout>);

  it("passes audit with header, footer, and sidebar", async () => {
    const { container } = render(
      <PageLayout
        header={<header>Site Header</header>}
        footer={<footer>Site Footer</footer>}
        sidebar={<nav>Sidebar Nav</nav>}
      >
        Main content
      </PageLayout>
    );
    await expectToPassA11yAudit(container);
  });
});

describe("SkipLink", () => {
  it("defaults to the main content target and label", () => {
    render(<SkipLink />);
    const link = screen.getByRole("link", { name: "Skip to main content" });
    expect(link).toHaveAttribute("href", "#main-content");
  });

  it("accepts a custom target and label", () => {
    render(<SkipLink href="#results">Skip to results</SkipLink>);
    expect(
      screen.getByRole("link", { name: "Skip to results" })
    ).toHaveAttribute("href", "#results");
  });

  it("is hidden until focused, then stacks on the fixed layer", () => {
    render(<SkipLink />);
    const link = screen.getByRole("link");
    expect(link).toHaveClass("sr-only");
    expect(link.className).toContain("focus:not-sr-only");
    expect(link.className).toContain(
      "focus:z-(--page-layout-skip-link-z-index)"
    );
  });
});

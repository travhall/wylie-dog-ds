import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import {
  describeA11y,
  commonA11yTests,
  expectToPassA11yAudit,
} from "../lib/test-utils";
import { SiteHeader } from "../compositions/site-header";

const defaultNavigation = [
  { label: "Components", href: "#components" },
  { label: "Docs", href: "#docs" },
];

describe("SiteHeader", () => {
  it("renders without crashing", () => {
    render(<SiteHeader />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  it("renders navigation links", () => {
    render(<SiteHeader navigation={defaultNavigation} />);
    expect(
      screen.getByRole("link", { name: "Components" })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Docs" })).toBeInTheDocument();
  });

  it("navigation landmark has accessible label", () => {
    render(<SiteHeader navigation={defaultNavigation} />);
    expect(
      screen.getByRole("navigation", { name: "Main navigation" })
    ).toBeInTheDocument();
  });

  it("renders custom actions slot", () => {
    render(<SiteHeader actions={<button>Custom Action</button>} />);
    expect(
      screen.getByRole("button", { name: "Custom Action" })
    ).toBeInTheDocument();
  });

  it("renders default sign-in and get-started actions when no actions prop provided", () => {
    render(<SiteHeader />);
    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Get Started" })
    ).toBeInTheDocument();
  });

  it("forwards ref correctly", () => {
    const ref = { current: null };
    render(<SiteHeader ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });
});

describeA11y("SiteHeader", () => {
  commonA11yTests.passesAudit(() => <SiteHeader />);

  it("passes audit with navigation", async () => {
    const { container } = render(
      <SiteHeader
        logo={<a href="/">Wylie Dog</a>}
        navigation={defaultNavigation}
      />
    );
    await expectToPassA11yAudit(container);
  });

  it("passes audit with transparent variant", async () => {
    const { container } = render(
      <SiteHeader variant="transparent" navigation={defaultNavigation} />
    );
    await expectToPassA11yAudit(container);
  });
});

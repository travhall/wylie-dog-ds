import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import {
  describeA11y,
  commonA11yTests,
  expectToPassA11yAudit,
} from "../lib/test-utils";
import { SectionHero } from "../compositions/section-hero";

describe("SectionHero", () => {
  it("renders without crashing", () => {
    render(<SectionHero title="Hello World" />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("renders title as h1", () => {
    render(<SectionHero title="Hero Title" />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Hero Title" })
    ).toBeInTheDocument();
  });

  it("section is a landmark labelled by its h1", () => {
    render(<SectionHero title="Hero Title" />);
    expect(
      screen.getByRole("region", { name: "Hero Title" })
    ).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(<SectionHero title="Title" description="Hero description" />);
    expect(screen.getByText("Hero description")).toBeInTheDocument();
  });

  it("renders primary action as a link when href is provided", () => {
    render(
      <SectionHero
        title="Title"
        primaryAction={{ label: "Get Started", href: "#start" }}
      />
    );
    const link = screen.getByRole("link", { name: "Get Started" });
    expect(link).toHaveAttribute("href", "#start");
  });

  it("renders primary action as a button when onClick is provided", () => {
    render(
      <SectionHero
        title="Title"
        primaryAction={{ label: "Get Started", onClick: () => {} }}
      />
    );
    expect(
      screen.getByRole("button", { name: "Get Started" })
    ).toBeInTheDocument();
  });

  it("renders secondary action as a link when href is provided", () => {
    render(
      <SectionHero
        title="Title"
        secondaryAction={{ label: "Learn More", href: "#learn" }}
      />
    );
    const link = screen.getByRole("link", { name: "Learn More" });
    expect(link).toHaveAttribute("href", "#learn");
  });

  it("forwards ref correctly", () => {
    const ref = { current: null };
    render(<SectionHero ref={ref} title="Title" />);
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });
});

describeA11y("SectionHero", () => {
  commonA11yTests.passesAudit(() => <SectionHero title="Hero Title" />);

  it("passes audit with all props", async () => {
    const { container } = render(
      <SectionHero
        title="Complete Hero"
        description="A full hero section"
        badge="New"
        primaryAction={{ label: "Get Started", href: "#start" }}
        secondaryAction={{ label: "Learn More", href: "#learn" }}
      />
    );
    await expectToPassA11yAudit(container);
  });

  it("passes audit with centered variant", async () => {
    const { container } = render(
      <SectionHero
        variant="centered"
        title="Centered Hero"
        primaryAction={{ label: "Go", href: "#" }}
      />
    );
    await expectToPassA11yAudit(container);
  });
});

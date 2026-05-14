import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import {
  describeA11y,
  commonA11yTests,
  expectToPassA11yAudit,
} from "../lib/test-utils";
import { SectionFeatures } from "../compositions/section-features";

const defaultFeatures = [
  { title: "Feature One", description: "Description one" },
  { title: "Feature Two", description: "Description two" },
];

describe("SectionFeatures", () => {
  it("renders without crashing", () => {
    render(<SectionFeatures features={defaultFeatures} />);
    expect(screen.getByText("Feature One")).toBeInTheDocument();
  });

  it("renders all feature titles", () => {
    render(<SectionFeatures features={defaultFeatures} />);
    defaultFeatures.forEach(({ title }) => {
      expect(screen.getByText(title)).toBeInTheDocument();
    });
  });

  it("renders section title as h2", () => {
    render(<SectionFeatures title="Our Features" features={defaultFeatures} />);
    expect(
      screen.getByRole("heading", { level: 2, name: "Our Features" })
    ).toBeInTheDocument();
  });

  it("section is a landmark when title is provided", () => {
    render(<SectionFeatures title="Our Features" features={defaultFeatures} />);
    expect(
      screen.getByRole("region", { name: "Our Features" })
    ).toBeInTheDocument();
  });

  it("renders feature badges when provided", () => {
    render(
      <SectionFeatures
        features={[{ title: "Feature", description: "Desc", badge: "New" }]}
      />
    );
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("forwards ref correctly", () => {
    const ref = { current: null };
    render(<SectionFeatures ref={ref} features={defaultFeatures} />);
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });
});

describeA11y("SectionFeatures", () => {
  commonA11yTests.passesAudit(() => (
    <SectionFeatures title="Our Features" features={defaultFeatures} />
  ));

  it("passes audit with cards variant", async () => {
    const { container } = render(
      <SectionFeatures
        variant="cards"
        title="Card Features"
        features={defaultFeatures}
      />
    );
    await expectToPassA11yAudit(container);
  });

  it("passes audit with feature icons", async () => {
    const { container } = render(
      <SectionFeatures
        title="Features with Icons"
        features={[
          {
            title: "Feature",
            description: "Desc",
            icon: <svg aria-hidden="true" />,
          },
        ]}
      />
    );
    await expectToPassA11yAudit(container);
  });
});

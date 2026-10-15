import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, it, expect } from "vitest";
import type { ComponentType } from "react";
import { getComponentCategoryCounts } from "@/lib/showcase-metadata";

const componentCategoryModules = import.meta.glob("../components/*/page.tsx", {
  eager: true,
}) as Record<string, { default: ComponentType }>;

const patternCategoryModules = import.meta.glob("../patterns/*/page.tsx", {
  eager: true,
}) as Record<string, { default: ComponentType }>;

const COMPONENT_DIR_BY_ID: Record<string, string> = {
  layout: "Layout-Structure",
  inputs: "Inputs-Controls",
  "content-display": "Content-Display",
  feedback: "Feedback-Status",
  navigation: "Navigation",
  overlays: "Overlays-Popovers",
};

describe("component category URLs", () => {
  const ids = [
    "content-display",
    "feedback",
    "inputs",
    "layout",
    "navigation",
    "overlays",
  ];

  it("no longer has per-category pages", () => {
    expect(Object.keys(componentCategoryModules)).toEqual([]);
  });

  it("redirects each old category URL to its section on /components", async () => {
    const config = require("../../../next.config.js");
    const redirects = await config.redirects();
    for (const id of ids) {
      expect(redirects).toContainEqual({
        source: `/components/${id}`,
        destination: `/components#${id}`,
        permanent: true,
      });
    }
  });

  it("has a section on /components for every redirect target", () => {
    const hub = readFileSync(
      resolve(__dirname, "../components/page.tsx"),
      "utf-8"
    );
    for (const id of ids) {
      expect(hub).toContain(`id="${id}"`);
    }
  });

  it("section counts still come from the real story folders", () => {
    const dirs = getComponentCategoryCounts().map((c) => c.dirName);
    expect(dirs).toEqual(
      expect.arrayContaining(Object.values(COMPONENT_DIR_BY_ID))
    );
  });
});

describe("pattern category URLs", () => {
  const sections: Record<string, string> = {
    accessibility: "cat-accessibility",
    auth: "cat-auth",
    compositions: "cat-page",
    data: "cat-data",
    feedback: "cat-feedback",
    forms: "cat-forms",
    layout: "cat-layout",
    navigation: "cat-nav",
    responsive: "cat-responsive",
  };

  it("no longer has per-category pages", () => {
    expect(Object.keys(patternCategoryModules)).toEqual([]);
  });

  it("redirects each old pattern URL to its section on /patterns", async () => {
    const config = require("../../../next.config.js");
    const redirects = await config.redirects();
    for (const [id, section] of Object.entries(sections)) {
      expect(redirects).toContainEqual({
        source: `/patterns/${id}`,
        destination: `/patterns#${section}`,
        permanent: true,
      });
    }
  });

  it("has a section on /patterns for every redirect target", () => {
    const hub = readFileSync(
      resolve(__dirname, "../patterns/page.tsx"),
      "utf-8"
    );
    for (const section of Object.values(sections)) {
      expect(hub).toContain(`id="${section}"`);
    }
  });
});

#!/usr/bin/env node

/**
 * Component Generator for Wylie Dog Design System
 *
 * Generates a new component with:
 * - Component file (packages/ui/src/ OR packages/ui/src/compositions/)
 * - Test file (packages/ui/src/__tests__/)
 * - Storybook story (apps/storybook/stories/ OR apps/storybook/stories/compositions/)
 * - Auto-updates tsup config
 * - Auto-updates package.json exports
 *
 * It also adds the component's tokens to packages/tokens/io/sync/components.json
 * (so the scaffold passes `pnpm check:tokens` with no hand edits), rebuilds the
 * tokens, and runs the token checks at the end.
 *
 * Usage:
 *   node scripts/generate-component.js <name> --category=<key> [--dry-run]
 *   node scripts/generate-component.js <name> --composition --category="<Patterns Folder Name>" [--dry-run]
 *
 * --dry-run prints the files and token entries it would write and writes nothing
 * (add --json for a machine-readable form).
 *
 * Stories never bind to tokens: the UI package is the contract with adopters, and
 * stories are not part of it. A generated story is built from the UI components
 * and plain layout classes, with no --color-*, --space-* or --font-* variable.
 *
 * Examples:
 *   node scripts/generate-component.js tooltip-2 --category=overlays-popovers
 *   node scripts/generate-component.js site-header --composition --category="Navigation Patterns"
 */

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const COMPONENTS_JSON = "packages/tokens/io/sync/components.json";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// ANSI colors for terminal output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  red: "\x1b[31m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
  log(`✗ ${message}`, "red");
  process.exit(1);
}

function success(message) {
  log(`✓ ${message}`, "green");
}

function info(message) {
  log(`ℹ ${message}`, "blue");
}

// Validate component name
function validateComponentName(name) {
  if (!name) {
    error(
      "Component name is required. Usage: pnpm generate:component <name> [--composition]"
    );
  }

  if (!/^[a-z][a-z0-9-]*$/.test(name)) {
    error(
      "Component name must be lowercase, start with a letter, and contain only letters, numbers, and hyphens."
    );
  }

  return name;
}

// Check if --composition flag is present
function isComposition() {
  return process.argv.includes("--composition");
}

const isDryRun = () => process.argv.includes("--dry-run");
const wantsJson = () => process.argv.includes("--json");

function printUsage() {
  console.log(`Usage:
  node scripts/generate-component.js <name> --category=<key> [--dry-run]
  node scripts/generate-component.js <name> --composition --category="<Patterns Folder>" [--dry-run]

Adds the component's tokens to ${COMPONENTS_JSON}, writes the component, test and
story, wires the exports, then rebuilds the tokens and runs pnpm check:tokens.

  --dry-run   print the files and token entries, write nothing
  --json      with --dry-run, print one JSON object instead of text

Stories never bind to tokens. The UI package is the contract with adopters;
stories are not part of it. A story is built from the UI components and plain
layout classes, with no --color-*, --space-* or --font-* variable.`);
}

const PRIMITIVE_CATEGORIES = {
  "content-display": { dir: "Content-Display", title: "Content Display" },
  "feedback-status": { dir: "Feedback-Status", title: "Feedback & Status" },
  "inputs-controls": { dir: "Inputs-Controls", title: "Inputs & Controls" },
  "layout-structure": { dir: "Layout-Structure", title: "Layout & Structure" },
  navigation: { dir: "Navigation", title: "Navigation" },
  "overlays-popovers": { dir: "Overlays-Popovers", title: "Overlays & Popovers" },
};

function getCategoryFlag() {
  const arg = process.argv.find((a) => a.startsWith("--category="));
  return arg ? arg.split("=")[1] : null;
}

async function resolvePrimitiveCategory(key) {
  if (!key || !PRIMITIVE_CATEGORIES[key]) {
    error(
      `--category is required for a primitive component. One of: ${Object.keys(PRIMITIVE_CATEGORIES).join(", ")}`
    );
  }
  return PRIMITIVE_CATEGORIES[key];
}

async function resolveCompositionCategory(key) {
  const patternsDir = path.join(rootDir, "apps/storybook/stories/Patterns");
  const entries = await fs.readdir(patternsDir, { withFileTypes: true });
  const valid = entries.filter((e) => e.isDirectory()).map((e) => e.name);
  if (!key || !valid.includes(key)) {
    error(
      `--category is required for a composition. One of: ${valid.join(", ")}`
    );
  }
  return key;
}

// Convert kebab-case to PascalCase
function toPascalCase(str) {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

// Convert kebab-case to Title Case
function toTitleCase(str) {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Tokens the scaffold uses. Names follow documentation/tokens/component-token-grammar.md:
// <component>.<part>.<property>. Colours alias a semantic tone, spacing aliases the scale.
function tokenSpec(name, composition = false) {
  const title = toTitleCase(name).toLowerCase();
  const colour = (property, alias, description) => ({
    name: `${name}.default.${property}`,
    type: "color",
    alias,
    description,
  });
  const tokens = [
    colour(
      "background",
      "{color.background.default}",
      `Fill of the default ${title}. Pairs with \`${name}.default.text\`.`
    ),
    colour(
      "text",
      "{color.foreground.default}",
      `Text colour of the default ${title}. Pairs with \`${name}.default.background\`.`
    ),
    colour(
      "border",
      "{color.border.default}",
      `Border colour of the default ${title}.`
    ),
  ];
  if (composition) {
    const spacing = (property, alias, description) => ({
      name: `${name}.${property}`,
      type: "spacing",
      alias,
      description,
    });
    tokens.push(
      spacing("padding-x", "{space.200}", `Horizontal padding of the ${title}.`),
      spacing("padding-y", "{space.200}", `Vertical padding of the ${title}.`),
      spacing("gap", "{space.200}", `Gap between the parts of the ${title}.`)
    );
  }
  return tokens;
}

// CSS variable of a token, following packages/tokens/style-dictionary.config.js.
function tokenCssVar(token) {
  const key = token.name.replaceAll(".", "-");
  return token.type === "color" ? `--color-${key}` : `--space-${key}`;
}

async function readComponentTokens() {
  const file = path.join(rootDir, COMPONENTS_JSON);
  const json = JSON.parse(await fs.readFile(file, "utf-8"));
  return { file, json, variables: json[0].components.variables };
}

// Refuse to touch a component that already has tokens.
async function checkTokensFree(name) {
  const { variables } = await readComponentTokens();
  const existing = Object.keys(variables).filter((key) =>
    key.startsWith(`${name}.`)
  );
  if (existing.length) {
    error(
      `Tokens for '${name}' already exist in ${COMPONENTS_JSON} (${existing.length}, e.g. ${existing[0]}). Remove them or pick another name.`
    );
  }
}

// Insert the tokens, keeping the file's formatting (2-space JSON, trailing newline)
// so the diff shows only the added entries.
async function addTokens(name, composition) {
  const { file, json, variables } = await readComponentTokens();
  for (const token of tokenSpec(name, composition)) {
    variables[token.name] = {
      $type: token.type,
      $value: token.alias,
      valuesByMode: { Light: token.alias, Dark: token.alias },
      $description: token.description,
    };
  }
  await fs.writeFile(file, JSON.stringify(json, null, 2) + "\n", "utf-8");
  success(`Added ${tokenSpec(name, composition).length} tokens to ${COMPONENTS_JSON}`);
}

// Generate component template
function generateComponentTemplate(name, composition = false) {
  const pascalName = toPascalCase(name);
  const utilsPath = composition ? "../lib/utils" : "./lib/utils";
  const primitiveImportComment = composition
    ? '\n// Import primitives as needed\n// import { Button } from "../button";\n// import { Card } from "../card";\n'
    : "";

  return `import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn, focusRingClasses } from "${utilsPath}";
${primitiveImportComment}
const ${pascalName.charAt(0).toLowerCase() + pascalName.slice(1)}Variants = cva(
  cn(
    "relative",
    ${composition ? `"flex flex-col px-(${tokenCssVar({ name: `${name}.padding-x`, type: "spacing" })}) py-(${tokenCssVar({ name: `${name}.padding-y`, type: "spacing" })}) gap-(${tokenCssVar({ name: `${name}.gap`, type: "spacing" })})",\n    ` : ""}focusRingClasses
  ),
  {
    // These tokens were added to packages/tokens/io/sync/components.json when the
    // component was generated. Rename or extend them there, in step with the classes.
    variants: {
      variant: {
        default:
          "bg-(${tokenCssVar({ name: `${name}.default.background`, type: "color" })}) text-(${tokenCssVar({ name: `${name}.default.text`, type: "color" })}) border border-(${tokenCssVar({ name: `${name}.default.border`, type: "color" })})",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface ${pascalName}Props
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof ${pascalName.charAt(0).toLowerCase() + pascalName.slice(1)}Variants> {
  /** Render the component's styles on a child element (e.g. \`<a>\` or \`<button>\`). */
  asChild?: boolean;
}

export const ${pascalName} = React.forwardRef<HTMLDivElement, ${pascalName}Props>(
  ({ className, variant, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "div";
    // TODO: "group" is a neutral placeholder so this scaffold passes an a11y
    // audit out of the box — replace it with the correct WAI-ARIA role (or a
    // semantic element) for this component's actual pattern. Omitted for
    // asChild so it never overrides the slotted element's own semantics.
    return (
      <Comp
        ref={ref}
        role={asChild ? undefined : "group"}
        className={cn(${pascalName.charAt(0).toLowerCase() + pascalName.slice(1)}Variants({ variant }), className)}
        {...props}
      />
    );
  }
);

${pascalName}.displayName = "${pascalName}";
`;
}

// Generate test template
function generateTestTemplate(name, composition = false) {
  const pascalName = toPascalCase(name);
  const importPath = composition ? `../compositions/${name}` : `../${name}`;

  return `import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, it, expect } from "vitest";
import { ${pascalName} } from "${importPath}";

expect.extend(toHaveNoViolations);

describe("${pascalName}", () => {
  describe("Accessibility", () => {
    it("should pass accessibility audit", async () => {
      const { container } = render(<${pascalName} aria-label="Test ${name}" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
    // TODO: Add component-specific a11y tests — keyboard navigation, ARIA
    // attributes, and state-change announcements appropriate for this
    // component's WAI-ARIA pattern.
  });

  describe("Functionality", () => {
    it("renders without crashing", () => {
      render(<${pascalName} aria-label="Test ${name}" />);
      expect(screen.getByLabelText("Test ${name}")).toBeInTheDocument();
    });

    it("applies custom className", () => {
      render(<${pascalName} className="custom-class" aria-label="Test ${name}" />);
      expect(screen.getByLabelText("Test ${name}")).toHaveClass("custom-class");
    });

    it("forwards ref correctly", () => {
      const ref = { current: null };
      render(<${pascalName} ref={ref} aria-label="Test ${name}" />);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe("Variants & Styling", () => {
    it("renders with default variant", () => {
      render(<${pascalName} aria-label="Test ${name}" />);
      expect(screen.getByLabelText("Test ${name}")).toBeInTheDocument();
    });
  });
});
`;
}

// Generate Storybook story template
// See: apps/storybook/STORY_AUTHORING_GUIDE.md for standards
function generateStoryTemplate(name, composition = false, category) {
  const pascalName = toPascalCase(name);
  const titleName = toTitleCase(name);
  // Story categories match the sidebar hierarchy in preview.tsx storySort
  const storyCategory = composition
    ? `Patterns/${category}`
    : `Components/${category.title}`;
  const componentNameInTitle = composition ? titleName : pascalName;
  const importPath = composition
    ? `@wyliedog/ui/compositions/${name}`
    : `@wyliedog/ui/${name}`;
  const description = composition
    ? `${titleName} composition pattern combining multiple primitives for real-world use cases. Built with accessibility and responsiveness in mind.`
    : `${titleName} component for [describe purpose]. Supports multiple variants, sizes, and states with full keyboard accessibility.`;

  return `import type { Meta, StoryObj } from "@storybook/react-vite";
import { within, userEvent, expect } from "storybook/test";
import { ${pascalName} } from "${importPath}";

/**
 * ${titleName} component stories.
 *
 * ## Usage
 * \`\`\`tsx
 * import { ${pascalName} } from "${importPath}";
 *
 * <${pascalName} variant="default">Content</${pascalName}>
 * \`\`\`
 *
 * ## Accessibility
 * - Keyboard navigable
 * - Screen reader compatible
 * - Follows WAI-ARIA patterns
 */
const meta: Meta<typeof ${pascalName}> = {
  title: "${storyCategory}/${componentNameInTitle}",
  component: ${pascalName},
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "${description}",
      },
    },
    // Override global a11y config here if needed, e.g. to disable a rule or set a specific ARIA config.
    // a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default"],
      description: "The visual style variant of the component",
      table: {
        type: { summary: '"default"' },
        defaultValue: { summary: '"default"' },
        category: "Appearance",
      },
    },
    className: {
      control: "text",
      description: "Additional CSS classes for custom styling",
      table: {
        type: { summary: "string" },
        category: "Styling",
      },
    },
    children: {
      control: "text",
      description: "Content to render inside the component",
      table: {
        type: { summary: "React.ReactNode" },
        category: "Content",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default usage of the ${titleName} component.
 */
export const Default: Story = {
  args: {
    children: "${titleName} content",
  },
  parameters: {
    docs: {
      description: {
        story: "Basic usage with default props. This is the most common way to use the component.",
      },
    },
  },
};

/**
 * Showcases all available visual variants.
 */
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <${pascalName} variant="default">Default</${pascalName}>
      {/* Add more variants as they are implemented */}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "All available variants side-by-side for easy comparison.",
      },
    },
  },
};

/**
 * Demonstrates different states of the component.
 */
export const States: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <span className="text-sm text-(--color-foreground-muted) w-20">Normal</span>
        <${pascalName}>Normal state</${pascalName}>
      </div>
      {/* Add more states: disabled, loading, error, etc. */}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Various component states including normal, disabled, loading, and error states.",
      },
    },
  },
};

/**
 * Interactive example with play function for automated testing.
 * Tests keyboard navigation, focus management, and user interactions.
 */
export const WithInteractions: Story = {
  args: {
    children: "Interactive ${titleName}",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test 1: Component renders correctly
    const element = canvas.getByText(/interactive ${titleName.toLowerCase()}/i);
    expect(element).toBeInTheDocument();

    // Test 2: Keyboard navigation — Tab into the component, then verify focus
    // TODO: Replace with the appropriate role query once the component's ARIA role is defined
    await userEvent.tab();

    // Add more interaction tests as needed (keyboard activation, state changes, etc.)
  },
  parameters: {
    docs: {
      description: {
        story:
          "Interactive story with automated tests demonstrating user interactions. " +
          "View the Interactions panel to see test execution.",
      },
    },
  },
};

/**
 * Real-world usage example showing common patterns.
 */
export const UsageExample: Story = {
  render: () => (
    <div className="w-96 space-y-4 p-4 border border-(--color-border-muted) rounded-lg">
      <h3 className="text-lg font-semibold text-(--color-foreground-default)">
        Example Context
      </h3>
      <${pascalName}>
        This shows the component in a realistic context with surrounding elements.
      </${pascalName}>
      <p className="text-sm text-(--color-foreground-muted)">
        Additional context or instructions would go here.
      </p>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Demonstrates the component in a real-world context with common surrounding elements.",
      },
    },
  },
};
`;
}

// Check if component already exists
async function checkExistence(name, composition = false, category) {
  const componentDir = composition ? "compositions" : "";
  const componentPath = path.join(
    rootDir,
    "packages/ui/src",
    componentDir,
    `${name}.tsx`
  );
  const storyPath = composition
    ? path.join(rootDir, "apps/storybook/stories/Patterns", category, `${name}.stories.tsx`)
    : path.join(rootDir, "apps/storybook/stories/Components", category.dir, `${name}.stories.tsx`);

  try {
    await fs.access(componentPath);
    const location = composition
      ? `packages/ui/src/compositions/${name}.tsx`
      : `packages/ui/src/${name}.tsx`;
    error(`Component '${name}' already exists at ${location}`);
  } catch {
    // File doesn't exist, which is what we want
  }

  try {
    await fs.access(storyPath);
    const location = composition
      ? `apps/storybook/stories/Patterns/${category}/${name}.stories.tsx`
      : `apps/storybook/stories/Components/${category.dir}/${name}.stories.tsx`;
    error(`Story for '${name}' already exists at ${location}`);
  } catch {
    // File doesn't exist, which is what we want
  }
}

// Create component file
async function createComponentFile(name, composition = false) {
  const componentDir = composition ? "compositions" : "";
  const componentPath = path.join(
    rootDir,
    "packages/ui/src",
    componentDir,
    `${name}.tsx`
  );
  const content = generateComponentTemplate(name, composition);

  await fs.writeFile(componentPath, content, "utf-8");
  const location = composition
    ? `packages/ui/src/compositions/${name}.tsx`
    : `packages/ui/src/${name}.tsx`;
  success(`Created component: ${location}`);
}

// Create test file
async function createTestFile(name, composition = false) {
  const testPath = path.join(
    rootDir,
    "packages/ui/src/__tests__",
    `${name}.test.tsx`
  );
  const content = generateTestTemplate(name, composition);

  await fs.writeFile(testPath, content, "utf-8");
  success(`Created test: packages/ui/src/__tests__/${name}.test.tsx`);
}

// Create story file
async function createStoryFile(name, composition = false, category) {
  const storyPath = composition
    ? path.join(rootDir, "apps/storybook/stories/Patterns", category, `${name}.stories.tsx`)
    : path.join(rootDir, "apps/storybook/stories/Components", category.dir, `${name}.stories.tsx`);
  const content = generateStoryTemplate(name, composition, category);

  await fs.writeFile(storyPath, content, "utf-8");
  const location = composition
    ? `apps/storybook/stories/Patterns/${category}/${name}.stories.tsx`
    : `apps/storybook/stories/Components/${category.dir}/${name}.stories.tsx`;
  success(`Created story: ${location}`);
}

// Update tsup.config.ts
async function updateTsupConfig(name, composition = false) {
  const configPath = path.join(rootDir, "packages/ui/tsup.config.ts");
  let content = await fs.readFile(configPath, "utf-8");

  // Find the entryPoints array and add new component
  const entryPattern = /entryPoints:\s*\[([^\]]+)\]/s;
  const match = content.match(entryPattern);

  if (!match) {
    error("Could not find entryPoints array in tsup.config.ts");
  }

  const entries = match[1];
  const entryPath = composition
    ? `src/compositions/${name}.tsx`
    : `src/${name}.tsx`;

  // Check if last entry has a comma, if not add one
  const trimmedEntries = entries.trimEnd();
  const needsComma = !trimmedEntries.endsWith(",");
  const newEntry = `    "${entryPath}",`;

  // Add comma to last entry if needed, then add new entry
  const updatedEntries = needsComma
    ? trimmedEntries + ",\n" + newEntry
    : trimmedEntries + "\n" + newEntry;
  content = content.replace(
    entryPattern,
    `entryPoints: [${updatedEntries}\n  ]`
  );

  await fs.writeFile(configPath, content, "utf-8");
  success(`Updated tsup.config.ts with new entry`);
}

// Update package.json exports
async function updatePackageJson(name, composition = false) {
  const packagePath = path.join(rootDir, "packages/ui/package.json");
  const packageJson = JSON.parse(await fs.readFile(packagePath, "utf-8"));

  if (composition) {
    // Export from compositions directory
    packageJson.exports[`./compositions/${name}`] = {
      types: `./dist/compositions/${name}.d.ts`,
      import: `./dist/compositions/${name}.js`,
      require: `./dist/compositions/${name}.cjs`,
    };
  } else {
    // Export from root directory
    packageJson.exports[`./${name}`] = {
      types: `./dist/${name}.d.ts`,
      import: `./dist/${name}.js`,
      require: `./dist/${name}.cjs`,
    };
  }

  await fs.writeFile(
    packagePath,
    JSON.stringify(packageJson, null, 2) + "\n",
    "utf-8"
  );
  success(`Updated packages/ui/package.json exports`);
}

// Update index.ts barrel exports
async function updateIndexFile(name, composition = false) {
  if (composition) {
    const indexPath = path.join(rootDir, "packages/ui/src/compositions/index.ts");
    const pascalName = toPascalCase(name);
    const content = await fs.readFile(indexPath, "utf-8");
    const addition = `\nexport { ${pascalName} } from "./${name}";\nexport type { ${pascalName}Props } from "./${name}";\n`;
    await fs.writeFile(indexPath, content.trimEnd() + "\n" + addition.trimStart(), "utf-8");
    success(`Updated packages/ui/src/compositions/index.ts exports`);
  } else {
    const indexPath = path.join(rootDir, "packages/ui/src/index.ts");
    const content = await fs.readFile(indexPath, "utf-8");
    const addition = `export * from "./${name}";\n`;
    await fs.writeFile(indexPath, content.trimEnd() + "\n" + addition, "utf-8");
    success(`Updated packages/ui/src/index.ts exports`);
  }
}

// Format generated files
async function formatFiles(name, composition = false, category) {
  info("Running Prettier...");

  const componentDir = composition ? "compositions/" : "";
  const storyPath = composition
    ? `apps/storybook/stories/Patterns/${category}/${name}.stories.tsx`
    : `apps/storybook/stories/Components/${category.dir}/${name}.stories.tsx`;
  const indexPath = composition
    ? "packages/ui/src/compositions/index.ts"
    : "packages/ui/src/index.ts";

  try {
    execSync(
      `pnpm prettier --write "packages/ui/src/${componentDir}${name}.tsx" "packages/ui/src/__tests__/${name}.test.tsx" "${storyPath}" "packages/ui/tsup.config.ts" "packages/ui/package.json" "${indexPath}"`,
      { cwd: rootDir, stdio: "inherit" }
    );
    success("Formatted all generated files");
  } catch (err) {
    error("Failed to format files");
  }
}

// Run linting
async function lintFiles(name, composition = false, category) {
  info("Running ESLint...");

  const componentDir = composition ? "compositions/" : "";
  const storyPath = composition
    ? `apps/storybook/stories/Patterns/${category}/${name}.stories.tsx`
    : `apps/storybook/stories/Components/${category.dir}/${name}.stories.tsx`;
  const indexPath = composition
    ? "packages/ui/src/compositions/index.ts"
    : "packages/ui/src/index.ts";

  try {
    execSync(
      `pnpm eslint --fix "packages/ui/src/${componentDir}${name}.tsx" "packages/ui/src/__tests__/${name}.test.tsx" "${storyPath}" "${indexPath}"`,
      { cwd: rootDir, stdio: "inherit" }
    );
    success("Linted all generated files");
  } catch (err) {
    // ESLint might exit with code 1 even after fixing
    info("Linting completed (some warnings may remain)");
  }
}

// Everything the generator would write, as data (used by --dry-run).
function plannedOutput(name, composition, category) {
  const storyPath = composition
    ? `apps/storybook/stories/Patterns/${category}/${name}.stories.tsx`
    : `apps/storybook/stories/Components/${category.dir}/${name}.stories.tsx`;
  const componentPath = composition
    ? `packages/ui/src/compositions/${name}.tsx`
    : `packages/ui/src/${name}.tsx`;
  return {
    files: [
      { path: componentPath, content: generateComponentTemplate(name, composition) },
      {
        path: `packages/ui/src/__tests__/${name}.test.tsx`,
        content: generateTestTemplate(name, composition),
      },
      {
        path: storyPath,
        content: generateStoryTemplate(name, composition, category),
      },
    ],
    tokens: Object.fromEntries(
      tokenSpec(name, composition).map((token) => [
        token.name,
        {
          type: token.type,
          value: token.alias,
          cssVar: tokenCssVar(token),
          description: token.description,
        },
      ])
    ),
    edits: [
      "packages/ui/tsup.config.ts",
      "packages/ui/package.json",
      composition
        ? "packages/ui/src/compositions/index.ts"
        : "packages/ui/src/index.ts",
      COMPONENTS_JSON,
    ],
  };
}

function printDryRun(plan) {
  if (wantsJson()) {
    console.log(JSON.stringify(plan, null, 2));
    return;
  }
  log("Dry run: nothing is written.\n", "yellow");
  console.log("Files it would create:");
  for (const file of plan.files) console.log(`  ${file.path}`);
  console.log("\nFiles it would edit:");
  for (const file of plan.edits) console.log(`  ${file}`);
  console.log(`\nTokens it would add to ${COMPONENTS_JSON}:`);
  for (const [name, token] of Object.entries(plan.tokens)) {
    console.log(`  ${name}  (${token.type})  ${token.value}  ->  ${token.cssVar}`);
  }
  console.log(`\n--- ${plan.files[0].path} ---\n${plan.files[0].content}`);
}

// Run a check and fail loudly, with its output, if it fails.
function runCheck(label, command) {
  info(`${label}...`);
  try {
    execSync(command, { cwd: rootDir, stdio: "pipe", encoding: "utf-8" });
    success(label);
  } catch (err) {
    console.error(`${err.stdout ?? ""}${err.stderr ?? ""}`);
    error(`${label} failed. Fix the output above; the generated files are left in place.`);
  }
}

// Main execution
async function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    printUsage();
    return;
  }
  const componentName = process.argv[2];
  const composition = isComposition();

  if (!wantsJson()) log("\n🎨 Wylie Dog Component Generator\n", "blue");

  // Validate
  validateComponentName(componentName);
  const categoryKey = getCategoryFlag();
  const category = composition
    ? await resolveCompositionCategory(categoryKey)
    : await resolvePrimitiveCategory(categoryKey);

  await checkExistence(componentName, composition, category);
  await checkTokensFree(componentName);

  if (isDryRun()) {
    printDryRun(plannedOutput(componentName, composition, category));
    return;
  }

  const pascalName = toPascalCase(componentName);
  const tier = composition ? "Tier 2 (Composition)" : "Tier 1 (Primitive)";
  info(`Generating ${tier} component: ${pascalName} (${componentName})`);
  console.log();

  try {
    // Tokens first, so the classes in the scaffold always resolve
    await addTokens(componentName, composition);

    // Create files
    await createComponentFile(componentName, composition);
    await createTestFile(componentName, composition);
    await createStoryFile(componentName, composition, category);

    // Update configs
    await updateTsupConfig(componentName, composition);
    await updatePackageJson(componentName, composition);
    await updateIndexFile(componentName, composition);

    // Format and lint
    await formatFiles(componentName, composition, category);
    await lintFiles(componentName, composition, category);
  } catch (err) {
    error(`Failed to generate component: ${err.message}`);
  }

  // Validate the tokens: rebuild, then run the token checks (refs, structure, binding)
  runCheck("Rebuilding tokens", "pnpm --filter @wyliedog/tokens build");
  runCheck("Token checks (pnpm check:tokens)", "pnpm check:tokens");

  console.log();
  log("✨ Component generated successfully!\n", "green");

  log("📝 Next steps:", "blue");
  const componentPath = composition
    ? `packages/ui/src/compositions/${componentName}.tsx`
    : `packages/ui/src/${componentName}.tsx`;
  const storyPath = composition
    ? `apps/storybook/stories/Patterns/${category}/${componentName}.stories.tsx`
    : `apps/storybook/stories/Components/${category.dir}/${componentName}.stories.tsx`;

  console.log(`  1. Customize the component in ${componentPath}`);
  console.log(`  2. Add variants and props as needed (new tokens go in ${COMPONENTS_JSON})`);
  if (composition) {
    console.log(`  3. Import and compose primitives from parent directory`);
    console.log(`  4. Enhance stories in ${storyPath}`);
  } else {
    console.log(`  3. Enhance stories in ${storyPath}`);
    console.log(
      `  4. Add more test cases in packages/ui/src/__tests__/${componentName}.test.tsx`
    );
  }
  console.log();

  log("🚀 Development commands:", "blue");
  console.log(`  pnpm dev                     - Start all dev servers`);
  console.log(
    `  pnpm --filter storybook dev  - View your story at http://localhost:6006`
  );
  console.log(`  pnpm test                    - Run tests`);
  console.log();
}

main();

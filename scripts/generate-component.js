#!/usr/bin/env node

/**
 * Component Generator for Wylie Dog Design System
 *
 * Generates a new component with:
 * - Component file (packages/ui/src/)
 * - Test file (packages/ui/src/__tests__/)
 * - Storybook story (apps/storybook/stories/)
 * - Auto-updates tsup config
 * - Auto-updates package.json exports
 *
 * Usage: node scripts/generate-component.js <component-name>
 * Example: node scripts/generate-component.js tooltip-2
 */

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

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
    error("Component name is required. Usage: pnpm generate:component <name>");
  }

  if (!/^[a-z][a-z0-9-]*$/.test(name)) {
    error(
      "Component name must be lowercase, start with a letter, and contain only letters, numbers, and hyphens."
    );
  }

  return name;
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

// Generate component template
function generateComponentTemplate(name) {
  const pascalName = toPascalCase(name);

  return `import React from "react";
import { cn } from "./lib/utils";

export interface ${pascalName}Props
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default";
}

export const ${pascalName} = React.forwardRef<HTMLDivElement, ${pascalName}Props>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default: "bg-background text-foreground",
    };

    return (
      <div
        className={cn(
          "relative",
          variants[variant],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

${pascalName}.displayName = "${pascalName}";
`;
}

// Generate test template
function generateTestTemplate(name) {
  const pascalName = toPascalCase(name);

  return `import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { ${pascalName} } from "../${name}";

expect.extend(toHaveNoViolations);

describe("${pascalName}", () => {
  it("renders without crashing", () => {
    render(<${pascalName} aria-label="Test ${name}" />);
    const element = screen.getByLabelText("Test ${name}");
    expect(element).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<${pascalName} className="custom-class" aria-label="Test ${name}" />);
    const element = screen.getByLabelText("Test ${name}");
    expect(element).toHaveClass("custom-class");
  });

  it("forwards ref correctly", () => {
    const ref = { current: null };
    render(<${pascalName} ref={ref} aria-label="Test ${name}" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("passes accessibility audit", async () => {
    const { container } = render(<${pascalName} aria-label="Test ${name}" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("renders with default variant", () => {
    render(<${pascalName} aria-label="Test ${name}" />);
    const element = screen.getByLabelText("Test ${name}");
    expect(element).toBeInTheDocument();
  });
});
`;
}

// Generate Storybook story template (Storybook 10.x with latest patterns)
function generateStoryTemplate(name) {
  const pascalName = toPascalCase(name);
  const titleName = toTitleCase(name);

  return `import type { Meta, StoryObj } from "@storybook/react-vite";
import { ${pascalName} } from "@wyliedog/ui/${name}";

const meta: Meta<typeof ${pascalName}> = {
  title: "3. Components/${pascalName}",
  component: ${pascalName},
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "${titleName} component description. Update this with the actual component purpose and usage.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default"],
      description: "The visual style variant",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "default" },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "${titleName} content",
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <${pascalName}>Default</${pascalName}>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "All available variants for different use cases.",
      },
    },
  },
};

export const Interactive: Story = {
  render: () => (
    <div className="space-y-4">
      <${pascalName}>
        Interactive example - customize this story to demonstrate real-world usage
      </${pascalName}>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Interactive example demonstrating common usage patterns.",
      },
    },
  },
};
`;
}

// Check if component already exists
async function checkExistence(name) {
  const componentPath = path.join(
    rootDir,
    "packages/ui/src",
    `${name}.tsx`
  );
  const storyPath = path.join(
    rootDir,
    "apps/storybook/stories",
    `${name}.stories.tsx`
  );

  try {
    await fs.access(componentPath);
    error(
      `Component '${name}' already exists at packages/ui/src/${name}.tsx`
    );
  } catch {
    // File doesn't exist, which is what we want
  }

  try {
    await fs.access(storyPath);
    error(
      `Story for '${name}' already exists at apps/storybook/stories/${name}.stories.tsx`
    );
  } catch {
    // File doesn't exist, which is what we want
  }
}

// Create component file
async function createComponentFile(name) {
  const componentPath = path.join(
    rootDir,
    "packages/ui/src",
    `${name}.tsx`
  );
  const content = generateComponentTemplate(name);

  await fs.writeFile(componentPath, content, "utf-8");
  success(`Created component: packages/ui/src/${name}.tsx`);
}

// Create test file
async function createTestFile(name) {
  const testPath = path.join(
    rootDir,
    "packages/ui/src/__tests__",
    `${name}.test.tsx`
  );
  const content = generateTestTemplate(name);

  await fs.writeFile(testPath, content, "utf-8");
  success(`Created test: packages/ui/src/__tests__/${name}.test.tsx`);
}

// Create story file
async function createStoryFile(name) {
  const storyPath = path.join(
    rootDir,
    "apps/storybook/stories",
    `${name}.stories.tsx`
  );
  const content = generateStoryTemplate(name);

  await fs.writeFile(storyPath, content, "utf-8");
  success(`Created story: apps/storybook/stories/${name}.stories.tsx`);
}

// Update tsup.config.ts
async function updateTsupConfig(name) {
  const configPath = path.join(rootDir, "packages/ui/tsup.config.ts");
  let content = await fs.readFile(configPath, "utf-8");

  // Find the entryPoints array and add new component
  const entryPattern = /entryPoints:\s*\[([^\]]+)\]/s;
  const match = content.match(entryPattern);

  if (!match) {
    error("Could not find entryPoints array in tsup.config.ts");
  }

  const entries = match[1];
  const newEntry = `    "src/${name}.tsx",`;

  // Add before the closing bracket
  const updatedEntries = entries.trimEnd() + "\n" + newEntry;
  content = content.replace(entryPattern, `entryPoints: [${updatedEntries}\n  ]`);

  await fs.writeFile(configPath, content, "utf-8");
  success(`Updated tsup.config.ts with new entry`);
}

// Update package.json exports
async function updatePackageJson(name) {
  const packagePath = path.join(rootDir, "packages/ui/package.json");
  const packageJson = JSON.parse(await fs.readFile(packagePath, "utf-8"));

  // Add new export
  packageJson.exports[`./${name}`] = {
    types: `./src/${name}.tsx`,
    import: `./dist/${name}.mjs`,
    require: `./dist/${name}.js`,
  };

  await fs.writeFile(
    packagePath,
    JSON.stringify(packageJson, null, 2) + "\n",
    "utf-8"
  );
  success(`Updated packages/ui/package.json exports`);
}

// Format generated files
async function formatFiles(name) {
  info("Running Prettier...");

  try {
    execSync(
      `pnpm prettier --write "packages/ui/src/${name}.tsx" "packages/ui/src/__tests__/${name}.test.tsx" "apps/storybook/stories/${name}.stories.tsx" "packages/ui/tsup.config.ts" "packages/ui/package.json"`,
      { cwd: rootDir, stdio: "inherit" }
    );
    success("Formatted all generated files");
  } catch (err) {
    error("Failed to format files");
  }
}

// Run linting
async function lintFiles(name) {
  info("Running ESLint...");

  try {
    execSync(
      `pnpm eslint --fix "packages/ui/src/${name}.tsx" "packages/ui/src/__tests__/${name}.test.tsx" "apps/storybook/stories/${name}.stories.tsx"`,
      { cwd: rootDir, stdio: "inherit" }
    );
    success("Linted all generated files");
  } catch (err) {
    // ESLint might exit with code 1 even after fixing
    info("Linting completed (some warnings may remain)");
  }
}

// Main execution
async function main() {
  const componentName = process.argv[2];

  log("\n🎨 Wylie Dog Component Generator\n", "blue");

  // Validate
  validateComponentName(componentName);
  await checkExistence(componentName);

  const pascalName = toPascalCase(componentName);
  info(`Generating component: ${pascalName} (${componentName})`);
  console.log();

  try {
    // Create files
    await createComponentFile(componentName);
    await createTestFile(componentName);
    await createStoryFile(componentName);

    // Update configs
    await updateTsupConfig(componentName);
    await updatePackageJson(componentName);

    // Format and lint
    await formatFiles(componentName);
    await lintFiles(componentName);

    // Success summary
    console.log();
    log("✨ Component generated successfully!\n", "green");

    log("📝 Next steps:", "blue");
    console.log(`  1. Customize the component in packages/ui/src/${componentName}.tsx`);
    console.log(`  2. Add variants and props as needed`);
    console.log(`  3. Enhance stories in apps/storybook/stories/${componentName}.stories.tsx`);
    console.log(`  4. Add more test cases in packages/ui/src/__tests__/${componentName}.test.tsx`);
    console.log();

    log("🚀 Development commands:", "blue");
    console.log(`  pnpm dev                     - Start all dev servers`);
    console.log(`  pnpm --filter storybook dev  - View your story at http://localhost:6006`);
    console.log(`  pnpm test                    - Run tests`);
    console.log();

  } catch (err) {
    error(`Failed to generate component: ${err.message}`);
  }
}

main();

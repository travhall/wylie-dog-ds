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
 * Usage: 
 *   node scripts/generate-component.js <component-name>              # Tier 1 primitive
 *   node scripts/generate-component.js <component-name> --composition # Tier 2 composition
 * 
 * Examples: 
 *   node scripts/generate-component.js tooltip-2
 *   node scripts/generate-component.js site-header --composition
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
    error("Component name is required. Usage: pnpm generate:component <name> [--composition]");
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
  return process.argv.includes('--composition');
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
function generateComponentTemplate(name, composition = false) {
  const pascalName = toPascalCase(name);
  const importPath = composition ? "../lib/utils" : "./lib/utils";
  const primitiveImportComment = composition 
    ? '\n// Import primitives as needed\n// import { Button } from "../button";\n// import { Card } from "../card";\n' 
    : '';

  return `import React from "react";
import { cn } from "${importPath}";
${primitiveImportComment}
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
function generateTestTemplate(name, composition = false) {
  const pascalName = toPascalCase(name);
  const importPath = composition ? `../compositions/${name}` : `../${name}`;

  return `import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { ${pascalName} } from "${importPath}";

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

// Generate Storybook story template
function generateStoryTemplate(name, composition = false) {
  const pascalName = toPascalCase(name);
  const titleName = toTitleCase(name);
  const storyCategory = composition ? "4. Patterns" : "3. Components";
  const importPath = composition ? `@wyliedog/ui/compositions/${name}` : `@wyliedog/ui/${name}`;
  const description = composition
    ? `${titleName} composition pattern combining multiple primitives. This is a Tier 2 pattern component.`
    : `${titleName} component description. Update this with the actual component purpose and usage.`;

  return `import type { Meta, StoryObj } from "@storybook/react-vite";
import { ${pascalName} } from "${importPath}";

const meta: Meta<typeof ${pascalName}> = {
  title: "${storyCategory}/${pascalName}",
  component: ${pascalName},
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "${description}",
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
async function checkExistence(name, composition = false) {
  const componentDir = composition ? "compositions" : "";
  const componentPath = path.join(
    rootDir, 
    "packages/ui/src",
    componentDir,
    `${name}.tsx`
  );
  const storyDir = composition ? "compositions" : "";
  const storyPath = path.join(
    rootDir,
    "apps/storybook/stories",
    storyDir,
    `${name}.stories.tsx`
  );

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
      ? `apps/storybook/stories/compositions/${name}.stories.tsx`
      : `apps/storybook/stories/${name}.stories.tsx`;
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
async function createStoryFile(name, composition = false) {
  const storyDir = composition ? "compositions" : "";
  
  // Ensure directory exists
  if (composition) {
    const compositionsDir = path.join(rootDir, "apps/storybook/stories", "compositions");
    await fs.mkdir(compositionsDir, { recursive: true });
  }
  
  const storyPath = path.join(
    rootDir,
    "apps/storybook/stories",
    storyDir,
    `${name}.stories.tsx`
  );
  const content = generateStoryTemplate(name, composition);

  await fs.writeFile(storyPath, content, "utf-8");
  const location = composition
    ? `apps/storybook/stories/compositions/${name}.stories.tsx`
    : `apps/storybook/stories/${name}.stories.tsx`;
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
  const entryPath = composition ? `src/compositions/${name}.tsx` : `src/${name}.tsx`;

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
      types: `./src/compositions/${name}.tsx`,
      import: `./dist/compositions/${name}.mjs`,
      require: `./dist/compositions/${name}.js`,
    };
  } else {
    // Export from root directory
    packageJson.exports[`./${name}`] = {
      types: `./src/${name}.tsx`,
      import: `./dist/${name}.mjs`,
      require: `./dist/${name}.js`,
    };
  }

  await fs.writeFile(
    packagePath,
    JSON.stringify(packageJson, null, 2) + "\n",
    "utf-8"
  );
  success(`Updated packages/ui/package.json exports`);
}

// Format generated files
async function formatFiles(name, composition = false) {
  info("Running Prettier...");

  const componentDir = composition ? "compositions/" : "";
  const storyDir = composition ? "compositions/" : "";
  
  try {
    execSync(
      `pnpm prettier --write "packages/ui/src/${componentDir}${name}.tsx" "packages/ui/src/__tests__/${name}.test.tsx" "apps/storybook/stories/${storyDir}${name}.stories.tsx" "packages/ui/tsup.config.ts" "packages/ui/package.json"`,
      { cwd: rootDir, stdio: "inherit" }
    );
    success("Formatted all generated files");
  } catch (err) {
    error("Failed to format files");
  }
}

// Run linting
async function lintFiles(name, composition = false) {
  info("Running ESLint...");

  const componentDir = composition ? "compositions/" : "";
  const storyDir = composition ? "compositions/" : "";

  try {
    execSync(
      `pnpm eslint --fix "packages/ui/src/${componentDir}${name}.tsx" "packages/ui/src/__tests__/${name}.test.tsx" "apps/storybook/stories/${storyDir}${name}.stories.tsx"`,
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
  const composition = isComposition();

  log("\n🎨 Wylie Dog Component Generator\n", "blue");

  // Validate
  validateComponentName(componentName);
  await checkExistence(componentName, composition);

  const pascalName = toPascalCase(componentName);
  const tier = composition ? "Tier 2 (Composition)" : "Tier 1 (Primitive)";
  info(`Generating ${tier} component: ${pascalName} (${componentName})`);
  console.log();

  try {
    // Create files
    await createComponentFile(componentName, composition);
    await createTestFile(componentName, composition);
    await createStoryFile(componentName, composition);

    // Update configs
    await updateTsupConfig(componentName, composition);
    await updatePackageJson(componentName, composition);

    // Format and lint
    await formatFiles(componentName, composition);
    await lintFiles(componentName, composition);

    // Success summary
    console.log();
    log("✨ Component generated successfully!\n", "green");

    log("📝 Next steps:", "blue");
    const componentPath = composition 
      ? `packages/ui/src/compositions/${componentName}.tsx`
      : `packages/ui/src/${componentName}.tsx`;
    const storyPath = composition
      ? `apps/storybook/stories/compositions/${componentName}.stories.tsx`
      : `apps/storybook/stories/${componentName}.stories.tsx`;
    
    console.log(`  1. Customize the component in ${componentPath}`);
    console.log(`  2. Add variants and props as needed`);
    if (composition) {
      console.log(`  3. Import and compose primitives from parent directory`);
      console.log(`  4. Enhance stories in ${storyPath}`);
    } else {
      console.log(`  3. Enhance stories in ${storyPath}`);
      console.log(`  4. Add more test cases in packages/ui/src/__tests__/${componentName}.test.tsx`);
    }
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

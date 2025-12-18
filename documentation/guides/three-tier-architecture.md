# Three-Tier Component Architecture

**Version**: 1.0.0  
**Created**: December 2025  
**Status**: Implementation Plan

## Overview

The Wylie Dog Design System uses a three-tier component architecture to organize primitives, compositions, and implementations. This approach provides clear separation of concerns while maintaining a single source of truth.

## Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│ Tier 1: Primitives (@wyliedog/ui/src/*.tsx)            │
│ - Atomic components (Button, Card, Input)              │
│ - Direct Radix UI implementations                       │
│ - Exported individually from package                    │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ Tier 2: Compositions (@wyliedog/ui/src/compositions/)  │
│ - Reusable patterns (SiteHeader, PageLayout)           │
│ - Combine primitives into common patterns              │
│ - Generic, configurable implementations                │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ Tier 3: Implementations (apps/showcase/components/)    │
│ - App-specific configurations                           │
│ - Real-world production usage                          │
│ - Imports from Tier 1 & 2                              │
└─────────────────────────────────────────────────────────┘
```

## Directory Structure

```
packages/ui/
├── src/
│   ├── button.tsx                    # Tier 1: Primitives
│   ├── card.tsx
│   ├── navigation-menu.tsx
│   ├── [40 other components]
│   │
│   └── compositions/                 # Tier 2: Compositions
│       ├── site-header.tsx           # Generic header pattern
│       ├── site-footer.tsx           # Generic footer pattern
│       ├── page-layout.tsx           # Layout wrapper
│       └── index.ts                  # Barrel export
│
apps/showcase/
├── src/
│   └── components/                   # Tier 3: Implementations
│       ├── site-header.tsx           # Uses compositions/site-header
│       ├── site-footer.tsx           # Uses compositions/site-footer
│       └── site-layout.tsx           # Uses compositions/page-layout
│
apps/storybook/
├── stories/
│   ├── button.stories.tsx            # Tier 1 docs
│   ├── card.stories.tsx              # title: "3. Components/..."
│   ├── [40 other component stories]
│   │
│   ├── site-header.stories.tsx       # Tier 2 docs
│   ├── site-footer.stories.tsx       # title: "4. Patterns/..."
│   └── page-layout.stories.tsx
```

## Component Generator Adaptation

### Current Generator Behavior

The `scripts/generate-component.js` creates:

- Component: `packages/ui/src/{name}.tsx`
- Test: `packages/ui/src/__tests__/{name}.test.tsx`
- Story: `apps/storybook/stories/{name}.stories.tsx`

### Proposed Enhancement

Add `--composition` flag to support tier 2:

```bash
# Tier 1 (current behavior)
node scripts/generate-component.js button-group

# Tier 2 (new behavior)
node scripts/generate-component.js site-header --composition
```

### Generator Modifications

**1. Add Composition Flag Detection**

```javascript
// After validateComponentName()
const isComposition = process.argv.includes("--composition");
```

**2. Update File Paths**

```javascript
// Component path
const componentPath = isComposition
  ? path.join(rootDir, "packages/ui/src/compositions", `${name}.tsx`)
  : path.join(rootDir, "packages/ui/src", `${name}.tsx`);

// Story path - stays flat, same for both
const storyPath = path.join(
  rootDir,
  "apps/storybook/stories",
  `${name}.stories.tsx`
);
```

**3. Update Story Template**

```javascript
function generateStoryTemplate(name, isComposition) {
  const pascalName = toPascalCase(name);
  const titleName = toTitleCase(name);
  const importPath = isComposition
    ? `@wyliedog/ui/compositions/${name}`
    : `@wyliedog/ui/${name}`;
  const storyTitle = isComposition
    ? `4. Patterns/${pascalName}`
    : `3. Components/${pascalName}`;

  return `import type { Meta, StoryObj } from "@storybook/react-vite";
import { ${pascalName} } from "${importPath}";

const meta: Meta<typeof ${pascalName}> = {
  title: "${storyTitle}",
  component: ${pascalName},
  parameters: {
    layout: ${isComposition ? '"fullscreen"' : '"centered"'},
    docs: {
      description: {
        component: "${isComposition ? "Reusable pattern combining primitives into common UI patterns." : "Description of component."}",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
`;
}
```

**4. Update Component Template for Compositions**

```javascript
function generateComponentTemplate(name, isComposition) {
  const pascalName = toPascalCase(name);
  const importPath = isComposition ? "../lib/utils" : "./lib/utils";

  return `import React from "react";
import { cn } from "${importPath}";
${isComposition ? '\n// Import primitives as needed\n// import { Button } from "../button";\n// import { NavigationMenu } from "../navigation-menu";\n' : ""}

export interface ${pascalName}Props extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  ${isComposition ? "// Add composition-specific props here" : ""}
}

export const ${pascalName} = React.forwardRef<HTMLDivElement, ${pascalName}Props>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(${isComposition ? '"/* Add composition styles */"' : '""'}, className)}
        {...props}
      />
    );
  }
);

${pascalName}.displayName = "${pascalName}";
`;
}
```

**5. Update Package.json Exports**

```javascript
async function updatePackageJson(name, isComposition) {
  const packagePath = path.join(rootDir, "packages/ui/package.json");
  const packageJson = JSON.parse(await fs.readFile(packagePath, "utf-8"));

  if (isComposition) {
    // Export from compositions directory
    packageJson.exports[`./compositions/${name}`] = {
      types: `./src/compositions/${name}.tsx`,
      import: `./dist/compositions/${name}.mjs`,
      require: `./dist/compositions/${name}.js`,
    };
  } else {
    // Existing behavior
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
}
```

**6. Update Tsup Config**

```javascript
async function updateTsupConfig(name, isComposition) {
  const configPath = path.join(rootDir, "packages/ui/tsup.config.ts");
  let content = await fs.readFile(configPath, "utf-8");

  const entryPath = isComposition
    ? `src/compositions/${name}.tsx`
    : `src/${name}.tsx`;

  const newEntry = `    "${entryPath}",`;

  // Insert into entryPoints array
  const entryPointsMatch = content.match(/entryPoints:\s*\[([\s\S]*?)\]/);
  if (entryPointsMatch) {
    const entries = entryPointsMatch[1];
    const updatedEntries = entries.trim() + "\n" + newEntry;
    content = content.replace(
      /entryPoints:\s*\[([\s\S]*?)\]/,
      `entryPoints: [\n${updatedEntries}\n  ]`
    );
  }

  await fs.writeFile(configPath, content, "utf-8");
}
```

## Usage Examples

### Tier 1: Primitive Component

```typescript
// packages/ui/src/button.tsx
import React from "react";
import { cn } from "./lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return <button ref={ref} className={cn(/* ... */)} {...props} />;
  }
);

Button.displayName = "Button";
```

### Tier 2: Composition Component

```typescript
// packages/ui/src/compositions/site-header.tsx
import React from "react";
import { cn } from "../lib/utils";
import { NavigationMenu, NavigationMenuItem } from "../navigation-menu";
import { Button } from "../button";

export interface SiteHeaderProps {
  logo?: React.ReactNode;
  navigation?: Array<{ label: string; href: string }>;
  actions?: React.ReactNode;
  className?: string;
}

export const SiteHeader = React.forwardRef<HTMLElement, SiteHeaderProps>(
  ({ logo, navigation = [], actions, className }, ref) => {
    return (
      <header
        ref={ref}
        className={cn(
          "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur",
          className
        )}
      >
        <div className="container flex h-16 items-center justify-between">
          {logo && <div className="flex items-center">{logo}</div>}

          {navigation.length > 0 && (
            <NavigationMenu>
              {navigation.map((item) => (
                <NavigationMenuItem key={item.href} href={item.href}>
                  {item.label}
                </NavigationMenuItem>
              ))}
            </NavigationMenu>
          )}

          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </header>
    );
  }
);

SiteHeader.displayName = "SiteHeader";
```

### Tier 3: Implementation

```typescript
// apps/showcase/src/components/showcase-header.tsx
import { SiteHeader } from "@wyliedog/ui/compositions/site-header";
import { Button } from "@wyliedog/ui/button";
import Link from "next/link";

export function ShowcaseHeader() {
  return (
    <SiteHeader
      logo={
        <Link href="/" className="text-xl font-bold">
          Wylie Dog
        </Link>
      }
      navigation={[
        { label: "Components", href: "#components" },
        { label: "Patterns", href: "#patterns" },
        { label: "Tokens", href: "#tokens" },
      ]}
      actions={
        <>
          <Button variant="ghost" asChild>
            <a href="https://github.com/travhall/wylie-dog-ds">GitHub</a>
          </Button>
          <Button asChild>
            <a href="https://67881b308753304daabf16af-qkzxrbnawn.chromatic.com/">
              Storybook
            </a>
          </Button>
        </>
      }
    />
  );
}
```

## Storybook Integration

### Story Organization

**"3. Components"** - Tier 1 Primitives

- All 42+ components from `packages/ui/src/`
- Organized in subcategories: Layout, Feedback, Navigation, Inputs, Forms, Overlays
- Title pattern: `"3. Components/{Category}/{ComponentName}"`

**"4. Patterns"** - Tier 2 Compositions

- Reusable patterns from `packages/ui/src/compositions/`
- Shows how primitives combine into common UI patterns
- Title pattern: `"4. Patterns/{PatternName}"`

### Tier 2 Story Example (Composition)

```typescript
// apps/storybook/stories/site-header.stories.tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { SiteHeader } from "@wyliedog/ui/compositions/site-header";
import { Button } from "@wyliedog/ui/button";

const meta: Meta<typeof SiteHeader> = {
  title: "4. Patterns/Site Header",
  component: SiteHeader,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "Reusable header pattern combining NavigationMenu, logo, and action slots.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    logo: <div className="font-bold text-xl">Logo</div>,
    navigation: [
      { label: "Home", href: "/" },
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
    actions: <Button>Get Started</Button>,
  },
};

export const ShowcaseExample: Story = {
  name: "Showcase Implementation",
  args: {
    logo: <div className="font-bold text-xl">Wylie Dog</div>,
    navigation: [
      { label: "Components", href: "#components" },
      { label: "Patterns", href: "#patterns" },
      { label: "Tokens", href: "#tokens" },
    ],
    actions: (
      <>
        <Button variant="ghost" asChild>
          <a href="https://github.com/travhall/wylie-dog-ds">GitHub</a>
        </Button>
        <Button asChild>
          <a href="https://67881b308753304daabf16af-qkzxrbnawn.chromatic.com/">
            Storybook
          </a>
        </Button>
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: "Production configuration used in the Wylie Dog Showcase site.",
      },
    },
  },
};
```

## Implementation Phases

### Phase 1: Setup Compositions Infrastructure

**Duration**: 1 week

**Tasks**:

1. Create `packages/ui/src/compositions/` directory
2. Add compositions barrel export to package.json
3. Update tsup.config.ts for compositions build
4. Update component generator script with `--composition` flag
5. Test generator with sample composition

**Deliverables**:

- ✓ Compositions directory structure
- ✓ Generator script handles `--composition`
- ✓ Build pipeline processes compositions
- ✓ Sample composition builds successfully

### Phase 2: Build Core Compositions

**Duration**: 2 weeks

**Components to Create**:

1. **SiteHeader** - Navigation + logo + actions pattern
2. **SiteFooter** - Multi-column footer with links
3. **PageLayout** - Main content wrapper with header/footer slots
4. **SectionHero** - Hero section pattern
5. **SectionFeatures** - Feature grid/list pattern

**For Each Component**:

- Generate with `--composition` flag
- Build configurable, generic implementation
- Create comprehensive Storybook stories
- Write accessibility tests
- Document composition patterns

### Phase 3: Showcase Implementation

**Duration**: 1 week

**Tasks**:

1. Create Showcase-specific components using compositions
2. Implement ShowcaseHeader with Wylie Dog branding
3. Implement ShowcaseFooter with project links
4. Implement ShowcaseLayout wrapping all pages
5. Add routing structure (components, patterns, tokens pages)

**Deliverables**:

- ✓ ShowcaseHeader using SiteHeader composition
- ✓ ShowcaseFooter using SiteFooter composition
- ✓ Multi-page routing structure
- ✓ Consistent layout across all pages

### Phase 4: Storybook Documentation

**Duration**: 3 days

**Tasks**:

1. Create composition stories in existing structure
2. Add "Showcase Implementation" variants to pattern stories
3. Document real-world usage in story descriptions
4. Add cross-links between Storybook and Showcase

**Deliverables**:

- ✓ Pattern stories follow "4. Patterns/{Name}" convention
- ✓ Each pattern includes Showcase configuration example
- ✓ Clear links to live Showcase demos

### Phase 5: Documentation & Polish

**Duration**: 3 days

**Tasks**:

1. Write composition development guide
2. Update component workflow documentation
3. Create architecture decision record (this document)
4. Add composition examples to main README

**Deliverables**:

- ✓ Updated documentation in `/documentation/guides/`
- ✓ Architecture documented and accessible
- ✓ Contributor guide includes composition workflow
- ✓ Example patterns clearly demonstrated

**Total Timeline: 4-5 weeks**

## Testing Strategy

### Tier 1: Primitive Tests

- Unit tests for component logic
- Accessibility tests (axe-core)
- Visual regression tests (Chromatic)

### Tier 2: Composition Tests

- Integration tests with multiple primitives
- Accessibility tests for composed patterns
- Responsive behavior tests
- Composition API tests

### Tier 3: Implementation Tests

- E2E tests for Showcase flows
- Cross-browser compatibility
- Performance tests (Lighthouse)
- User interaction tests

## Build Configuration

### Package.json Updates

```json
{
  "exports": {
    "./compositions": "./src/compositions/index.ts",
    "./compositions/site-header": {
      "types": "./src/compositions/site-header.tsx",
      "import": "./dist/compositions/site-header.mjs",
      "require": "./dist/compositions/site-header.js"
    }
  }
}
```

### Tsup Config Updates

```typescript
export default defineConfig((options) => ({
  entryPoints: [
    // Tier 1: Primitives
    "src/button.tsx",
    "src/card.tsx",
    // ... other primitives

    // Tier 2: Compositions
    "src/compositions/site-header.tsx",
    "src/compositions/site-footer.tsx",
    "src/compositions/page-layout.tsx",
  ],
  format: ["cjs", "esm"],
  dts: true,
  external: ["react"],
  ...options,
}));
```

## Benefits

### For Developers

- Clear organization: Know where to find/add components
- Reusable patterns: Don't rebuild common layouts
- Type safety: Full TypeScript support across tiers
- Easy testing: Each tier has appropriate test strategy

### For Designers

- Pattern library: See generic patterns in Storybook
- Real examples: See production usage in Showcase stories
- Composition over creation: Combine existing patterns

### For System

- Single source of truth: Primitives in `@wyliedog/ui`
- Maintainability: Changes propagate automatically
- Performance: Tree-shakeable, optimized builds
- Scalability: Clear path for adding new patterns

## Naming Conventions

### Primitives (Tier 1)

- Atomic, single-purpose: `button`, `input`, `card`
- Match Radix UI conventions where applicable

### Compositions (Tier 2)

- Pattern-based naming: `site-header`, `page-layout`, `section-hero`
- Prefix indicates scope: `site-*`, `page-*`, `section-*`

### Implementations (Tier 3)

- App-specific prefix: `showcase-header`, `showcase-footer`
- Clear relationship to parent composition

## Success Metrics

- **Adoption**: 80% of Showcase uses Tier 2 compositions
- **Reusability**: Each composition used in 2+ contexts
- **Performance**: No bundle size increase vs current
- **Developer satisfaction**: Positive feedback on composition patterns
- **Documentation**: All compositions have stories + tests

---

**Document Status**: Living document - update as architecture evolves  
**Next Review**: Q1 2026 or after Phase 5 completion  
**Feedback**: Open PR in main repository with proposed changes

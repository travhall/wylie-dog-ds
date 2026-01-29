# Token Audit Kickoff Prompt

Copy and paste this prompt into a fresh Claude Code chat to begin the component-token audit process.

---

## Prompt

````
I need help auditing and refactoring UI components to be fully token-based in my design system.

## Context

This is a monorepo design system with:
- `packages/tokens/` — Design tokens (Figma → JSON → Style Dictionary → CSS)
- `packages/ui/` — React components (shadcn/Radix-based)
- `apps/storybook/` — Component documentation

The token system uses a 3-tier architecture:
1. **Primitive tokens** — Raw values (colors, spacing, typography)
2. **Semantic tokens** — Contextual meanings (background-primary, text-secondary)
3. **Component tokens** — Component-specific (card.background, button.primary.text)

Components should use component-tier tokens via Tailwind CSS 4 syntax:
- `bg-(--color-card-background)` — Background color
- `text-(length:--font-size-card-title)` — Font size (note the type hint)
- `gap-(--spacing-card-gap)` — Spacing

## Your Task

Please read these files to get up to speed:
1. `documentation/COMPREHENSIVE-TOKEN-AUDIT-PLAN.md` — Full audit plan with priorities
2. `documentation/COMPONENT-TOKEN-AUDIT-GUIDE.md` — Detailed audit procedures
3. `packages/tokens/scripts/audit-tokens.js` — Automated audit script

Then run the audit script to see current status:
```bash
node packages/tokens/scripts/audit-tokens.js --verbose
````

Based on the plan, let's start with Phase 1 (high-coverage quick wins) and work through components systematically. For each component:

1. Run the component-specific audit
2. Compare tokens vs Figma (I'll verify)
3. Update the component to use all defined tokens
4. Verify in Storybook
5. Re-audit to confirm 100% coverage

Let's begin with the first Phase 1 component: `switch` (currently 95% coverage).

```

---

## Alternative: Resume a Specific Phase

If you want to resume at a specific point, modify the prompt:

```

I need help continuing the token audit for my design system.

Please read:

1. `documentation/COMPREHENSIVE-TOKEN-AUDIT-PLAN.md`
2. `documentation/COMPONENT-TOKEN-AUDIT-GUIDE.md`

We've completed [list completed components]. Let's continue with Phase [X], starting with the [component-name] component.

Run the audit to see current status:

```bash
node packages/tokens/scripts/audit-tokens.js --component [name] --verbose
```

```

---

## Alternative: Single Component Focus

If you want to focus on just one component:

```

I need help auditing the [component-name] component in my design system to ensure it's fully token-based.

Please read `documentation/COMPONENT-TOKEN-AUDIT-GUIDE.md` for the audit process.

Then run:

```bash
node packages/tokens/scripts/audit-tokens.js --component [name] --verbose
```

Review the component source at `packages/ui/src/[name].tsx` and the token definitions in `packages/tokens/io/sync/components.json`.

Update the component to achieve 100% token coverage, then verify in Storybook.

```

---

## Notes for the Auditor (Claude)

1. **Always run the audit script first** to understand current state
2. **Read the component source** before making changes
3. **Verify Figma alignment** — Ask the user to confirm tokens exist in Figma
4. **Use Tailwind 4 syntax** — `utility-(--css-variable)` not `utility-[var(--css-variable)]`
5. **Font-size requires type hint** — `text-(length:--font-size-*)`
6. **Gap requires flex/grid** — Add layout utility if using gap token
7. **Rebuild after token changes** — `pnpm --filter @wyliedog/tokens build`
8. **Test in Storybook** — Visual verification is essential
```

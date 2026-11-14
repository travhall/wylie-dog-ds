# Wylie Dog Design System

A design-to-code front end workflow: a token system and React component library, demonstrated by the showcase site and documented in Storybook, whose token files are a shared contract between code and Figma. Intended to grow from a personal system into an open source foundation that adopters modify to their own preference.

## Language

### Tokens

The three tiers below are this project's standard, not a requirement of the token contract.

**Primitive token**:
A raw design value with no meaning attached, such as an OKLCH colour or a duration. Tier 1 of the token hierarchy.
_Avoid_: Base token, core token, "primitive" for anything that is not a token

**Semantic token**:
A named design decision that references a primitive token, such as `color.background.success`. Tier 2.
_Avoid_: Alias token, theme token

**Component token**:
A token scoped to one component that references a semantic token. Tier 3; components bind only to these.
_Avoid_: Local token

**Token contract**:
The set of token files that both the code and Figma read and write, in whatever structure the adopter prefers. The format is standard W3C DTCG. Neither side owns it; it lives in the repo at a location the user configures in Token Bridge.
_Avoid_: Source of truth, token source

**Token Bridge**:
The Figma plugin that syncs the token contract in both directions between Figma Variables and the repo.
_Avoid_: Sync plugin, Figma plugin (when the builder is meant)

### Colour semantics

**Pair**:
A foreground and background with the same role and level, guaranteed readable together in both modes, such as `foreground.success` on `background.success`.
_Avoid_: On-colour, contrast pair

**Role**:
The meaning a colour carries inside a part, such as success or danger.
_Avoid_: Status colour, intent

### Components

**Component**:
A top-level exported file in `packages/ui/src`, built on a Radix primitive where one exists. The headline count (45) counts these, including the two Patterns.
_Avoid_: Primitive (UI), atom, element

**Pattern**:
A component that arranges other components into a repeating layout, such as `card-grid` or `feature-grid`.
_Avoid_: Block

**Composition**:
A configurable page-level assembly of components, such as `SiteHeader` or `PageLayout`, exported under `compositions/` and counted separately from Components.
_Avoid_: Template, section (as a generic word)

**Implementation**:
An app's use of Components and Compositions with real content, such as the showcase site.
_Avoid_: Example, demo

### Distribution

**Foundation**:
This repository as adopters receive it: a template they fork or copy and then own, changing tokens, components and structure to their own preference. It is not consumed as a versioned package.
_Avoid_: Library, package, framework, starter kit

**Guardrail**:
An automated check that fails the build when code or tokens drift from the system's rules, such as token structure, contrast pairs, token binding or accessibility. The core of the workflow; adopters tune its thresholds and rules.
_Avoid_: Lint rule (too narrow), test (too general)

**Adopter**:
A solo designer-developer or very small team who takes the Foundation and makes it their own.
_Avoid_: User, consumer, customer

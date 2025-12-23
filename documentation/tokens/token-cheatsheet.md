# Token System Cheatsheet

## Quick Reference

### Color Tokens

#### Primitive Colors

```css
/* Usage in CSS */
.primary-bg {
  background-color: var(--color-primary-500);
}

/* In JavaScript */
import { color } from '@wyliedog/tokens/hierarchical';
const primaryColor = color.primary[500];
```

#### Semantic Colors

```css
/* Light mode (default) */
:root {
  --color-text: var(--color-gray-900);
  --color-background: var(--color-white);
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  :root {
    --color-text: var(--color-gray-100);
    --color-background: var(--color-gray-900);
  }
}
```

### Spacing

```css
/* Using spacing scale */
.container {
  padding: var(--spacing-4); /* 1rem / 16px */
  margin-top: var(--spacing-8); /* 2rem / 32px */
  gap: var(--spacing-2); /* 0.5rem / 8px */
}
```

### Typography

```css
/* Text styles */
.heading-1 {
  font-size: var(--font-size-4xl); /* 2.25rem / 36px */
  line-height: var(--line-height-tight);
  font-weight: var(--font-weight-bold);
}

.body {
  font-size: var(--font-size-base); /* 1rem / 16px */
  line-height: var(--line-height-normal);
}
```

### Border Radius

```css
.rounded-sm {
  border-radius: var(--radius-sm);
} /* 0.25rem / 4px */
.rounded-md {
  border-radius: var(--radius-md);
} /* 0.375rem / 6px */
.rounded-lg {
  border-radius: var(--radius-lg);
} /* 0.5rem / 8px */
.rounded-full {
  border-radius: var(--radius-full);
} /* 9999px */
```

### Shadows

```css
.shadow-sm {
  box-shadow: var(--shadow-sm);
}
.shadow-md {
  box-shadow: var(--shadow-md);
}
.shadow-lg {
  box-shadow: var(--shadow-lg);
}
```

## Common Tasks

### Add a New Color

1. Add to `io/input/primitive.json`:

```json
{
  "color": {
    "teal": {
      "50": "#f0fdfa",
      "100": "#ccfbf1",
      "200": "#99f6e4",
      "300": "#5eead4",
      "400": "#2dd4bf",
      "500": "#14b8a6",
      "600": "#0d9488",
      "700": "#0f766e",
      "800": "#115e59",
      "900": "#134e4a"
    }
  }
}
```

2. Run `pnpm build`

3. Use in your CSS: `var(--color-teal-500)`

### Create a Semantic Token

1. Add to `io/input/semantic.json`:

```json
{
  "color": {
    "accent": {
      "base": { "$value": "{color.teal.500}" },
      "hover": { "$value": "{color.teal.600}" },
      "pressed": { "$value": "{color.teal.700}" }
    }
  }
}
```

2. Run `pnpm build`

3. Use in your CSS: `var(--color-accent-base)`

### Add a New Component Token

1. Add to `io/input/components.json`:

```json
{
  "button": {
    "primary": {
      "background": { "$value": "{color.primary.500}" },
      "text": { "$value": "{color.white}" },
      "hover": {
        "background": { "$value": "{color.primary.600}" }
      }
    }
  }
}
```

         "hover": {
           "background": { "$value": "{color.primary.600}" }
         }
       }
     }

}

```
2. Run `pnpm build`
3. Use in your CSS: `var(--button-primary-background)`

## Best Practices

1. **Always use tokens** - Never hardcode values in components
2. **Reference primitives** - Build semantic tokens on top of primitives
3. **Use semantic names** - Name tokens based on usage, not appearance
4. **Leverage the cascade** - Use CSS custom properties for theming
5. **Document new tokens** - Add examples to this cheatsheet when adding new tokens
```

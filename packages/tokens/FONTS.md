# Token-Driven Font Loading

This design system uses W3C Design Tokens with `$extensions` to make font loading fully token-driven and flexible.

## How It Works

### 1. Font Tokens with Extensions

Font family tokens in `io/sync/primitive.json` include `$extensions` metadata:

```json
{
  "typography.font-family.sans": {
    "$type": "fontFamily",
    "$value": "Inter",
    "$extensions": {
      "com.wyliedog.fontSource": {
        "provider": "google",
        "weights": [400, 500, 600, 700, 800],
        "subsets": ["latin"],
        "display": "swap"
      }
    }
  }
}
```

### 2. Automatic Font Loader Generation

When you run `pnpm build` in the tokens package, it:

1. Processes tokens and preserves `$extensions`
2. Generates `dist/font-loaders.next.ts` with Next.js font configurations
3. Creates type-safe font loaders based on token metadata

### 3. Using in Your App

Copy the generated `dist/font-loaders.next.ts` to your Next.js app:

```bash
cp packages/tokens/dist/font-loaders.next.ts apps/your-app/src/lib/fonts.ts
```

Then import and use in your layout:

```tsx
import { sansFont, monoFont } from "@/lib/fonts";

export default function RootLayout({ children }) {
  return (
    <html>
      <body className={cn(sansFont.variable, monoFont.variable, "font-sans")}>
        {children}
      </body>
    </html>
  );
}
```

## Supported Font Providers

### Google Fonts

```json
"$extensions": {
  "com.wyliedog.fontSource": {
    "provider": "google",
    "weights": [400, 700],
    "subsets": ["latin", "latin-ext"],
    "display": "swap"
  }
}
```

### Local Fonts

```json
"$extensions": {
  "com.wyliedog.fontSource": {
    "provider": "local",
    "files": {
      "400": "/fonts/custom-regular.woff2",
      "700": "/fonts/custom-bold.woff2"
    },
    "display": "swap"
  }
}
```

### External Stylesheets

```json
"$extensions": {
  "com.wyliedog.fontSource": {
    "provider": "url",
    "stylesheet": "https://fonts.example.com/font.css"
  }
}
```

## Benefits

1. **Single Source of Truth** - Font configuration lives in design tokens
2. **Figma Sync** - Change fonts in Figma → automatically updates everywhere
3. **Platform Agnostic** - Same tokens can generate configs for Next.js, Vite, etc.
4. **Type Safe** - Generated TypeScript with proper types
5. **W3C Compliant** - Uses standard `$extensions` field

## Changing Fonts

1. Update the font token in `io/sync/primitive.json`:

   ```json
   "typography.font-family.sans": {
     "$type": "fontFamily",
     "$value": "Roboto",
     "$extensions": {
       "com.wyliedog.fontSource": {
         "provider": "google",
         "weights": [300, 400, 500, 700],
         "subsets": ["latin"],
         "display": "swap"
       }
     }
   }
   ```

2. Rebuild tokens:

   ```bash
   cd packages/tokens
   pnpm build
   ```

3. Copy the updated font loader to your app:

   ```bash
   cp packages/tokens/dist/font-loaders.next.ts apps/showcase/src/lib/fonts.ts
   ```

4. Your app now uses the new font!

## Architecture

```
┌─────────────────────────────────────┐
│ Figma / Design Tokens              │
│ (io/sync/primitive.json)           │
│ - Font family names                │
│ - $extensions with source metadata │
└──────────────┬──────────────────────┘
               │
               │ pnpm build
               ▼
┌─────────────────────────────────────┐
│ Style Dictionary Processing         │
│ - Preserves $extensions            │
│ - Outputs to dist/manifest.json    │
└──────────────┬──────────────────────┘
               │
               │ generate-font-loaders.js
               ▼
┌─────────────────────────────────────┐
│ Generated Font Loaders              │
│ (dist/font-loaders.next.ts)        │
│ - Next.js font() configurations    │
│ - Type-safe exports                │
└──────────────┬──────────────────────┘
               │
               │ Copy to app
               ▼
┌─────────────────────────────────────┐
│ Application                         │
│ (apps/*/src/lib/fonts.ts)         │
│ - Import font configurations       │
│ - Use in layout                    │
└─────────────────────────────────────┘
```

## Future Enhancements

- Auto-copy fonts to apps on rebuild
- Support for more font providers (Adobe Fonts, Font CDNs)
- Variable font support
- Subset optimization based on usage

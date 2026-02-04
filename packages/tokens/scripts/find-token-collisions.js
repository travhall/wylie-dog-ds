import { readFile } from "fs/promises";

/**
 * Token type → CSS variable configuration
 * Maps token types to their CSS variable prefix and any path prefixes to strip
 */
const TOKEN_TYPE_CONFIG = {
  color: {
    prefix: "color",
    stripPrefixes: ["color-"],
  },
  spacing: {
    prefix: "spacing",
    stripPrefixes: ["spacing-"],
    specialCases: {
      "border-radius-": { prefix: "border-radius" },
      "border-width-": { prefix: "border-width" },
    },
  },
  dimension: {
    prefix: "spacing",
    stripPrefixes: [],
    specialCases: {
      "border-radius-": { prefix: "border-radius" },
      "border-width-": { prefix: "border-width" },
    },
  },
  fontSize: {
    prefix: "font-size",
    stripPrefixes: ["typography-font-size-"],
  },
  fontWeight: {
    prefix: "font-weight",
    stripPrefixes: ["typography-font-weight-"],
  },
  lineHeight: {
    prefix: "line-height",
    stripPrefixes: ["typography-line-height-"],
  },
  duration: {
    prefix: "duration",
    stripPrefixes: ["transition-duration-"],
  },
  shadow: {
    prefix: "shadow",
    stripPrefixes: ["shadow-"],
  },
  fontFamily: {
    prefix: null,
    stripPrefixes: [],
  },
};

const FONT_FAMILY_CONTRACTS = {
  sans: "var(--font-sans, ui-sans-serif, system-ui, sans-serif)",
  serif: "var(--font-serif, ui-serif, serif)",
  mono: "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace)",
};

function generateCSSVariable(token, name) {
  const config = TOKEN_TYPE_CONFIG[token.$type];

  if (!config) {
    return { varName: `--${name}`, value: token.$value };
  }

  let cleanName = name;
  let prefix = config.prefix;
  let value = token.$value;

  // Check for special cases first
  if (config.specialCases) {
    for (const [pattern, override] of Object.entries(config.specialCases)) {
      if (name.startsWith(pattern)) {
        cleanName = name.replace(new RegExp(`^${pattern}`), "");
        prefix = override.prefix;
        return { varName: `--${prefix}-${cleanName}`, value };
      }
    }
  }

  // Strip known prefixes
  for (const stripPrefix of config.stripPrefixes) {
    if (cleanName.startsWith(stripPrefix)) {
      cleanName = cleanName.slice(stripPrefix.length);
      break;
    }
  }

  // Handle font family contract pattern
  if (token.$type === "fontFamily") {
    const extras = [];
    for (const [fontType, contractValue] of Object.entries(
      FONT_FAMILY_CONTRACTS
    )) {
      if (name.includes(fontType)) {
        value = contractValue;
        extras.push({
          varName: `--font-family-${fontType}`,
          value: contractValue,
        });
        break;
      }
    }
    return { varName: `--${name}`, value, extras };
  }

  return { varName: `--${prefix}-${cleanName}`, value };
}

async function findCollisions(files) {
  const variableMap = new Map(); // varName -> [{ file, tokenName, value }]

  for (const file of files) {
    const content = await readFile(file, "utf-8");
    const tokens = JSON.parse(content);

    for (const [tokenName, token] of Object.entries(tokens)) {
      // Clean path: simulate the same logic from the config
      const pathParts = tokenName.split(".");
      const cleanPath = pathParts.filter((segment, index, arr) => {
        if (segment === "Color" && arr[index - 1] === "Color") return false;
        return true;
      });

      const name = cleanPath.join("-").toLowerCase();
      const { varName, value, extras } = generateCSSVariable(token, name);

      // Track the variable
      if (!variableMap.has(varName)) {
        variableMap.set(varName, []);
      }
      variableMap.get(varName).push({
        file: file.split("/").pop(),
        tokenName,
        value,
      });

      // Track extras
      if (extras) {
        for (const extra of extras) {
          if (!variableMap.has(extra.varName)) {
            variableMap.set(extra.varName, []);
          }
          variableMap.get(extra.varName).push({
            file: file.split("/").pop(),
            tokenName: tokenName + " (extra)",
            value: extra.value,
          });
        }
      }
    }
  }

  // Find collisions
  const collisions = [];
  for (const [varName, tokens] of variableMap.entries()) {
    if (tokens.length > 1) {
      collisions.push({ varName, tokens });
    }
  }

  return collisions;
}

async function main() {
  const files = [
    "io/processed/primitive.json",
    "io/processed/semantic-light.json",
    "io/processed/component-light.json",
  ];

  console.log("🔍 Analyzing token collisions across all source files...\n");
  console.log(`Files being analyzed:`);
  for (const file of files) {
    console.log(`  - ${file}`);
  }
  console.log();

  const collisions = await findCollisions(files);

  if (collisions.length === 0) {
    console.log("✅ No collisions found!");
    return;
  }

  console.log(`⚠️  Found ${collisions.length} collision(s):\n`);

  for (const { varName, tokens } of collisions) {
    console.log(`\n📌 Variable: ${varName}`);
    console.log(`   Defined ${tokens.length} times:`);
    for (const token of tokens) {
      console.log(`   - ${token.file}: ${token.tokenName}`);
      console.log(`     Value: ${token.value}`);
    }
    
    // Check if values are the same
    const uniqueValues = [...new Set(tokens.map(t => t.value))];
    if (uniqueValues.length === 1) {
      console.log(`   ℹ️  All instances have the same value (intentional duplicate?)`);
    } else {
      console.log(`   ⚠️  Different values detected - this will cause issues!`);
    }
  }

  console.log(
    `\n\n💡 Total collisions: ${collisions.length}`
  );
  
  process.exit(collisions.length > 0 ? 1 : 0);
}

main().catch(console.error);

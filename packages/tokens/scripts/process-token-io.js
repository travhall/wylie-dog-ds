import { readFile, writeFile, mkdir, readdir } from "fs/promises";
import { join } from "path";
import { convertHexToOklch } from "./color-utils.js";
import { dtcgToNative } from "../lib/dtcg-convert.js";

const RESOLVER_FILE = "tokens.resolver.json";

/**
 * Robust I/O processor that handles multiple token formats
 * Supports: W3C DTCG, Legacy Adapter, Raw Variables
 */

class TokenIOProcessor {
  constructor(syncDir = "io/sync", processedDir = "io/processed") {
    this.syncDir = syncDir;
    this.processedDir = processedDir;
  }

  /**
   * Discover all JSON files in the sync directory. Any .json file is
   * considered a token file — no manifest or fixed filename list required.
   * This lets consumers put whatever token files they prefer here.
   */
  async discoverFiles() {
    await mkdir(this.syncDir, { recursive: true });
    const entries = await readdir(this.syncDir);
    return entries.filter((f) => f.endsWith(".json"));
  }

  /**
   * Is the sync directory in the DTCG contract layout? It is when it holds a
   * tokens.resolver.json (documentation/tokens/dtcg-contract.md). Otherwise
   * every .json file is read as a native collection file.
   */
  async isDtcgSync() {
    try {
      await readFile(join(this.syncDir, RESOLVER_FILE), "utf8");
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Read a DTCG sync directory through its resolver and convert it back to the
   * native collection shape, so the existing normalization (and therefore
   * io/processed and dist) is the same code path as before.
   */
  async readDtcgInputs() {
    const resolver = JSON.parse(
      await readFile(join(this.syncDir, RESOLVER_FILE), "utf8")
    );
    const refs = new Set();
    for (const set of Object.values(resolver.sets ?? {})) {
      for (const src of set.sources) refs.add(src.$ref);
    }
    for (const modifier of Object.values(resolver.modifiers ?? {})) {
      for (const sources of Object.values(modifier.contexts)) {
        for (const src of sources) refs.add(src.$ref);
      }
    }
    const files = {};
    for (const ref of refs) {
      files[ref] = JSON.parse(await readFile(join(this.syncDir, ref), "utf8"));
    }
    return Object.entries(dtcgToNative(resolver, files)).map(
      ([collection, data]) => ({
        filename: `${collection} (DTCG)`,
        load: async () => data,
      })
    );
  }

  /** Every .json in the sync directory, read as a native collection file. */
  async readNativeInputs() {
    const files = await this.discoverFiles();
    console.log(
      `📂 Discovered ${files.length} token file(s): ${files.join(", ")}`
    );
    return files.map((filename) => ({
      filename,
      load: async () =>
        JSON.parse(await readFile(join(this.syncDir, filename), "utf8")),
    }));
  }

  fileFor(collection) {
    // Retained for call-sites that still use it; returns undefined gracefully
    // when no manifest is present (collection-name-based lookup is gone).
    return undefined;
  }

  /**
   * Detect the format of token data
   */
  detectFormat(data, filename) {
    // W3C DTCG format: [{ collectionName: { modes: [...], variables: {...} } }]
    if (Array.isArray(data) && data.length > 0) {
      const firstItem = data[0];
      if (typeof firstItem === "object" && firstItem !== null) {
        const collectionName = Object.keys(firstItem)[0];
        const collection = firstItem[collectionName];
        if (
          collection &&
          collection.modes &&
          Array.isArray(collection.modes) &&
          collection.variables
        ) {
          return "w3c-dtcg";
        }
      }
    }

    // Legacy Adapter format: [{ collectionName: { modes: { Light: {...}, Dark: {...} } } }]
    if (Array.isArray(data) && data.length > 0) {
      const firstItem = data[0];
      if (typeof firstItem === "object" && firstItem !== null) {
        const collectionName = Object.keys(firstItem)[0];
        const collection = firstItem[collectionName];
        if (
          collection &&
          collection.modes &&
          typeof collection.modes === "object" &&
          !Array.isArray(collection.modes)
        ) {
          return "legacy-adapter";
        }
      }
    }

    // Single collection object (not wrapped in array)
    if (typeof data === "object" && data !== null && !Array.isArray(data)) {
      const collectionName = Object.keys(data)[0];
      const collection = data[collectionName];
      if (collection && collection.modes && collection.variables) {
        return "w3c-dtcg-single";
      }
    }

    // Fallback: try to process as flat token object
    return "unknown";
  }

  /**
   * Normalize any format to our internal structure
   */
  async normalizeFormat(data, filename) {
    const format = this.detectFormat(data, filename);
    console.log(`🔍 Detected format for ${filename}: ${format}`);

    switch (format) {
      case "w3c-dtcg":
        return this.normalizeW3CDTCG(data);
      case "w3c-dtcg-single":
        return this.normalizeW3CDTCG([data]);
      case "legacy-adapter":
        return this.normalizeLegacyAdapter(data);
      case "unknown":
        console.warn(
          `⚠️  Unknown format for ${filename}, attempting generic processing`
        );
        return this.normalizeUnknown(data);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  /**
   * Normalize W3C DTCG format
   */
  normalizeW3CDTCG(data) {
    const result = {
      primitive: null,
      semantic: { light: {}, dark: {} },
      components: { light: {}, dark: {} },
    };

    for (const collectionWrapper of data) {
      const collectionName = Object.keys(collectionWrapper)[0];
      const collection = collectionWrapper[collectionName];

      if (!collection || !collection.variables) continue;

      if (!["primitive", "semantic", "components"].includes(collectionName)) {
        console.warn(
          `⚠️  Skipping unknown collection "${collectionName}" in token input — only primitive/semantic/components are routed.`
        );
        continue;
      }

      // Extract modes
      const modes = collection.modes || [];
      const lightMode =
        modes.find((m) => m.name?.toLowerCase() === "light") || modes[0];
      const darkMode =
        modes.find((m) => m.name?.toLowerCase() === "dark") || modes[1];

      // Process variables
      for (const [tokenName, token] of Object.entries(collection.variables)) {
        const processedToken = {
          $type: token.$type || "string",
          $value: this.processValue(token),
          ...(token.$description && { $description: token.$description }),
          ...(token.$extensions && { $extensions: token.$extensions }),
        };

        // Route to appropriate collection
        if (collectionName === "primitive") {
          if (!result.primitive) result.primitive = {};
          result.primitive[tokenName] = processedToken;
        } else if (collectionName === "semantic") {
          if (lightMode && token.valuesByMode?.[lightMode.name]) {
            result.semantic.light[tokenName] = {
              ...processedToken,
              $value: token.valuesByMode[lightMode.name],
            };
          }
          if (darkMode && token.valuesByMode?.[darkMode.name]) {
            result.semantic.dark[tokenName] = {
              ...processedToken,
              $value: token.valuesByMode[darkMode.name],
            };
          }
        } else if (collectionName === "components") {
          if (lightMode && token.valuesByMode?.[lightMode.name]) {
            result.components.light[tokenName] = {
              ...processedToken,
              $value: token.valuesByMode[lightMode.name],
            };
          }
          if (darkMode && token.valuesByMode?.[darkMode.name]) {
            result.components.dark[tokenName] = {
              ...processedToken,
              $value: token.valuesByMode[darkMode.name],
            };
          }
        }
      }
    }

    return result;
  }

  /**
   * Normalize Legacy Adapter format
   */
  normalizeLegacyAdapter(data) {
    const result = {
      primitive: null,
      semantic: { light: {}, dark: {} },
      components: { light: {}, dark: {} },
    };

    for (const collectionWrapper of data) {
      const collectionName = Object.keys(collectionWrapper)[0];
      const collection = collectionWrapper[collectionName];

      if (!collection || !collection.modes) continue;

      if (!["primitive", "semantic", "components"].includes(collectionName)) {
        console.warn(
          `⚠️  Skipping unknown collection "${collectionName}" in token input — only primitive/semantic/components are routed.`
        );
        continue;
      }

      // Process each mode (Light, Dark)
      for (const [modeName, modeData] of Object.entries(collection.modes)) {
        const isDark = modeName.toLowerCase() === "dark";
        const targetMode = isDark ? "dark" : "light";

        const flattened = this.flattenTokens(modeData);

        for (const [tokenName, token] of Object.entries(flattened)) {
          const processedToken = {
            $type: token.$type || "string",
            $value: this.processValue(token),
            ...(token.$description && { $description: token.$description }),
          };

          // Route to appropriate collection
          if (collectionName === "primitive") {
            if (!result.primitive) result.primitive = {};
            result.primitive[tokenName] = processedToken;
          } else if (collectionName === "semantic") {
            result.semantic[targetMode][tokenName] = processedToken;
          } else if (collectionName === "components") {
            result.components[targetMode][tokenName] = processedToken;
          }
        }
      }
    }

    return result;
  }

  /**
   * Attempt to normalize unknown format
   */
  normalizeUnknown(data) {
    // Try to treat as flat token object
    const flattened = this.flattenTokens(data);
    return {
      primitive: flattened,
      semantic: { light: {}, dark: {} },
      components: { light: {}, dark: {} },
    };
  }

  /**
   * Process token value (handle colors, etc.)
   */
  processValue(token) {
    if (token.$type === "color" && typeof token.$value === "string") {
      // Convert RGB hex to OKLCH
      if (token.$value.startsWith("#")) {
        try {
          return convertHexToOklch(token.$value);
        } catch (error) {
          console.warn(
            `⚠️  Failed to convert color ${token.$value}:`,
            error.message
          );
          return token.$value;
        }
      }
    }
    return token.$value;
  }

  /**
   * Flatten nested token structure
   */
  flattenTokens(obj, prefix = "") {
    const result = {};

    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (value && typeof value === "object" && !Array.isArray(value)) {
        if (value.$type && value.$value !== undefined) {
          // This is a token
          result[newKey] = {
            $type: value.$type === "float" ? "dimension" : value.$type,
            $value: value.$value,
            ...(value.$description && { $description: value.$description }),
          };
        } else {
          // This is a group, recurse
          Object.assign(result, this.flattenTokens(value, newKey));
        }
      }
    }

    return result;
  }

  /**
   * Process all input files
   */
  async processInputFiles() {
    console.log("🔄 Processing token files from sync directory...");

    // Ensure directories exist
    await mkdir(this.processedDir, { recursive: true });

    this.dtcg = await this.isDtcgSync();
    if (this.dtcg) {
      console.log(`📐 DTCG contract detected (${RESOLVER_FILE})`);
    }
    const inputs = this.dtcg
      ? await this.readDtcgInputs()
      : await this.readNativeInputs();
    const processedData = {
      primitive: {},
      semantic: { light: {}, dark: {} },
      components: { light: {}, dark: {} },
    };

    for (const { filename, load } of inputs) {
      try {
        const rawData = await load();
        const normalized = await this.normalizeFormat(rawData, filename);

        // Merge normalized data
        if (normalized.primitive) {
          processedData.primitive = {
            ...processedData.primitive,
            ...normalized.primitive,
          };
        }
        if (normalized.semantic) {
          processedData.semantic.light = {
            ...processedData.semantic.light,
            ...normalized.semantic.light,
          };
          processedData.semantic.dark = {
            ...processedData.semantic.dark,
            ...normalized.semantic.dark,
          };
        }
        if (normalized.components) {
          processedData.components.light = {
            ...processedData.components.light,
            ...normalized.components.light,
          };
          processedData.components.dark = {
            ...processedData.components.dark,
            ...normalized.components.dark,
          };
        }

        console.log(`✅ Processed ${filename}`);
      } catch (error) {
        console.warn(`⚠️  Could not process ${filename}:`, error.message);
      }
    }

    // Write processed files
    if (processedData.primitive) {
      await writeFile(
        join(this.processedDir, "primitive.json"),
        JSON.stringify(processedData.primitive, null, 2) + "\n"
      );
    }

    await writeFile(
      join(this.processedDir, "semantic-light.json"),
      JSON.stringify(processedData.semantic.light, null, 2) + "\n"
    );

    await writeFile(
      join(this.processedDir, "semantic-dark.json"),
      JSON.stringify(processedData.semantic.dark, null, 2) + "\n"
    );

    await writeFile(
      join(this.processedDir, "component-light.json"),
      JSON.stringify(processedData.components.light, null, 2) + "\n"
    );

    await writeFile(
      join(this.processedDir, "component-dark.json"),
      JSON.stringify(processedData.components.dark, null, 2) + "\n"
    );

    console.log("✅ Token I/O processing complete");
    return processedData;
  }

  /**
   * Generate export files from processed data.
   *
   * Writes one JSON file per collection using the canonical 3-tier structure
   * this build pipeline understands (primitive / semantic / components). Mode
   * IDs follow the convention in SYNC_CONTRACT.md:
   *   mode:<collection>:<lowercased-mode-name>
   *
   * If you add a new tier, add an entry to `collections` below.
   */
  async generateExports(processedData) {
    console.log("📤 Generating export files...");

    const collections = [
      {
        collection: "primitive",
        filename: "primitive.json",
        modes: ["Value"],
        variables: processedData.primitive || {},
      },
      {
        collection: "semantic",
        filename: "semantic.json",
        modes: ["Light", "Dark"],
        variables: this.mergeModes(
          processedData.semantic?.light || {},
          processedData.semantic?.dark || {}
        ),
      },
      {
        collection: "components",
        filename: "components.json",
        modes: ["Light", "Dark"],
        variables: this.mergeModes(
          processedData.components?.light || {},
          processedData.components?.dark || {}
        ),
      },
    ];

    for (const entry of collections) {
      if (Object.keys(entry.variables).length === 0) continue;

      const modes = entry.modes.map((name) => ({
        modeId: `mode:${entry.collection}:${name.toLowerCase()}`,
        name,
      }));

      const wrapped = [
        { [entry.collection]: { modes, variables: entry.variables } },
      ];
      await writeFile(
        join(this.syncDir, entry.filename),
        JSON.stringify(wrapped, null, 2) + "\n"
      );
      console.log(`✅ Wrote ${entry.filename}`);
    }

    console.log("✅ Export files generated");
  }

  /**
   * Merge light and dark modes for W3C format
   */
  mergeModes(lightMap, darkMap) {
    const allKeys = new Set([
      ...Object.keys(lightMap),
      ...Object.keys(darkMap),
    ]);
    const variables = {};

    for (const key of allKeys) {
      const lightToken = lightMap[key];
      const darkToken = darkMap[key];
      const baseToken = lightToken || darkToken;

      if (!lightToken || !darkToken) {
        console.warn(
          `⚠️  Token "${key}" is missing its ${!lightToken ? "light" : "dark"} mode — inheriting the ${!lightToken ? "dark" : "light"} mode value as a fallback.`
        );
      }

      variables[key] = {
        $type: baseToken.$type,
        $value: lightToken ? lightToken.$value : darkToken.$value,
        // Key order matches what the Token Bridge plugin writes, so a local
        // build never rewrites io/sync/ and conflicts with a Figma push.
        ...(baseToken.$description && { $description: baseToken.$description }),
        valuesByMode: {
          Light: lightToken ? lightToken.$value : darkToken.$value,
          Dark: darkToken ? darkToken.$value : lightToken.$value,
        },
      };
    }

    return variables;
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const option = (name, fallback) => {
    const i = args.indexOf(name);
    return i === -1 ? fallback : args[i + 1];
  };
  const processor = new TokenIOProcessor(
    option("--sync", "io/sync"),
    option("--processed", "io/processed")
  );

  try {
    const processedData = await processor.processInputFiles();
    // The write-back rewrites native files; it must never run on a DTCG
    // directory, where it would overwrite the contract files.
    if (!processor.dtcg) {
      await processor.generateExports(processedData);
    }
    console.log(
      processor.dtcg
        ? "🎉 Complete! Check io/processed/ for processed files."
        : "🎉 Complete! Check io/processed/ for processed files and io/sync/ for Figma-compatible files."
    );
  } catch (error) {
    console.error("❌ Processing failed:", error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { TokenIOProcessor };

import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../../..");
const tokensRoot = path.join(repoRoot, "packages", "tokens");
const srcDir = path.join(tokensRoot, "src");
const outputDir = path.join(tokensRoot, "figma-exports", "token test");

const unitlessFloatTypes = new Set([
  "dimension",
  "spacing",
  "sizing",
  "borderRadius",
  "borderWidth",
  "fontSize",
  "lineHeight",
]);

const defaultUnits = {
  dimension: "px",
  spacing: "px",
  sizing: "px",
  borderRadius: "px",
  borderWidth: "px",
  fontSize: "px",
  lineHeight: "%",
};

const TYPE_OVERRIDES = [
  {
    pattern: /^typography\.font-size\./,
    type: "fontSize",
    unit: "px",
  },
  {
    pattern: /^typography\.line-height\./,
    type: "lineHeight",
    unit: "%",
  },
];

const UNIT_EXTENSION_NAMESPACE = "wylie";

function cloneExtensions(extensions) {
  if (!extensions) return undefined;
  return JSON.parse(JSON.stringify(extensions));
}

async function readJson(relativePath) {
  const filePath = path.join(srcDir, relativePath);
  return JSON.parse(await readFile(filePath, "utf8"));
}

function normalizeKey(segment) {
  return segment
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/\s+/g, "-")
    .toLowerCase();
}

function normalizeReference(value) {
  if (typeof value !== "string") return value;
  return value.replace(/\{([^}]+)\}/g, (_, refPath) => {
    const normalized = refPath
      .split(".")
      .map((segment) => normalizeKey(segment))
      .join(".");
    return `{${normalized}}`;
  });
}

function getTypeOverride(tokenPath) {
  return TYPE_OVERRIDES.find((override) => override.pattern.test(tokenPath));
}

function normalizeValue(token, effectiveType) {
  const rawValue = token.$value;
  const result = { value: rawValue, unit: null };

  if (typeof rawValue === "string") {
    const normalizedString = normalizeReference(rawValue);
    if (
      !normalizedString.includes("{") &&
      unitlessFloatTypes.has(effectiveType)
    ) {
      const parsed = extractNumericUnit(
        normalizedString,
        defaultUnits[effectiveType]
      );
      if (parsed) {
        result.value = parsed.value;
        result.unit = parsed.unit;
        return result;
      }
    }
    result.value = normalizedString;
    return result;
  }

  if (typeof rawValue === "number" && unitlessFloatTypes.has(effectiveType)) {
    result.unit = defaultUnits[effectiveType] || null;
    return result;
  }

  return result;
}

function extractNumericUnit(value, fallbackUnit = null) {
  const match = value.trim().match(/^(-?\d+(?:\.\d+)?)(px|%|rem|em)?$/i);
  if (!match) return null;
  return {
    value: parseFloat(match[1]),
    unit: (match[2] || fallbackUnit || "").toLowerCase() || null,
  };
}

function mergeUnitExtension(existingExtensions, unit) {
  if (!unit) return existingExtensions;
  const baseExtensions = cloneExtensions(existingExtensions) || {};
  const namespaceData = baseExtensions[UNIT_EXTENSION_NAMESPACE] || {};
  namespaceData.unit = unit;
  return {
    ...baseExtensions,
    [UNIT_EXTENSION_NAMESPACE]: namespaceData,
  };
}

function flattenTokens(node, parents = [], map = {}) {
  Object.entries(node || {}).forEach(([key, value]) => {
    const normalizedKey = normalizeKey(key);

    // Skip shadow tokens as they're too complex for native Figma Variables
    // Only skip in semantic exports (check if we're processing semantic files)
    const isSemanticExport =
      parents.length === 0 &&
      (key === "Color" ||
        key === "Space" ||
        key === "Radius" ||
        key === "Shadow" ||
        key === "Typography");
    if (key === "Shadow" && isSemanticExport) {
      console.log(
        `Skipping ${key} tokens - not supported by native Figma Variables`
      );
      return;
    }

    if (value && typeof value === "object" && !Array.isArray(value)) {
      if (value.$type && value.$value !== undefined) {
        const tokenPath = [...parents, normalizedKey].join(".");
        const override = getTypeOverride(tokenPath);
        const effectiveType = override?.type ?? value.$type;
        const normalized = normalizeValue(value, effectiveType);
        const mergedExtensions = mergeUnitExtension(
          value.$extensions,
          normalized.unit || override?.unit
        );
        map[tokenPath] = {
          $type: effectiveType,
          $value: normalized.value,
          ...(value.$description && { $description: value.$description }),
          ...(mergedExtensions && { $extensions: mergedExtensions }),
        };
      } else {
        flattenTokens(value, [...parents, normalizedKey], map);
      }
    }
  });

  return map;
}

function flattenSemanticTokens(node, parents = [], map = {}) {
  Object.entries(node || {}).forEach(([key, value]) => {
    const normalizedKey = normalizeKey(key);

    // Skip shadow and typography tokens in semantic exports
    if (key === "Shadow" || key === "Typography") {
      console.log(
        `Skipping ${key} tokens - not supported by native Figma Variables`
      );
      return;
    }

    if (value && typeof value === "object" && !Array.isArray(value)) {
      if (value.$type && value.$value !== undefined) {
        const tokenPath = [...parents, normalizedKey].join(".");
        const override = getTypeOverride(tokenPath);
        const effectiveType = override?.type ?? value.$type;
        const normalized = normalizeValue(value, effectiveType);
        const mergedExtensions = mergeUnitExtension(
          value.$extensions,
          normalized.unit || override?.unit
        );
        map[tokenPath] = {
          $type: effectiveType,
          $value: normalized.value,
          ...(value.$description && { $description: value.$description }),
          ...(mergedExtensions && { $extensions: mergedExtensions }),
        };
      } else {
        flattenSemanticTokens(value, [...parents, normalizedKey], map);
      }
    }
  });

  return map;
}

function flattenTypographyTokens(node, parents = [], map = {}) {
  Object.entries(node || {}).forEach(([key, value]) => {
    const normalizedKey = normalizeKey(key);

    if (value && typeof value === "object" && !Array.isArray(value)) {
      if (value.$type && value.$value !== undefined) {
        const tokenPath = [...parents, normalizedKey].join(".");
        const override = getTypeOverride(tokenPath);
        const effectiveType = override?.type ?? value.$type;
        const normalized = normalizeValue(value, effectiveType);
        const mergedExtensions = mergeUnitExtension(
          value.$extensions,
          normalized.unit || override?.unit
        );
        map[tokenPath] = {
          $type: effectiveType,
          $value: normalized.value,
          ...(value.$description && { $description: value.$description }),
          ...(mergedExtensions && { $extensions: mergedExtensions }),
        };
      } else {
        flattenTypographyTokens(value, [...parents, normalizedKey], map);
      }
    }
  });

  return map;
}

function mergeModes(lightMap, darkMap) {
  const allKeys = new Set([...Object.keys(lightMap), ...Object.keys(darkMap)]);
  const variables = {};

  for (const key of allKeys) {
    const lightToken = lightMap[key];
    const darkToken = darkMap[key];
    const baseToken = lightToken || darkToken;
    const valuesByMode = {};

    if (lightToken) valuesByMode.Light = lightToken.$value;
    if (darkToken) valuesByMode.Dark = darkToken.$value;

    variables[key] = {
      $type: baseToken.$type,
      $value: lightToken ? lightToken.$value : darkToken.$value,
      valuesByMode,
    };
  }

  return variables;
}

function buildCollection(name, variables, modes) {
  return [
    {
      [name]: {
        modes,
        variables,
      },
    },
  ];
}

async function ensureOutputDir() {
  await mkdir(outputDir, { recursive: true });
}

async function writeJson(filename, data) {
  const filePath = path.join(outputDir, filename);
  await writeFile(filePath, JSON.stringify(data, null, 2));
  return filePath;
}

async function exportPrimitive() {
  const primitiveTokens = await readJson("primitive.json");
  const variables = flattenTokens(primitiveTokens);

  const data = buildCollection("primitive", variables, [
    { modeId: "mode:primitive:value", name: "Value" },
  ]);

  await writeJson("primitive.json", data);
}

async function exportSemantic() {
  const semanticLight = await readJson("semantic-light.json");
  const semanticDark = await readJson("semantic-dark.json");

  const lightMap = flattenSemanticTokens(semanticLight);
  const darkMap = flattenSemanticTokens(semanticDark);
  const variables = mergeModes(lightMap, darkMap);

  const data = buildCollection("semantic", variables, [
    { modeId: "mode:semantic:light", name: "Light" },
    { modeId: "mode:semantic:dark", name: "Dark" },
  ]);

  await writeJson("semantic.json", data);
}

async function exportComponent() {
  const componentLight = await readJson("component-light.json");
  const componentDark = await readJson("component-dark.json");

  const lightMap = flattenTokens(componentLight);
  const darkMap = flattenTokens(componentDark);
  const variables = mergeModes(lightMap, darkMap);

  const data = buildCollection("components", variables, [
    { modeId: "mode:components:light", name: "Light" },
    { modeId: "mode:components:dark", name: "Dark" },
  ]);

  await writeJson("components.json", data);
}

async function main() {
  await ensureOutputDir();

  await exportPrimitive();
  await exportSemantic();
  await exportComponent();

  console.log("✅ Demo token exports created in figma-exports/token test/");
}

main().catch((err) => {
  console.error("❌ Failed to export demo tokens", err);
  process.exit(1);
});

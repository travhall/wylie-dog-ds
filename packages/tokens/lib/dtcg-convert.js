// Converts between the native Wylie Dog sync layout (io/sync) and the strict
// DTCG token contract (documentation/tokens/dtcg-contract.md).
//
//   nativeToDtcg(parsedNativeFiles) -> { files, resolver }
//   dtcgToNative(resolver, files)   -> the native collections again
//
// The two directions are lossless for the Wylie Dog files: converting and
// converting back gives the original data (lib/dtcg-convert.test.js proves it
// on the real io/sync files). Anything the converter cannot represent throws
// with the token name, so a bad value never passes silently.

const EXT_KEY = "com.wyliedog.tokens";
const ALIAS = /^\{([^{}]+)\}$/;

const DIMENSION_TYPES = new Set(["dimension", "spacing", "fontSize"]);

const isAlias = (value) => typeof value === "string" && ALIAS.test(value);

const fail = (name, message) => {
  throw new Error(`${name}: ${message}`);
};

// ---- value conversion: native string to DTCG value -----------------------

const OKLCH =
  /^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+)\s*)?\)$/;

function colorToDtcg(name, value) {
  const m = OKLCH.exec(value.trim());
  if (!m) fail(name, `unsupported color "${value}"`);
  const out = {
    colorSpace: "oklch",
    components: [Number(m[1]), Number(m[2]), Number(m[3])],
  };
  if (m[4] !== undefined && Number(m[4]) !== 1) out.alpha = Number(m[4]);
  return out;
}

function colorFromDtcg(name, value) {
  if (value.colorSpace !== "oklch")
    fail(name, "only oklch colors convert back");
  const [l, c, h] = value.components;
  const alpha = value.alpha === undefined ? "" : ` / ${value.alpha}`;
  return `oklch(${l} ${c} ${h}${alpha})`;
}

const LENGTH = /^(-?\d*\.?\d+)(px|rem|em)$/;

/** "12px" to { value, unit }; unit may also be "em", which DTCG cannot hold. */
function parseLength(name, value) {
  const m = LENGTH.exec(value.trim());
  if (!m) fail(name, `unsupported length "${value}"`);
  return { value: Number(m[1]), unit: m[2] };
}

const DURATION = /^(-?\d*\.?\d+)(ms|s)$/;

function durationToDtcg(name, value) {
  const m = DURATION.exec(value.trim());
  if (!m) fail(name, `unsupported duration "${value}"`);
  return { value: Number(m[1]), unit: m[2] };
}

const BEZIER = /^cubic-bezier\(([^)]+)\)$/;

function bezierToDtcg(name, value) {
  const m = BEZIER.exec(value.trim());
  const parts = m ? m[1].split(",").map((p) => Number(p.trim())) : [];
  if (parts.length !== 4 || parts.some(Number.isNaN)) {
    fail(name, `unsupported cubic bezier "${value}"`);
  }
  return parts;
}

// Native number literals are JSON numbers (a string would be read by the build
// as a string, not transformed); a numeric string is accepted and converted.
function numberToDtcg(name, value) {
  const n = typeof value === "number" ? value : Number(value);
  if ((typeof value === "string" && value.trim() === "") || Number.isNaN(n)) {
    fail(name, `not a number "${value}"`);
  }
  return n;
}

// Shadows: "0 1px 2px 0 rgb(0 0 0 / 0.05)", layers joined by commas, an
// optional leading "inset", and "none".
const SHADOW_LAYER =
  /^(inset\s+)?(-?[\d.]+(?:px)?)\s+(-?[\d.]+(?:px)?)\s+(-?[\d.]+(?:px)?)\s+(-?[\d.]+(?:px)?)\s+rgb\(\s*(\d+)\s+(\d+)\s+(\d+)\s*(?:\/\s*([\d.]+)\s*)?\)$/;

const NONE_SHADOW = {
  color: { colorSpace: "srgb", components: [0, 0, 0], alpha: 0 },
  offsetX: { value: 0, unit: "px" },
  offsetY: { value: 0, unit: "px" },
  blur: { value: 0, unit: "px" },
  spread: { value: 0, unit: "px" },
};

const px = (name, text) => {
  const n = Number(text.replace(/px$/, ""));
  if (Number.isNaN(n)) fail(name, `unsupported shadow length "${text}"`);
  return { value: n, unit: "px" };
};

/** Split on commas that are not inside parentheses. */
function splitLayers(text) {
  const layers = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "(") depth++;
    else if (text[i] === ")") depth--;
    else if (text[i] === "," && depth === 0) {
      layers.push(text.slice(start, i).trim());
      start = i + 1;
    }
  }
  layers.push(text.slice(start).trim());
  return layers;
}

function shadowToDtcg(name, value) {
  if (value.trim() === "none") return JSON.parse(JSON.stringify(NONE_SHADOW));
  const layers = splitLayers(value).map((layer) => {
    const m = SHADOW_LAYER.exec(layer);
    if (!m) fail(name, `unsupported shadow layer "${layer}"`);
    const out = {
      color: {
        colorSpace: "srgb",
        components: [
          Number(m[6]) / 255,
          Number(m[7]) / 255,
          Number(m[8]) / 255,
        ],
      },
      offsetX: px(name, m[2]),
      offsetY: px(name, m[3]),
      blur: px(name, m[4]),
      spread: px(name, m[5]),
    };
    if (m[9] !== undefined && Number(m[9]) !== 1)
      out.color.alpha = Number(m[9]);
    if (m[1]) out.inset = true;
    return out;
  });
  return layers.length === 1 ? layers[0] : layers;
}

// ---- value conversion: DTCG value to native string -----------------------

const shadowLength = (dim) =>
  dim.value === 0 ? "0" : `${dim.value}${dim.unit}`;

function shadowFromDtcg(name, value) {
  const layers = Array.isArray(value) ? value : [value];
  const isNone =
    layers.length === 1 &&
    layers[0].color?.alpha === 0 &&
    ["offsetX", "offsetY", "blur", "spread"].every(
      (k) => layers[0][k]?.value === 0
    );
  if (isNone) return "none";
  return layers
    .map((layer) => {
      if (typeof layer === "string" || typeof layer.color === "string") {
        fail(name, "references inside a shadow layer do not convert back");
      }
      const [r, g, b] = layer.color.components.map((c) => Math.round(c * 255));
      const alpha =
        layer.color.alpha === undefined ? "" : ` / ${layer.color.alpha}`;
      return [
        layer.inset ? "inset" : null,
        shadowLength(layer.offsetX),
        shadowLength(layer.offsetY),
        shadowLength(layer.blur),
        shadowLength(layer.spread),
        `rgb(${r} ${g} ${b}${alpha})`,
      ]
        .filter(Boolean)
        .join(" ");
    })
    .join(", ");
}

// ---- token conversion -----------------------------------------------------

/** The token a reference points at, following chains; undefined if unknown. */
function resolveTarget(value, flat, depth = 0) {
  const m = ALIAS.exec(value);
  const target = m && flat.get(m[1]);
  if (!target || depth > 20) return undefined;
  return isAlias(target.$value)
    ? resolveTarget(target.$value, flat, depth + 1)
    : target;
}

/** Is this dimension-like token in em, which DTCG dimensions cannot hold? */
function isEm(token, flat) {
  if (!DIMENSION_TYPES.has(token.$type)) return false;
  const literal = isAlias(token.$value)
    ? resolveTarget(token.$value, flat)?.$value
    : token.$value;
  return (
    typeof literal === "string" && /em$/.test(literal) && !/rem$/.test(literal)
  );
}

const dtcgTypeOf = (nativeType) =>
  DIMENSION_TYPES.has(nativeType) ? "dimension" : nativeType;

function valueToDtcg(name, type, value, em) {
  if (isAlias(value)) return value;
  switch (type) {
    case "color":
      return colorToDtcg(name, value);
    case "spacing":
    case "fontSize":
    case "dimension": {
      const len = parseLength(name, value);
      return em ? len.value : len;
    }
    case "duration":
      return durationToDtcg(name, value);
    case "cubicBezier":
      return bezierToDtcg(name, value);
    case "number":
      return numberToDtcg(name, value);
    case "fontFamily":
      return value;
    case "shadow":
      return shadowToDtcg(name, value);
    default:
      return fail(name, `unsupported type "${type}"`);
  }
}

function valueFromDtcg(name, nativeType, dtcgType, value, unit) {
  if (isAlias(value)) return value;
  switch (dtcgType) {
    case "color":
      return colorFromDtcg(name, value);
    case "dimension":
    case "duration":
      return `${value.value}${value.unit}`;
    case "cubicBezier":
      return `cubic-bezier(${value.join(", ")})`;
    case "number":
      return unit ? `${value}${unit}` : value;
    case "fontFamily":
      return value;
    case "shadow":
      return shadowFromDtcg(name, value);
    default:
      return fail(name, `unsupported type "${nativeType}"`);
  }
}

function setPath(tree, name, token) {
  const parts = name.split(".");
  let node = tree;
  for (const part of parts.slice(0, -1)) {
    if (node[part] === undefined) node[part] = {};
    else if (node[part].$value !== undefined)
      fail(name, "a token is also a group");
    node = node[part];
  }
  const leaf = parts[parts.length - 1];
  if (node[leaf] !== undefined) fail(name, "a token is also a group");
  node[leaf] = token;
}

function flattenTree(tree, prefix = "", out = new Map()) {
  for (const [key, node] of Object.entries(tree)) {
    if (key.startsWith("$")) continue;
    const name = prefix ? `${prefix}.${key}` : key;
    if (node.$value !== undefined) out.set(name, node);
    else flattenTree(node, name, out);
  }
  return out;
}

const slug = (modeName) => modeName.toLowerCase();

// ---- native to DTCG -------------------------------------------------------

export function nativeToDtcg(nativeFiles) {
  const collections = nativeFiles.map((file) => {
    const [name] = Object.keys(file[0]);
    return { name, ...file[0][name] };
  });

  // Every token by name, across collections, to resolve what a reference is.
  const flat = new Map();
  for (const c of collections) {
    for (const [tokenName, token] of Object.entries(c.variables)) {
      flat.set(tokenName, token);
    }
  }

  const files = {};
  const sets = {};
  const modifierOf = new Map(); // mode-name signature -> modifier
  const order = [];

  for (const c of collections) {
    const modeNames = c.modes.map((m) => m.name);
    const multi = modeNames.length > 1;

    for (const mode of modeNames) {
      const tree = {};
      for (const [tokenName, token] of Object.entries(c.variables)) {
        const value = multi ? token.valuesByMode[mode] : token.$value;
        if (value === undefined) fail(tokenName, `no value for mode ${mode}`);
        const em = isEm(token, flat);
        const category =
          token.$type === "spacing" || token.$type === "fontSize"
            ? token.$type
            : undefined;
        const ext = {
          ...(category && { category }),
          ...(em && { unit: "em" }),
        };
        const out = {
          $type: em ? "number" : dtcgTypeOf(token.$type),
          $value: valueToDtcg(tokenName, token.$type, value, em),
        };
        if (token.$description !== undefined)
          out.$description = token.$description;
        if (Object.keys(ext).length) out.$extensions = { [EXT_KEY]: ext };
        setPath(tree, tokenName, out);
      }
      const file = multi ? `${c.name}.${slug(mode)}.json` : `${c.name}.json`;
      files[file] = tree;
    }

    if (!multi) {
      sets[c.name] = {
        sources: [{ $ref: `${c.name}.json` }],
        $extensions: { [EXT_KEY]: { mode: modeNames[0] } },
      };
      order.push({ $ref: `#/sets/${c.name}` });
      continue;
    }

    const signature = modeNames.map(slug).join("|");
    let modifier = modifierOf.get(signature);
    if (!modifier) {
      const name = signature === "light|dark" ? "theme" : c.name;
      modifier = {
        name,
        value: {
          contexts: {},
          default: slug(modeNames[0]),
          $extensions: { [EXT_KEY]: { modes: {} } },
        },
      };
      for (const mode of modeNames) {
        modifier.value.contexts[slug(mode)] = [];
        modifier.value.$extensions[EXT_KEY].modes[slug(mode)] = mode;
      }
      modifierOf.set(signature, modifier);
      order.push({ $ref: `#/modifiers/${name}` });
    }
    for (const mode of modeNames) {
      modifier.value.contexts[slug(mode)].push({
        $ref: `${c.name}.${slug(mode)}.json`,
      });
    }
  }

  const resolver = {
    version: "2025.10",
    name: "Wylie Dog tokens",
    sets,
    modifiers: Object.fromEntries(
      [...modifierOf.values()].map((m) => [m.name, m.value])
    ),
    resolutionOrder: order,
  };
  return { files, resolver };
}

// ---- DTCG to native -------------------------------------------------------

const baseName = (ref) => ref.replace(/\.json$/, "");

export function dtcgToNative(resolver, files) {
  const collections = new Map(); // name -> [{ ctx, modeName, file }]
  const add = (name, mode) => {
    if (!collections.has(name)) collections.set(name, []);
    collections.get(name).push(mode);
  };

  for (const set of Object.values(resolver.sets ?? {})) {
    const mode = set.$extensions?.[EXT_KEY]?.mode ?? "Default";
    for (const src of set.sources) {
      add(baseName(src.$ref), {
        ctx: slug(mode),
        modeName: mode,
        file: src.$ref,
      });
    }
  }
  for (const modifier of Object.values(resolver.modifiers ?? {})) {
    const names = modifier.$extensions?.[EXT_KEY]?.modes ?? {};
    for (const [ctx, sources] of Object.entries(modifier.contexts)) {
      for (const src of sources) {
        const suffix = `.${ctx}`;
        const base = baseName(src.$ref);
        const collection = base.endsWith(suffix)
          ? base.slice(0, -suffix.length)
          : base;
        add(collection, { ctx, modeName: names[ctx] ?? ctx, file: src.$ref });
      }
    }
  }

  const result = {};
  for (const [name, modes] of collections) {
    const perMode = modes.map((m) => {
      if (!files[m.file]) fail(name, `missing file ${m.file}`);
      return { ...m, tokens: flattenTree(files[m.file]) };
    });
    const first = perMode[0];
    const multi = perMode.length > 1;
    const variables = {};

    for (const [tokenName, token] of first.tokens) {
      const ext = token.$extensions?.[EXT_KEY] ?? {};
      const nativeType = ext.category ?? (ext.unit ? "dimension" : token.$type);
      const valueIn = (t) =>
        valueFromDtcg(tokenName, nativeType, t.$type, t.$value, ext.unit);
      const out = { $type: nativeType, $value: valueIn(token) };
      if (token.$description !== undefined)
        out.$description = token.$description;
      if (multi) {
        out.valuesByMode = {};
        for (const m of perMode) {
          const t = m.tokens.get(tokenName);
          if (!t) fail(tokenName, `missing from ${m.file}`);
          out.valuesByMode[m.modeName] = valueIn(t);
        }
      }
      variables[tokenName] = out;
    }

    result[name] = [
      {
        [name]: {
          modes: perMode.map((m) => ({
            modeId: `mode:${name}:${m.ctx}`,
            name: m.modeName,
          })),
          variables,
        },
      },
    ];
  }
  return result;
}

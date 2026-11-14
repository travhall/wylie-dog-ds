import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import Ajv from "ajv";
import { dtcgToNative, mergeResolver, nativeToDtcg } from "./dtcg-convert.js";

const load = (url) => JSON.parse(readFileSync(url, "utf8"));
const ajv = new Ajv({ allErrors: true });
const validateTokens = ajv.compile(
  load(new URL("../schema/token-file.schema.json", import.meta.url))
);
const validateResolver = ajv.compile(
  load(new URL("../schema/resolver.schema.json", import.meta.url))
);

const collection = (name, modes, variables) => [
  {
    [name]: {
      modes: modes.map((m) => ({
        modeId: `mode:${name}:${m.toLowerCase()}`,
        name: m,
      })),
      variables,
    },
  },
];

const single = (variables) =>
  nativeToDtcg([collection("primitive", ["Value"], variables)]).files[
    "primitive.json"
  ];

// ---- one case per value type ----------------------------------------------

test("color: an oklch string becomes a colour object", () => {
  const tree = single({
    "color.coral.600": { $type: "color", $value: "oklch(0.61 0.169 37.68)" },
  });
  assert.deepEqual(tree.color.coral["600"], {
    $type: "color",
    $value: { colorSpace: "oklch", components: [0.61, 0.169, 37.68] },
  });
});

test("dimension: spacing and fontSize become dimension and keep their category", () => {
  const tree = single({
    "space.100": { $type: "spacing", $value: "8px" },
    "font.size": { $type: "fontSize", $value: "1rem" },
    "radius.md": { $type: "dimension", $value: "4px" },
  });
  assert.deepEqual(tree.space["100"], {
    $type: "dimension",
    $value: { value: 8, unit: "px" },
    $extensions: { "com.wyliedog.tokens": { category: "spacing" } },
  });
  assert.equal(
    tree.font.size.$extensions["com.wyliedog.tokens"].category,
    "fontSize"
  );
  assert.equal(tree.radius.md.$extensions, undefined);
});

test("em: a dimension in em becomes a number with a unit marker", () => {
  const tree = single({
    "tracking.tight": { $type: "dimension", $value: "-0.025em" },
  });
  assert.deepEqual(tree.tracking.tight, {
    $type: "number",
    $value: -0.025,
    $extensions: { "com.wyliedog.tokens": { unit: "em" } },
  });
});

test("em: an alias to an em token is a number too, so its type matches its target", () => {
  const result = nativeToDtcg([
    collection("primitive", ["Value"], {
      "tracking.tight": { $type: "dimension", $value: "-0.025em" },
    }),
    collection("components", ["Light"], {
      "card.title.letter-spacing": {
        $type: "dimension",
        $value: "{tracking.tight}",
      },
    }),
  ]);
  const token = result.files["components.json"].card.title["letter-spacing"];
  assert.equal(token.$type, "number");
  assert.equal(token.$value, "{tracking.tight}");
  assert.equal(token.$extensions["com.wyliedog.tokens"].unit, "em");
});

test("duration, cubic bezier and number get structured values", () => {
  const tree = single({
    "motion.fast": { $type: "duration", $value: "150ms" },
    "motion.ease": {
      $type: "cubicBezier",
      $value: "cubic-bezier(0.4, 0, 0.2, 1)",
    },
    "scale.hover": { $type: "number", $value: "1.05" },
  });
  assert.deepEqual(tree.motion.fast.$value, { value: 150, unit: "ms" });
  assert.deepEqual(tree.motion.ease.$value, [0.4, 0, 0.2, 1]);
  assert.equal(tree.scale.hover.$value, 1.05);
});

test("shadow: layers, inset and none", () => {
  const tree = single({
    "shadow.one": { $type: "shadow", $value: "0 1px 2px 0 rgb(0 0 0 / 0.05)" },
    "shadow.two": {
      $type: "shadow",
      $value:
        "0 1px 3px 0 rgb(0 0 0 / 0.1), inset 0 2px 4px -1px rgb(0 0 0 / 0.1)",
    },
    "shadow.none": { $type: "shadow", $value: "none" },
  });
  assert.equal(tree.shadow.one.$value.offsetY.value, 1);
  assert.equal(tree.shadow.one.$value.color.alpha, 0.05);
  assert.equal(tree.shadow.two.$value.length, 2);
  assert.equal(tree.shadow.two.$value[1].inset, true);
  assert.equal(tree.shadow.none.$value.color.alpha, 0);
});

test("a value the converter cannot represent throws with the token name", () => {
  assert.throws(
    () => single({ "color.bad": { $type: "color", $value: "#ff0000" } }),
    /color\.bad: unsupported color/
  );
  assert.throws(
    () =>
      single({ "space.bad": { $type: "spacing", $value: "calc(1px + 2px)" } }),
    /space\.bad: unsupported length/
  );
});

test("a token that is also a group is rejected", () => {
  assert.throws(
    () =>
      single({
        "button.primary": { $type: "color", $value: "oklch(0.5 0.1 20)" },
        "button.primary.hover": { $type: "color", $value: "oklch(0.4 0.1 20)" },
      }),
    /a token is also a group/
  );
});

// ---- modes and the resolver ------------------------------------------------

test("modes: Light and Dark become files and one shared theme modifier", () => {
  const modeVars = (light, dark) => ({
    $type: "color",
    $value: light,
    valuesByMode: { Light: light, Dark: dark },
  });
  const { files, resolver } = nativeToDtcg([
    collection("primitive", ["Value"], {
      "color.a": { $type: "color", $value: "oklch(0.9 0 0)" },
    }),
    collection("semantic", ["Light", "Dark"], {
      "color.bg": modeVars("oklch(0.9 0 0)", "oklch(0.2 0 0)"),
    }),
    collection("components", ["Light", "Dark"], {
      "button.bg": modeVars("{color.bg}", "{color.bg}"),
    }),
  ]);
  assert.deepEqual(Object.keys(files).sort(), [
    "components.dark.json",
    "components.light.json",
    "primitive.json",
    "semantic.dark.json",
    "semantic.light.json",
  ]);
  assert.deepEqual(Object.keys(resolver.modifiers), ["theme"]);
  assert.deepEqual(resolver.modifiers.theme.contexts.dark, [
    { $ref: "semantic.dark.json" },
    { $ref: "components.dark.json" },
  ]);
  assert.deepEqual(resolver.resolutionOrder, [
    { $ref: "#/sets/primitive" },
    { $ref: "#/modifiers/theme" },
  ]);
  assert.equal(files["semantic.dark.json"].color.bg.$value.components[0], 0.2);
  assert.equal(
    validateResolver(resolver),
    true,
    JSON.stringify(validateResolver.errors)
  );
});

test("modes: a collection with different modes gets its own modifier", () => {
  const { resolver } = nativeToDtcg([
    collection("density", ["Compact", "Roomy"], {
      "space.gap": {
        $type: "spacing",
        $value: "4px",
        valuesByMode: { Compact: "4px", Roomy: "8px" },
      },
    }),
  ]);
  assert.deepEqual(Object.keys(resolver.modifiers), ["density"]);
  assert.deepEqual(Object.keys(resolver.modifiers.density.contexts), [
    "compact",
    "roomy",
  ]);
});

// ---- skipping tokens that cannot be represented ----------------------------

test("skip: a token that cannot convert is reported and the rest still convert", () => {
  const native = [
    collection("primitive", ["Value"], {
      "color.ok": { $type: "color", $value: "oklch(0.5 0.1 20)" },
      "color.bad": { $type: "color", $value: "#ff0000" },
      "space.ok": { $type: "spacing", $value: "8px" },
    }),
  ];
  assert.throws(() => nativeToDtcg(native), /color\.bad/);

  const { files, skipped } = nativeToDtcg(native, { skip: true });
  assert.equal(skipped.length, 1);
  assert.equal(skipped[0].token, "color.bad");
  assert.equal(skipped[0].collection, "primitive");
  assert.match(skipped[0].reason, /unsupported color/);
  assert.ok(files["primitive.json"].color.ok);
  assert.equal(files["primitive.json"].color.bad, undefined);
  assert.ok(files["primitive.json"].space.ok);
});

test("skip: a token with a value missing in one mode is skipped in every mode", () => {
  const { files, skipped } = nativeToDtcg(
    [
      collection("semantic", ["Light", "Dark"], {
        "color.a": {
          $type: "color",
          $value: "oklch(0.9 0 0)",
          valuesByMode: { Light: "oklch(0.9 0 0)", Dark: "oklch(0.2 0 0)" },
        },
        "color.b": {
          $type: "color",
          $value: "oklch(0.9 0 0)",
          valuesByMode: { Light: "oklch(0.9 0 0)" },
        },
      }),
    ],
    { skip: true }
  );
  assert.deepEqual(
    skipped.map((s) => s.token),
    ["color.b"]
  );
  assert.equal(files["semantic.light.json"].color.b, undefined);
  assert.equal(files["semantic.dark.json"].color.b, undefined);
});

test("skip: a token that would also be a group is skipped, not thrown", () => {
  const { skipped } = nativeToDtcg(
    [
      collection("primitive", ["Value"], {
        "button.primary": { $type: "color", $value: "oklch(0.5 0.1 20)" },
        "button.primary.hover": { $type: "color", $value: "oklch(0.4 0.1 20)" },
      }),
    ],
    { skip: true }
  );
  assert.equal(skipped.length, 1);
  assert.match(skipped[0].reason, /a token is also a group/);
});

// ---- merging the resolver --------------------------------------------------

const generatedResolver = () =>
  nativeToDtcg([
    collection("primitive", ["Value"], {
      "color.a": { $type: "color", $value: "oklch(0.9 0 0)" },
    }),
    collection("semantic", ["Light", "Dark"], {
      "color.bg": {
        $type: "color",
        $value: "oklch(0.9 0 0)",
        valuesByMode: { Light: "oklch(0.9 0 0)", Dark: "oklch(0.2 0 0)" },
      },
    }),
  ]).resolver;

test("mergeResolver: with no existing resolver the generated one is used", () => {
  const generated = generatedResolver();
  assert.deepStrictEqual(mergeResolver(undefined, generated), generated);
});

test("mergeResolver: merging a resolver into itself changes nothing", () => {
  const generated = generatedResolver();
  assert.deepStrictEqual(mergeResolver(generated, generated), generated);
});

test("mergeResolver: keeps what an adopter added", () => {
  const existing = generatedResolver();
  existing.description = "Our tokens";
  existing.$extensions = { "com.acme.tool": { keep: true } };
  existing.sets.overrides = { sources: [{ $ref: "overrides.json" }] };
  existing.modifiers.theme.contexts.dark.push({ $ref: "brand.dark.json" });
  existing.modifiers.density = {
    contexts: {
      compact: [{ $ref: "d.c.json" }],
      roomy: [{ $ref: "d.r.json" }],
    },
  };
  existing.modifiers.theme.$extensions["com.acme.tool"] = { note: "x" };
  existing.resolutionOrder.push({ $ref: "#/sets/overrides" });

  const merged = mergeResolver(existing, generatedResolver());

  assert.equal(merged.description, "Our tokens");
  assert.deepEqual(merged.$extensions, { "com.acme.tool": { keep: true } });
  assert.ok(merged.sets.overrides);
  assert.ok(merged.modifiers.density);
  assert.deepEqual(merged.modifiers.theme.contexts.dark, [
    { $ref: "semantic.dark.json" },
    { $ref: "brand.dark.json" },
  ]);
  assert.deepEqual(merged.modifiers.theme.$extensions["com.acme.tool"], {
    note: "x",
  });
  assert.deepEqual(
    merged.modifiers.theme.$extensions["com.wyliedog.tokens"].modes,
    { light: "Light", dark: "Dark" }
  );
  // The existing order is kept, nothing is duplicated.
  assert.deepEqual(merged.resolutionOrder, existing.resolutionOrder);
});

test("mergeResolver: a new Figma collection is added after the existing entries", () => {
  const existing = generatedResolver();
  const generated = nativeToDtcg([
    collection("primitive", ["Value"], {
      "color.a": { $type: "color", $value: "oklch(0.9 0 0)" },
    }),
    collection("brand", ["Value"], {
      "color.b": { $type: "color", $value: "oklch(0.5 0 0)" },
    }),
  ]).resolver;

  const merged = mergeResolver(existing, generated);

  assert.deepEqual(Object.keys(merged.sets), ["primitive", "brand"]);
  assert.deepEqual(merged.resolutionOrder.at(-1), { $ref: "#/sets/brand" });
  assert.equal(
    validateResolver(merged),
    true,
    JSON.stringify(validateResolver.errors)
  );
});

// ---- the real files --------------------------------------------------------

const syncDir = new URL("../io/sync/", import.meta.url);
const nativeFiles = readdirSync(syncDir)
  .filter((f) => f.endsWith(".json"))
  .sort()
  .map((f) => load(new URL(f, syncDir)));

test("real io/sync: every converted file passes both schemas", () => {
  const { files, resolver } = nativeToDtcg(nativeFiles);
  for (const [name, tree] of Object.entries(files)) {
    assert.equal(
      validateTokens(tree),
      true,
      `${name}: ${JSON.stringify(validateTokens.errors?.slice(0, 3))}`
    );
  }
  assert.equal(
    validateResolver(resolver),
    true,
    JSON.stringify(validateResolver.errors)
  );
});

// Exact equality: the build reads a number literal (14) differently from a
// string ("14"), so a number token must come back as a JSON number.
test("real io/sync: converting and converting back loses nothing", () => {
  const { files, resolver } = nativeToDtcg(nativeFiles);
  const back = dtcgToNative(resolver, files);
  assert.deepEqual(Object.keys(back).sort(), [
    "components",
    "primitive",
    "semantic",
  ]);
  for (const original of nativeFiles) {
    const [name] = Object.keys(original[0]);
    assert.deepStrictEqual(
      back[name],
      original,
      `${name} differs after a round trip`
    );
  }
});

test("real io/sync: only DTCG types remain in the converted files", () => {
  const { files } = nativeToDtcg(nativeFiles);
  const types = new Set();
  const walk = (node) => {
    for (const [k, v] of Object.entries(node)) {
      if (k === "$type") types.add(v);
      else if (v && typeof v === "object" && !k.startsWith("$")) walk(v);
    }
  };
  Object.values(files).forEach(walk);
  assert.deepEqual([...types].sort(), [
    "color",
    "cubicBezier",
    "dimension",
    "duration",
    "fontFamily",
    "number",
    "shadow",
  ]);
});

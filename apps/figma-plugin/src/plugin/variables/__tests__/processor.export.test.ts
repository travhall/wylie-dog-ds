import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from "vitest";
import {
  findUnsupportedVariables,
  processCollection,
  processCollectionsForExport,
} from "../processor";

type Collections = Parameters<typeof processCollectionsForExport>[0];
type Variable = Collections[number]["variables"][number];
type Extra = Partial<Variable> & Record<string, unknown>;
type Token = {
  $type: string;
  $value: unknown;
  $description?: string;
  valuesByMode?: Record<string, unknown>;
};

const light = { modeId: "m1", name: "Light" };
const dark = { modeId: "m2", name: "Dark" };

let warn: MockInstance;
let error: MockInstance;

function variable(
  id: string,
  name: string,
  resolvedType: string,
  value: unknown,
  extra: Extra = {}
): Variable {
  return {
    id,
    name,
    resolvedType,
    scopes: ["ALL_SCOPES"],
    description: "",
    valuesByMode: { m1: value },
    ...extra,
  } as unknown as Variable;
}

function collection(
  variables: Variable[],
  modes = [light],
  id = "c1",
  name = "Primitives"
) {
  return { id, name, modes, variables } as unknown as Collections[number];
}

/** Exports one collection and returns its tokens keyed by token name. */
async function exportTokens(variables: Variable[], modes = [light]) {
  const data = await processCollectionsForExport(
    [collection(variables, modes)],
    ["c1"]
  );
  return (data[0]?.Primitives?.variables ?? {}) as Record<string, Token>;
}

async function single(
  name: string,
  resolvedType: string,
  value: unknown,
  extra: Extra = {}
) {
  const tokens = await exportTokens([
    variable("v1", name, resolvedType, value, extra),
  ]);
  return Object.values(tokens)[0];
}

beforeEach(() => {
  vi.spyOn(console, "log").mockImplementation(() => {});
  warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  error = vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("colors", () => {
  it.each([
    ["red", { r: 1, g: 0, b: 0 }, "oklch(0.628 0.258 29.23)"],
    ["white", { r: 1, g: 1, b: 1 }, "oklch(1 0 0)"],
    ["black", { r: 0, g: 0, b: 0 }, "oklch(0 0 0)"],
    // Very dark grey takes the low-value branch of the gamma conversion.
    ["near-black grey", { r: 0.02, g: 0.02, b: 0.02 }, "oklch(0.116 0 0)"],
  ])("exports %s as OKLCH", async (_label, rgb, expected) => {
    const token = await single("color/sample", "COLOR", rgb);
    expect(token).toEqual({ $type: "color", $value: expected });
  });

  it("keeps hue positive for blues", async () => {
    const token = await single("color/blue", "COLOR", { r: 0, g: 0, b: 1 });
    expect(token.$value).toMatch(/^oklch\(0\.452 0\.313 264\.0\d\)$/);
  });

  it("leaves the value out and reports an error for an incomplete color", async () => {
    const token = await single("color/broken", "COLOR", { r: 1, g: 0 });
    expect(token.$type).toBe("color");
    expect(token.$value).toBeUndefined();
    expect(error).toHaveBeenCalled();
  });
});

describe("number type inference", () => {
  // [variable name, scopes, expected $type, expected $value for 4.5]
  it.each([
    ["font/fontWeight", [], "fontWeight", 5],
    ["font/font-weight-bold", [], "fontWeight", 5],
    ["font/weight/bold", [], "fontWeight", 5],
    ["border/weight", [], "dimension", "4.5px"],
    ["layer/z-index", [], "number", 4.5],
    ["layer/zindex", [], "number", 4.5],
    ["z.layer/modal", [], "number", 4.5],
    ["z.index/modal", [], "number", 4.5],
    ["effect/opacity/50", [], "number", 4.5],
    ["type/size", ["FONT_SIZE"], "fontSize", "4.5px"],
    ["type/fontsize/md", [], "fontSize", "4.5px"],
    ["type/font-size-md", [], "fontSize", "4.5px"],
    ["type/Font_Size_MD", [], "fontSize", "4.5px"],
    ["type/font size md", [], "fontSize", "4.5px"],
    ["type/leading", ["LINE_HEIGHT"], "number", 4.5],
    ["type/lineheight/md", [], "number", 4.5],
    ["type/line-height-tight", [], "number", 4.5],
    ["type/Line_Height_Tight", [], "number", 4.5],
    ["type/line height tight", [], "number", 4.5],
    ["type/tracking-scope", ["LETTER_SPACING"], "letterSpacing", "4.5em"],
    ["type/letterspacing/wide", [], "letterSpacing", "4.5em"],
    ["type/letter-spacing-wide", [], "letterSpacing", "4.5em"],
    ["type/Letter-Spacing/Wide", [], "letterSpacing", "4.5em"],
    ["type/letter_spacing_wide", [], "letterSpacing", "4.5em"],
    ["type/letter spacing wide", [], "letterSpacing", "4.5em"],
    ["type/gap", ["PARAGRAPH_SPACING"], "paragraphSpacing", "4.5px"],
    ["type/paragraph/gap", [], "paragraphSpacing", "4.5px"],
    ["layout/gap", ["GAP"], "spacing", "4.5px"],
    ["layout/inset", ["PADDING"], "spacing", "4.5px"],
    ["layout/inset", ["SPACING"], "spacing", "4.5px"],
    ["layout/spacing/md", [], "spacing", "4.5px"],
    ["layout/space/md", [], "spacing", "4.5px"],
    ["shape/radius/md", ["SPACING"], "dimension", "4.5px"],
    ["shape/radius/md", ["BORDER_RADIUS"], "dimension", "4.5px"],
    ["shape/borderwidth/thin", [], "dimension", "4.5px"],
    ["shape/border-width/thin", [], "dimension", "4.5px"],
    ["border/spacing", [], "dimension", "4.5px"],
    ["box/w", ["WIDTH"], "dimension", "4.5px"],
    ["box/h", ["HEIGHT"], "dimension", "4.5px"],
    ["box/size/md", [], "dimension", "4.5px"],
    ["box/height/md", [], "dimension", "4.5px"],
    ["misc/thing", [], "dimension", "4.5px"],
    ["type/tracking/wide", [], "dimension", "4.5em"],
  ])("%s %j is exported as %s", async (name, scopes, type, value) => {
    const token = await single(name, "FLOAT", 4.5, { scopes });
    expect({ type: token.$type, value: token.$value }).toEqual({
      type,
      value,
    });
  });

  it("removes floating point noise", async () => {
    const token = await single("effect/opacity", "FLOAT", 0.05000000074505806);
    expect(token.$value).toBe(0.05);
  });
});

describe("string type inference", () => {
  it.each([
    ["motion/duration/fast", "duration"],
    ["motion/transition/base", "duration"],
    ["motion/animation/spin", "duration"],
    ["type/fontsize/md", "fontSize"],
    ["type/font-size/md", "fontSize"],
    ["type/fontweight/bold", "fontWeight"],
    ["type/weight/bold", "fontWeight"],
    ["type/lineheight/md", "lineHeight"],
    ["type/line-height/md", "lineHeight"],
    ["type/letterspacing/wide", "letterSpacing"],
    ["type/letter-spacing/wide", "letterSpacing"],
    ["type/fontfamily/sans", "fontFamily"],
    ["type/font/mono", "fontFamily"],
    ["effect/shadow/md", "shadow"],
    ["misc/anything", "fontFamily"],
  ])("%s is exported as %s and keeps its value", async (name, type) => {
    const token = await single(name, "STRING", "x");
    expect({ type: token.$type, value: token.$value }).toEqual({
      type,
      value: "x",
    });
  });

  it("exports booleans as booleans", async () => {
    const token = await single("flag/enabled", "BOOLEAN", true);
    expect(token).toEqual({ $type: "boolean", $value: true });
  });
});

describe("stored original type", () => {
  const withPluginData = (stored: string): Extra => ({
    getPluginData: (key: string) => (key === "originalType" ? stored : ""),
  });

  it("wins over the inferred type", async () => {
    const token = await single(
      "layout/gap",
      "FLOAT",
      0.5,
      withPluginData("number")
    );
    expect(token).toEqual({ $type: "number", $value: 0.5 });
  });

  it.each([
    ["typography/line-height/none", 100],
    ["typography/line-height/snug", 137.5],
    ["typography/line-height/normal", 150],
  ])(
    "round-trips the repo's line-height token %s as a plain number",
    async (name, value) => {
      // packages/tokens stores line heights as `$type: "number"` percent values
      // (100 to 200). The importer records that type, so the hyphenated name
      // must not be re-inferred as lineHeight (which would append "%").
      const token = await single(
        name,
        "FLOAT",
        value,
        withPluginData("number")
      );
      expect(token).toEqual({ $type: "number", $value: value });
    }
  );

  it("exports a hand-made line height exactly as the repo's token would be", async () => {
    // No stored type: inferred from the name, and still a plain number.
    const token = await single("typography/line-height/normal", "FLOAT", 150);
    expect(token).toEqual({ $type: "number", $value: 150 });
  });

  it("falls back to inference when the plugin data is empty", async () => {
    const token = await single(
      "layout/spacing",
      "FLOAT",
      4,
      withPluginData("")
    );
    expect(token).toEqual({ $type: "spacing", $value: "4px" });
  });

  it("reads the originalType property of a plain extracted variable", async () => {
    const token = await single("layout/gap", "FLOAT", 0.5, {
      originalType: "number",
    });
    expect(token).toEqual({ $type: "number", $value: 0.5 });
  });

  it.each(["borderRadius", "borderWidth", "sizing"])(
    "converts the legacy Tokens Studio type %s to dimension",
    async (legacy) => {
      const token = await single(
        "shape/thing",
        "FLOAT",
        4,
        withPluginData(legacy)
      );
      expect(token).toEqual({ $type: "dimension", $value: "4px" });
    }
  );

  it("turns spacing on a border or radius token into dimension", async () => {
    const token = await single(
      "shape/border-gap",
      "FLOAT",
      4,
      withPluginData("spacing")
    );
    expect(token.$type).toBe("dimension");
  });

  it("turns a fontFamily duration back into a duration", async () => {
    const token = await single(
      "motion/transition/fast",
      "STRING",
      "150ms",
      withPluginData("fontFamily")
    );
    expect(token).toEqual({ $type: "duration", $value: "150ms" });
  });

  it("uses em for tracking and letter-spacing dimensions", async () => {
    const letter = await single(
      "type/letter-spacing/wide",
      "FLOAT",
      0.05,
      withPluginData("dimension")
    );
    expect(letter.$value).toBe("0.05em");
  });

  it("formats letterSpacing, lineHeight and unknown stored types", async () => {
    const value = async (n: number, stored: string) =>
      (await single("a/b", "FLOAT", n, withPluginData(stored))).$value;
    expect(await value(0.1, "letterSpacing")).toBe("0.1em");
    expect(await value(150, "lineHeight")).toBe("150%");
    expect(await value(0.25, "custom")).toBe("0.25");
  });
});

describe("aliases", () => {
  it("writes a reference to another exported variable", async () => {
    const tokens = await exportTokens([
      variable("v1", "Color/Brand Primary", "COLOR", { r: 1, g: 0, b: 0 }),
      variable("v2", "color/link", "COLOR", {
        type: "VARIABLE_ALIAS",
        id: "v1",
      }),
    ]);
    expect(tokens["color.link"].$value).toBe("{color.brand.primary}");
  });

  it("marks a reference to a variable that is not in the file as unknown", async () => {
    const token = await single("color/link", "COLOR", {
      type: "VARIABLE_ALIAS",
      id: "gone",
    });
    expect(token.$value).toBe("{unknown-reference-gone}");
  });
});

describe("modes and descriptions", () => {
  it("adds valuesByMode for several modes and uses the first as the value", async () => {
    const tokens = await exportTokens(
      [
        variable("v1", "layout/spacing", "FLOAT", 4, {
          valuesByMode: { m1: 4, m2: 8 },
        }),
      ],
      [light, dark]
    );
    expect(tokens["layout.spacing"]).toEqual({
      $type: "spacing",
      $value: "4px",
      valuesByMode: { Light: "4px", Dark: "8px" },
    });
  });

  it("skips a mode without a value and warns", async () => {
    const tokens = await exportTokens(
      [
        variable("v1", "layout/gap", "FLOAT", 4, {
          valuesByMode: { m1: 4, m2: null } as never,
        }),
      ],
      [light, dark]
    );
    expect(tokens["layout.gap"].valuesByMode).toEqual({ Light: "4px" });
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("has no value for mode Dark")
    );
  });

  it("has no value at all when the first mode is missing", async () => {
    const token = await single("layout/gap", "FLOAT", undefined);
    expect(token.$value).toBeUndefined();
  });

  it("keeps a description only when there is one", async () => {
    const withText = await single("layout/gap", "FLOAT", 4, {
      description: "Base gap",
    });
    expect(withText.$description).toBe("Base gap");
    const without = await single("layout/gap", "FLOAT", 4, {
      description: "",
    });
    expect("$description" in without).toBe(false);
  });
});

describe("collections", () => {
  it("names modes deterministically from the collection and mode names", async () => {
    const data = await processCollection(
      collection(
        [variable("v1", "layout/gap", "FLOAT", 4)],
        [{ modeId: "1:2", name: "Light Mode!" }],
        "c9",
        "Semantic Colors"
      )
    );
    expect(data.modes).toEqual([
      { modeId: "mode:semantic-colors:light-mode", name: "Light Mode!" },
    ]);
  });

  it("skips the variable ids it is told to skip", async () => {
    const data = await processCollection(
      collection([
        variable("v1", "layout/gap", "FLOAT", 4),
        variable("v2", "layout/inset", "FLOAT", 8),
      ]),
      new Set(["v1"])
    );
    expect(Object.keys(data.variables)).toEqual(["layout.inset"]);
  });

  it("drops a variable that cannot be processed and keeps the rest", async () => {
    const broken = variable("v1", "layout/broken", "FLOAT", 1, {
      valuesByMode: undefined,
    });
    const tokens = await exportTokens([
      broken,
      variable("v2", "layout/gap", "FLOAT", 4),
    ]);
    expect(Object.keys(tokens)).toEqual(["layout.gap"]);
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining("Error processing variable layout/broken"),
      expect.any(Error)
    );
  });

  it("warns about unknown and empty collections and skips them", async () => {
    const empty = collection([], [light], "c2", "Empty");
    const noList = {
      id: "c3",
      name: "NoList",
      modes: [light],
    } as unknown as Collections[number];
    const data = await processCollectionsForExport(
      [empty, noList, collection([variable("v1", "layout/gap", "FLOAT", 4)])],
      ["missing", "c2", "c3", "c1"]
    );
    expect(data).toHaveLength(1);
    expect(warn).toHaveBeenCalledWith("Collection not found: missing");
    expect(warn).toHaveBeenCalledWith(
      "Collection Empty has no variables, skipping"
    );
    expect(warn).toHaveBeenCalledWith(
      "Collection NoList has no variables, skipping"
    );
  });

  it("omits a collection whose variables are all skipped", async () => {
    const data = await processCollectionsForExport(
      [collection([variable("v1", "motion/easing", "EASING", {})])],
      ["c1"]
    );
    expect(data).toEqual([]);
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("processed but resulted in 0 tokens")
    );
  });
});

describe("findUnsupportedVariables", () => {
  it("explains types that are neither native motion nor supported", () => {
    const found = findUnsupportedVariables([
      collection([variable("v1", "x/y", "VARIABLE_COLLECTION", 1)]),
    ]);
    expect(found).toEqual([
      expect.objectContaining({
        reason: "variables of type VARIABLE_COLLECTION are not exported",
      }),
    ]);
  });
});

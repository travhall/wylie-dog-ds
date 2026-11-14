import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { nativeToDtcg } from "./dtcg-convert.js";
import {
  isDtcgSyncDir,
  readSyncCollection,
  readSyncCollections,
  writeSyncCollections,
} from "./read-sync.js";

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

const native = () => ({
  primitive: collection("primitive", ["Value"], {
    "color.coral": { $type: "color", $value: "oklch(0.6 0.1 30)" },
    "space.100": { $type: "spacing", $value: "8px" },
  }),
  semantic: collection("semantic", ["Light", "Dark"], {
    "color.bg": {
      $type: "color",
      $value: "{color.coral}",
      $description: "Page background.",
      valuesByMode: { Light: "{color.coral}", Dark: "{color.coral}" },
    },
  }),
});

const writeNativeDir = (dir, collections) => {
  mkdirSync(dir, { recursive: true });
  for (const [name, data] of Object.entries(collections)) {
    writeFileSync(join(dir, `${name}.json`), JSON.stringify(data, null, 2));
  }
};

const writeDtcgDir = (dir, collections) => {
  mkdirSync(dir, { recursive: true });
  const { files, resolver } = nativeToDtcg(Object.values(collections));
  for (const [name, tree] of Object.entries(files)) {
    writeFileSync(join(dir, name), JSON.stringify(tree, null, 2));
  }
  writeFileSync(join(dir, "tokens.resolver.json"), JSON.stringify(resolver));
};

const withTmp = async (fn) => {
  const root = await mkdtemp(join(tmpdir(), "read-sync-"));
  try {
    await fn(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
};

test("reads a native directory, keyed by collection name", () =>
  withTmp(async (root) => {
    writeNativeDir(root, native());
    assert.equal(isDtcgSyncDir(root), false);
    assert.deepStrictEqual(readSyncCollections(root), native());
  }));

test("reads a DTCG directory as the same native collections", () =>
  withTmp(async (root) => {
    writeDtcgDir(root, native());
    assert.equal(isDtcgSyncDir(root), true);
    assert.deepStrictEqual(readSyncCollections(root), native());
  }));

test("readSyncCollection returns the native file array, like JSON.parse of the old file", () =>
  withTmp(async (root) => {
    writeDtcgDir(root, native());
    const file = readSyncCollection(root, "semantic");
    assert.equal(Array.isArray(file), true);
    assert.deepStrictEqual(
      Object.assign({}, ...file).semantic.variables["color.bg"].valuesByMode,
      { Light: "{color.coral}", Dark: "{color.coral}" }
    );
  }));

test("readSyncCollection names the directory and collection when it is missing", () =>
  withTmp(async (root) => {
    writeNativeDir(root, native());
    assert.throws(
      () => readSyncCollection(root, "components"),
      /No collection "components"/
    );
  }));

test("writes a native directory as one 2-space JSON file per collection", () =>
  withTmp(async (root) => {
    writeNativeDir(root, native());
    const all = readSyncCollections(root);
    all.primitive[0].primitive.variables["color.coral"].$value =
      "oklch(0.7 0.1 30)";

    assert.deepEqual(writeSyncCollections(root, all), { layout: "native" });

    const text = readFileSync(join(root, "primitive.json"), "utf8");
    assert.equal(text, JSON.stringify(all.primitive, null, 2) + "\n");
    assert.equal(
      readSyncCollection(root, "primitive")[0].primitive.variables[
        "color.coral"
      ].$value,
      "oklch(0.7 0.1 30)"
    );
  }));

test("writes a DTCG directory in DTCG and keeps an adopter's resolver additions", () =>
  withTmp(async (root) => {
    writeDtcgDir(root, native());
    const resolverPath = join(root, "tokens.resolver.json");
    const edited = JSON.parse(readFileSync(resolverPath, "utf8"));
    edited.description = "Hand edited";
    writeFileSync(resolverPath, JSON.stringify(edited));

    const all = readSyncCollections(root);
    all.semantic[0].semantic.variables["color.bg"].valuesByMode.Dark =
      "oklch(0.2 0 0)";

    assert.deepEqual(writeSyncCollections(root, all), { layout: "dtcg" });

    assert.equal(
      JSON.parse(readFileSync(resolverPath, "utf8")).description,
      "Hand edited"
    );
    const back = readSyncCollection(root, "semantic");
    assert.equal(
      back[0].semantic.variables["color.bg"].valuesByMode.Dark,
      "oklch(0.2 0 0)"
    );
    // The files are the contract format, not native.
    assert.equal(isDtcgSyncDir(root), true);
    assert.equal(
      JSON.parse(readFileSync(join(root, "semantic.dark.json"), "utf8")).color
        .bg.$value.colorSpace,
      "oklch"
    );
  }));

test("the real io/sync reads as three collections, whichever layout it is in", () => {
  const all = readSyncCollections(
    new URL("../io/sync", import.meta.url).pathname
  );
  assert.deepEqual(Object.keys(all).sort(), [
    "components",
    "primitive",
    "semantic",
  ]);
  const count = Object.values(all)
    .flat()
    .reduce((n, c) => n + Object.keys(Object.values(c)[0].variables).length, 0);
  assert.equal(count, 1520);
});

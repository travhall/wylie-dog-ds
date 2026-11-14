// Reads and writes the token files of a sync directory (packages/tokens/io/sync)
// in whichever layout it holds, and always speaks the native collection shape:
//
//   { primitive: [ { primitive: { modes, variables } } ], semantic: [...], ... }
//
// A directory with a tokens.resolver.json is the DTCG token contract
// (documentation/tokens/dtcg-contract.md); anything else is native collection
// files. Scripts, guardrails and tests read through this instead of opening
// io/sync/*.json themselves, so they do not care which layout the repository
// uses and keep working when it changes.

import fs from "node:fs";
import { join } from "node:path";
import { dtcgToNative, mergeResolver, nativeToDtcg } from "./dtcg-convert.js";

export const RESOLVER_FILE = "tokens.resolver.json";

const readJson = (path) => JSON.parse(fs.readFileSync(path, "utf8"));

/** The byte format every sync file is written in (and what Token Bridge pushes). */
const serialize = (data) => JSON.stringify(data, null, 2) + "\n";

/** Is this sync directory in the DTCG token contract layout? */
export function isDtcgSyncDir(dir) {
  return fs.existsSync(join(dir, RESOLVER_FILE));
}

/** The files a resolver names (sets and modifier contexts). */
function resolverFiles(resolver) {
  const refs = new Set();
  for (const set of Object.values(resolver.sets ?? {})) {
    for (const source of set.sources) refs.add(source.$ref);
  }
  for (const modifier of Object.values(resolver.modifiers ?? {})) {
    for (const sources of Object.values(modifier.contexts)) {
      for (const source of sources) refs.add(source.$ref);
    }
  }
  return [...refs];
}

/** Every collection of a sync directory, keyed by collection name. */
export function readSyncCollections(dir) {
  if (isDtcgSyncDir(dir)) {
    const resolver = readJson(join(dir, RESOLVER_FILE));
    const files = {};
    for (const ref of resolverFiles(resolver)) {
      files[ref] = readJson(join(dir, ref));
    }
    return dtcgToNative(resolver, files);
  }

  const collections = {};
  for (const file of fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .sort()) {
    const data = readJson(join(dir, file));
    const [name] = Object.keys(data[0]);
    collections[name] = data;
  }
  return collections;
}

/**
 * One collection as the native file array (`[ { name: { modes, variables } } ]`),
 * the same value `JSON.parse(fs.readFileSync("io/sync/<name>.json"))` gave before.
 */
export function readSyncCollection(dir, name) {
  const collection = readSyncCollections(dir)[name];
  if (!collection) {
    throw new Error(`No collection "${name}" in ${dir}`);
  }
  return collection;
}

/**
 * Write every collection back in the directory's layout. The generators that
 * add or rename tokens use this: read all collections, change them, write all.
 * A DTCG directory gets token files plus a resolver merged into the existing
 * one (an adopter's additions survive); a native directory gets one
 * <collection>.json per collection. A value DTCG cannot represent throws.
 */
export function writeSyncCollections(dir, collections) {
  fs.mkdirSync(dir, { recursive: true });

  if (isDtcgSyncDir(dir)) {
    const existing = readJson(join(dir, RESOLVER_FILE));
    const { files, resolver } = nativeToDtcg(Object.values(collections));
    for (const [name, tree] of Object.entries(files)) {
      fs.writeFileSync(join(dir, name), serialize(tree));
    }
    fs.writeFileSync(
      join(dir, RESOLVER_FILE),
      serialize(mergeResolver(existing, resolver))
    );
    return { layout: "dtcg" };
  }

  for (const [name, data] of Object.entries(collections)) {
    fs.writeFileSync(join(dir, `${name}.json`), serialize(data));
  }
  return { layout: "native" };
}

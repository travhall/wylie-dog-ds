#!/usr/bin/env node
// Convert the native sync files (io/sync) to the strict DTCG token contract.
//
//   node scripts/convert-sync-to-dtcg.mjs --out <dir> [--in io/sync]
//
// Writes one token file per collection and mode plus tokens.resolver.json into
// <dir>. It never writes into the input directory, so it is safe to run on the
// real io/sync. Format: documentation/tokens/dtcg-contract.md.

import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { nativeToDtcg } from "../lib/dtcg-convert.js";

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const i = args.indexOf(name);
  return i === -1 ? fallback : args[i + 1];
};

const inDir = option("--in", "io/sync");
const outDir = option("--out");

if (!outDir) {
  console.error(
    "Usage: node scripts/convert-sync-to-dtcg.mjs --out <dir> [--in io/sync]"
  );
  process.exit(1);
}
if (outDir === inDir) {
  console.error(
    "--out must differ from --in; this script never overwrites the input."
  );
  process.exit(1);
}

const names = (await readdir(inDir)).filter((f) => f.endsWith(".json")).sort();
const native = [];
for (const name of names) {
  native.push(JSON.parse(await readFile(join(inDir, name), "utf8")));
}

const { files, resolver } = nativeToDtcg(native);

await mkdir(outDir, { recursive: true });
const write = (name, data) =>
  writeFile(join(outDir, name), `${JSON.stringify(data, null, 2)}\n`);

for (const [name, tree] of Object.entries(files)) await write(name, tree);
await write("tokens.resolver.json", resolver);

console.log(
  `Converted ${names.length} native file(s) to ${Object.keys(files).length} token file(s) and tokens.resolver.json in ${outDir}`
);

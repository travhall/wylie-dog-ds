import { test } from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import {
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { TokenIOProcessor } from "../scripts/process-token-io.js";
import { nativeToDtcg } from "./dtcg-convert.js";
import { readSyncCollections } from "./read-sync.js";

const run = promisify(execFile);
const packageRoot = new URL("..", import.meta.url).pathname;
const realSyncDir = join(packageRoot, "io/sync");

// The real tokens as native collections, whichever layout io/sync is in.
const realCollections = () => readSyncCollections(realSyncDir);

/** The real tokens as native collection files under `dir`. */
async function writeNativeDir(dir) {
  await mkdir(dir, { recursive: true });
  for (const [name, data] of Object.entries(realCollections())) {
    await writeFile(join(dir, `${name}.json`), JSON.stringify(data, null, 2));
  }
}

/** The real tokens converted into a DTCG sync directory under `dir`. */
async function writeDtcgDir(dir) {
  const native = Object.values(realCollections());
  const { files, resolver } = nativeToDtcg(native);
  await mkdir(dir, { recursive: true });
  for (const [name, tree] of Object.entries(files)) {
    await writeFile(join(dir, name), JSON.stringify(tree, null, 2));
  }
  await writeFile(join(dir, "tokens.resolver.json"), JSON.stringify(resolver));
}

const quiet = async (fn) => {
  const log = console.log;
  const warn = console.warn;
  console.log = () => {};
  console.warn = () => {};
  try {
    return await fn();
  } finally {
    console.log = log;
    console.warn = warn;
  }
};

test("DTCG input gives the same tokens and values as the native files", async () => {
  const root = await mkdtemp(join(tmpdir(), "dtcg-process-"));
  try {
    await writeDtcgDir(join(root, "sync"));
    await writeNativeDir(join(root, "native"));

    const native = new TokenIOProcessor(
      join(root, "native"),
      join(root, "processed-a")
    );
    const dtcg = new TokenIOProcessor(
      join(root, "sync"),
      join(root, "processed-b")
    );
    const fromNative = await quiet(() => native.processInputFiles());
    const fromDtcg = await quiet(() => dtcg.processInputFiles());

    assert.equal(native.dtcg, false);
    assert.equal(dtcg.dtcg, true);
    // deepStrictEqual ignores key order; only order differs, because a nested
    // tree cannot keep the old flat order (integer-like keys sort first).
    assert.deepStrictEqual(fromDtcg, fromNative);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

const hashDir = async (dir) => {
  const out = {};
  for (const name of (await readdir(dir)).sort()) {
    out[name] = createHash("sha256")
      .update(await readFile(join(dir, name)))
      .digest("hex");
  }
  return out;
};

test("processing a DTCG directory never writes back into it", async () => {
  const root = await mkdtemp(join(tmpdir(), "dtcg-writeback-"));
  try {
    const sync = join(root, "sync");
    await writeDtcgDir(sync);
    const before = await hashDir(sync);

    await run(
      "node",
      [
        join(packageRoot, "scripts/process-token-io.js"),
        "--sync",
        sync,
        "--processed",
        join(root, "processed"),
      ],
      { cwd: packageRoot }
    );

    assert.deepEqual(await hashDir(sync), before);
    assert.equal((await readdir(join(root, "processed"))).length, 5);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

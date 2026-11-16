import { afterEach, describe, expect, it, vi } from "vitest";
import JSZip from "jszip";
import {
  backupFileName,
  backupFiles,
  downloadBackup,
  hasBackupContent,
} from "../backup";
import type { ExportData } from "../../../plugin/variables/processor";

const figma: ExportData[] = [
  {
    "Brand Colors": {
      modes: ["Default"],
      variables: { "color.red": { $type: "color", $value: "#ff0000" } },
    },
  },
  {
    primitive: {
      variables: { "space.1": { $type: "number", $value: 4 } },
    },
  },
] as unknown as ExportData[];

describe("backupFileName", () => {
  it("is sortable and in local time", () => {
    expect(backupFileName(new Date(2026, 10, 5, 9, 7))).toBe(
      "figma-backup-2026-11-05-0907.zip"
    );
  });
});

describe("backupFiles", () => {
  it("writes one native collection file per collection, losslessly", () => {
    const files = backupFiles(figma);
    expect(files.map((f) => f.filename)).toEqual([
      "brand-colors.json",
      "primitive.json",
    ]);
    // What the plugin's Import reads: an array holding the one collection.
    expect(JSON.parse(files[0].content)).toEqual([
      { "Brand Colors": figma[0]["Brand Colors"] },
    ]);
    expect(JSON.parse(files[1].content)).toEqual([
      { primitive: figma[1].primitive },
    ]);
  });
});

describe("hasBackupContent", () => {
  it("is false when Figma holds no variables", () => {
    expect(hasBackupContent([])).toBe(false);
    expect(
      hasBackupContent([{ primitive: { variables: {} } }] as ExportData[])
    ).toBe(false);
  });

  it("is true when any collection has a variable", () => {
    expect(hasBackupContent(figma)).toBe(true);
  });
});

describe("downloadBackup", () => {
  afterEach(() => vi.restoreAllMocks());

  it("downloads a zip of the collection files under the dated name", async () => {
    let blob: Blob | undefined;
    URL.createObjectURL = vi.fn((b: Blob) => {
      blob = b;
      return "blob:backup";
    });
    URL.revokeObjectURL = vi.fn();
    const downloads: string[] = [];
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
      this: HTMLAnchorElement
    ) {
      downloads.push(this.download);
    });

    const name = await downloadBackup(figma, new Date(2026, 10, 15, 14, 32));

    expect(name).toBe("figma-backup-2026-11-15-1432.zip");
    expect(downloads).toEqual([name]);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:backup");
    const zip = await JSZip.loadAsync(await blob!.arrayBuffer());
    expect(Object.keys(zip.files).sort()).toEqual([
      "brand-colors.json",
      "primitive.json",
    ]);
    const primitive = await zip.file("primitive.json")!.async("string");
    expect(JSON.parse(primitive)).toEqual([{ primitive: figma[1].primitive }]);
  });
});

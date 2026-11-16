/**
 * Backup before a replace-Pull (plan 224, slice 3.6).
 *
 * A Pull replaces the variables in every collection it imports and the Figma
 * API has no undo, so the review offers a download of what Figma holds right
 * now. The files are the plugin's own native export, one `<collection>.json`
 * each: lossless (the DTCG layout can skip tokens it cannot represent) and
 * re-importable once unzipped (the Import tab takes .json files, not a zip).
 */
import { prepareNativeFiles } from "../../plugin/github/sync-files";
import type { SyncFile } from "../../plugin/github/sync-files";
import type { ExportData } from "../../plugin/variables/processor";

/** `figma-backup-2026-11-15-1432.zip`, local time, sortable. */
export function backupFileName(now: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const day = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  return `figma-backup-${day}-${pad(now.getHours())}${pad(now.getMinutes())}.zip`;
}

/** The files a backup holds: one native collection file per collection. */
export function backupFiles(localTokens: ExportData[]): SyncFile[] {
  return prepareNativeFiles(localTokens);
}

/** True when Figma holds no variables, so there is nothing worth saving. */
export function hasBackupContent(localTokens: ExportData[]): boolean {
  return localTokens.some((collection) =>
    Object.values(collection).some(
      (data) => Object.keys(data?.variables ?? {}).length > 0
    )
  );
}

/** Zip the backup and hand it to the browser as a download. */
export async function downloadBackup(
  localTokens: ExportData[],
  now: Date = new Date()
): Promise<string> {
  // Loaded on demand, as the export download does, to keep the UI bundle small.
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  for (const file of backupFiles(localTokens)) {
    zip.file(file.filename, file.content);
  }
  const blob = await zip.generateAsync({ type: "blob" });
  const filename = backupFileName(now);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return filename;
}

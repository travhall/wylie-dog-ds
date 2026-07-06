import { describe, it, expect } from "vitest";
import { SyncMetadataManager } from "../metadata-manager";
import type { ProcessedToken } from "../../variables/processor";
import type { ProcessedTokenWithSync, SyncMetadata } from "../types";

const manager = new SyncMetadataManager();

const token = (overrides: Partial<ProcessedToken> = {}): ProcessedToken => ({
  $type: "color",
  $value: "#ff0000",
  ...overrides,
});

describe("SyncMetadataManager", () => {
  describe("generateTokenHash", () => {
    it("produces the same hash for identical tokens", () => {
      const a = token();
      const b = token();
      expect(manager.generateTokenHash(a)).toBe(manager.generateTokenHash(b));
    });

    it("produces a different hash when $value changes", () => {
      const a = token({ $value: "#ff0000" });
      const b = token({ $value: "#00ff00" });
      expect(manager.generateTokenHash(a)).not.toBe(
        manager.generateTokenHash(b)
      );
    });

    it("produces a different hash when $description changes", () => {
      const a = token({ $description: "Primary red" });
      const b = token({ $description: "Danger red" });
      expect(manager.generateTokenHash(a)).not.toBe(
        manager.generateTokenHash(b)
      );
    });

    it("produces a different hash when valuesByMode changes", () => {
      const a = token({ valuesByMode: { Light: "#fff", Dark: "#000" } });
      const b = token({ valuesByMode: { Light: "#fff", Dark: "#111" } });
      expect(manager.generateTokenHash(a)).not.toBe(
        manager.generateTokenHash(b)
      );
    });
  });

  describe("addSyncMetadata", () => {
    it("stamps source, hash, version 1, and a syncId onto a fresh token", () => {
      const result = manager.addSyncMetadata(token(), "local");
      expect(result.$syncMetadata?.source).toBe("local");
      expect(result.$syncMetadata?.version).toBe(1);
      expect(result.$syncMetadata?.syncId).toBeTruthy();
      expect(result.$syncMetadata?.hash).toBe(
        manager.generateTokenHash(token())
      );
    });

    it("defaults source to 'local' when not specified", () => {
      const result = manager.addSyncMetadata(token());
      expect(result.$syncMetadata?.source).toBe("local");
    });
  });

  describe("updateSyncMetadata", () => {
    it("increments version when prior metadata exists", () => {
      const withMeta = manager.addSyncMetadata(token());
      const updated = manager.updateSyncMetadata(withMeta, "remote");
      expect(updated.$syncMetadata?.version).toBe(2);
      expect(updated.$syncMetadata?.source).toBe("remote");
    });

    it("preserves the original syncId across updates", () => {
      const withMeta = manager.addSyncMetadata(token());
      const originalSyncId = withMeta.$syncMetadata?.syncId;
      const updated = manager.updateSyncMetadata(withMeta);
      expect(updated.$syncMetadata?.syncId).toBe(originalSyncId);
    });

    it("starts at version 1 if no prior metadata exists", () => {
      const bare = token() as ProcessedTokenWithSync;
      const updated = manager.updateSyncMetadata(bare);
      expect(updated.$syncMetadata?.version).toBe(1);
    });
  });

  describe("hasTokenChanged", () => {
    it("returns false when both tokens have identical data", () => {
      const local = manager.addSyncMetadata(token(), "local");
      const remote = manager.addSyncMetadata(token(), "remote");
      expect(manager.hasTokenChanged(local, remote)).toBe(false);
    });

    it("returns true when $value differs", () => {
      const local = manager.addSyncMetadata(token({ $value: "#ff0000" }));
      const remote = manager.addSyncMetadata(token({ $value: "#00ff00" }));
      expect(manager.hasTokenChanged(local, remote)).toBe(true);
    });

    it("always regenerates hashes from live data, ignoring a stale stored hash", () => {
      // Construct two tokens whose *stored* $syncMetadata.hash values match
      // (as if metadata went stale) but whose actual $value differs — per
      // the code comment at metadata-manager.ts:148-149, hasTokenChanged
      // must trust the live data, not the stored hash.
      const staleMetadata: SyncMetadata = {
        lastModified: "2020-01-01T00:00:00.000Z",
        source: "local",
        hash: "same-stale-hash",
        version: 1,
      };
      const local: ProcessedTokenWithSync = {
        ...token({ $value: "#ff0000" }),
        $syncMetadata: staleMetadata,
      };
      const remote: ProcessedTokenWithSync = {
        ...token({ $value: "#00ff00" }),
        $syncMetadata: { ...staleMetadata },
      };

      expect(manager.hasTokenChanged(local, remote)).toBe(true);
    });
  });

  describe("embedSyncMetadataInDescription / extractSyncMetadataFromDescription", () => {
    const metadata: SyncMetadata = {
      lastModified: "2026-01-01T00:00:00.000Z",
      source: "local",
      hash: "abc123",
      version: 1,
      syncId: "sync_test_1",
    };

    it("round-trips metadata through a description string", () => {
      const embedded = manager.embedSyncMetadataInDescription(
        "Primary color",
        metadata
      );
      const extracted = manager.extractSyncMetadataFromDescription(embedded);
      expect(extracted).toEqual(metadata);
    });

    it("preserves existing description text alongside the metadata marker", () => {
      const embedded = manager.embedSyncMetadataInDescription(
        "Primary color",
        metadata
      );
      expect(embedded.startsWith("Primary color")).toBe(true);
    });

    it("replaces old metadata rather than duplicating it when embedding twice", () => {
      const first = manager.embedSyncMetadataInDescription(
        "Primary color",
        metadata
      );
      const second = manager.embedSyncMetadataInDescription(first, {
        ...metadata,
        version: 2,
      });
      const extracted = manager.extractSyncMetadataFromDescription(second);
      expect(extracted?.version).toBe(2);
      expect((second.match(/SYNC_METADATA/g) ?? []).length).toBe(1);
    });

    it("returns null for a description with no metadata marker", () => {
      expect(
        manager.extractSyncMetadataFromDescription("Just a plain description")
      ).toBeNull();
    });

    it("returns null instead of throwing for a malformed metadata marker", () => {
      const malformed = "Some text <!-- SYNC_METADATA:{not valid json-->";
      expect(() =>
        manager.extractSyncMetadataFromDescription(malformed)
      ).not.toThrow();
      expect(manager.extractSyncMetadataFromDescription(malformed)).toBeNull();
    });
  });
});

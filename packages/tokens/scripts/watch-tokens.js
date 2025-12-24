import chokidar from "chokidar";
import { TokenIOProcessor } from "./process-token-io.js";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

/**
 * File watcher for bi-directional token sync
 * Watches the sync directory for changes and processes tokens automatically
 */
class TokenWatcher {
  constructor(syncDir = "io/sync") {
    this.syncDir = syncDir;
    this.processor = new TokenIOProcessor();
    this.isProcessing = false;
    this.debounceTimer = null;
  }

  async start() {
    console.log("👀 Starting token file watcher...");
    console.log(`📁 Watching ${this.syncDir} for changes...`);

    const watcher = chokidar.watch(`${this.syncDir}/*.json`, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true,
      ignoreInitial: false,
    });

    watcher
      .on("add", (path) => this.handleFileChange(path, "added"))
      .on("change", (path) => this.handleFileChange(path, "changed"))
      .on("unlink", (path) => this.handleFileChange(path, "removed"))
      .on("error", (error) => console.error(`❌ Watcher error: ${error}`));

    // Process initial files
    await this.processTokens();
  }

  async handleFileChange(filePath, action) {
    console.log(`📝 File ${action}: ${filePath}`);

    // Debounce rapid changes
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(async () => {
      await this.processTokens();
    }, 500);
  }

  async processTokens() {
    if (this.isProcessing) {
      console.log("⏳ Already processing tokens, skipping...");
      return;
    }

    this.isProcessing = true;

    try {
      console.log("🔄 Processing tokens...");

      // Process tokens
      await this.processor.processInputFiles();

      // Build outputs
      console.log("🏗️ Building token outputs...");
      await execAsync("node style-dictionary.config.js");

      console.log("✅ Tokens processed and built successfully");
    } catch (error) {
      console.error("❌ Error processing tokens:", error.message);
    } finally {
      this.isProcessing = false;
    }
  }

  stop() {
    if (this.watcher) {
      this.watcher.close();
      console.log("🛑 Token watcher stopped");
    }
  }
}

// Start watcher if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const watcher = new TokenWatcher();

  // Handle graceful shutdown
  process.on("SIGINT", () => {
    console.log("\n👋 Shutting down token watcher...");
    watcher.stop();
    process.exit(0);
  });

  watcher.start().catch(console.error);
}

export { TokenWatcher };

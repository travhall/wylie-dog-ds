/**
 * Token Bridge - Main Application Component (Refactored)
 *
 * Integrates:
 * - usePluginMessages hook for plugin communication (with callback registration)
 * - UIState context for UI state management
 * - useGitHubSync hook for GitHub operations (auto-registers callbacks)
 * - Tab-based navigation
 *
 * Circular dependency resolved via callback registration pattern.
 * Target: <400 lines (currently ~380)
 */

import { render } from "preact";
import { useState, useCallback, useEffect } from "preact/hooks";
import { UIProvider, useUIContext } from "./state";
import { usePluginMessages } from "./hooks/usePluginMessages";
import { useGitHubSync } from "./hooks/domain/useGitHubSync";
import { ConflictAwareGitHubClient } from "../plugin/sync/conflict-aware-github-client";
import type { GitHubConfig } from "../shared/types";
import type { ConflictResolution } from "../plugin/sync/types";
import { handleNetworkRequest } from "./utils/network-handler";
import type { NetworkRequest } from "../shared/network-types";

// Components
import { TabBar } from "./components/layout/TabBar";
import { TokensTab } from "./components/tabs/TokensTab";
import { SyncTab } from "./components/tabs/SyncTab";
import { EnhancedErrorDisplay } from "./components/EnhancedErrorDisplay";
import { SuccessToast } from "./components/Toast";
import { ConflictResolutionDisplay } from "./components/ConflictResolutionDisplay";
import { ValidationDisplay } from "./components/ValidationDisplay";
import { ProgressFeedback } from "./components/ProgressFeedback";
import { OnboardingScreen } from "./components/OnboardingScreen";
import { ExistingTokensImporter } from "./components/ExistingTokensImporter";
import { FormatGuidelinesDialog } from "./components/FormatGuidelinesDialog";
import { HelpMenu } from "./components/HelpMenu";
import { TransformationSummary } from "./components/TransformationSummary";
import { Icon } from "./components/common/Icon";

console.log("App.tsx loaded");

/**
 * Main App Component (Inner - has access to context)
 */
function AppInner() {
  console.log("App component rendering");

  // UI State from context
  const { state: uiState, dispatch } = useUIContext();

  // GitHub client (singleton)
  const [githubClient] = useState(() => new ConflictAwareGitHubClient());

  // selectedCollections is now managed in UIContext
  const selectedCollections = uiState.selectedCollections;

  // Modals (local state)
  const [showExistingTokensImporter, setShowExistingTokensImporter] =
    useState(false);
  const [showFormatGuidelines, setShowFormatGuidelines] = useState(false);

  // Import preview state
  const [importPreviewData, setImportPreviewData] = useState<any>(null);
  const [pendingImportFiles, setPendingImportFiles] = useState<any[]>([]);

  // Transformation summary state
  const [transformationSummary, setTransformationSummary] = useState<any>(null);

  // Plugin Messages Hook - no longer needs GitHub handlers as parameters
  const [pluginState, pluginActions] = usePluginMessages(githubClient);

  // GitHub Sync Hook - automatically registers its handlers with pluginActions
  const {
    handleGitHubConfigTest,
    handleGitHubSync,
    handleGitHubPull,
    handleConflictResolution,
  } = useGitHubSync(
    githubClient,
    pluginActions,
    pluginState.pendingTokensForConflictResolution,
    pluginState.conflictOperationType,
    // Callback to clear selection after successful sync
    () => dispatch({ type: "DESELECT_ALL_COLLECTIONS" })
  );

  // Handle import-validated and network request messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const msg = event.data.pluginMessage;
      if (!msg) return;

      // Handle network proxy requests
      if (msg.type === "network-request") {
        const request: NetworkRequest = {
          id: msg.id,
          url: msg.url,
          options: msg.options,
        };
        handleNetworkRequest(request);
        return;
      }

      if (msg.type === "import-validated") {
        console.log("Import validated:", msg.summary);
        pluginActions.setLoading(false);
        pluginActions.setLoadingMessage("");
        setImportPreviewData(msg.summary);
      } else if (msg.type === "import-validation-error") {
        console.error("Import validation error:", msg.error);
        pluginActions.setLoading(false);
        pluginActions.setLoadingMessage("");
        pluginActions.setError(msg.error);
      } else if (msg.type === "tokens-imported" && msg.result?.success) {
        // Show transformation summary after successful import
        console.log("Tokens imported successfully, showing summary");
        setTransformationSummary({
          format: msg.adapterResults?.[0]?.detection?.format || "Unknown",
          collectionsImported: msg.result.collectionsImported || 0,
          tokensImported: msg.result.tokensImported || 0,
          transformations:
            msg.adapterResults?.[0]?.normalization?.transformations?.reduce(
              (acc: any[], t: any) => {
                const existing = acc.find((x) => x.type === t.type);
                if (existing) {
                  existing.count++;
                } else {
                  acc.push({ type: t.type, count: 1 });
                }
                return acc;
              },
              []
            ) || [],
          warnings: msg.result.warnings || [],
        });
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [pluginActions]);

  // Close validation display when active tab changes
  useEffect(() => {
    pluginActions.setShowValidation(false);
  }, [uiState.activeTab]);

  // Auto-switch to Tokens tab after successful import
  useEffect(() => {
    if (pluginState.shouldSwitchToTokensTab) {
      console.log("Switching to Tokens tab after import");
      dispatch({ type: "SET_TAB", tab: "tokens" });
      pluginActions.clearShouldSwitchToTokensTab();
    }
  }, [pluginState.shouldSwitchToTokensTab, dispatch, pluginActions]);

  // Auto-download exported files
  useEffect(() => {
    if (pluginState.downloadQueue && pluginState.downloadQueue.length > 0) {
      const fileCount = pluginState.downloadQueue.length;
      console.log(
        `📦 Starting download for ${fileCount} file${fileCount !== 1 ? "s" : ""}`
      );

      const downloadFiles = async () => {
        try {
          if (fileCount === 1) {
            // Single file - direct download
            const file = pluginState.downloadQueue[0];
            console.log(`📄 Downloading single file: ${file.filename}`);
            const blob = new Blob([file.content], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = file.filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            console.log(`✅ Downloaded: ${file.filename}`);
          } else {
            // Multiple files - create zip
            console.log(`📦 Creating zip archive with ${fileCount} files`);

            // Dynamic import for JSZip to reduce bundle size
            const { default: JSZip } = await import("jszip");
            const zip = new JSZip();

            pluginState.downloadQueue.forEach((file) => {
              console.log(`  Adding to zip: ${file.filename}`);
              zip.file(file.filename, file.content);
            });

            console.log(`🔨 Generating zip file...`);
            const zipBlob = await zip.generateAsync({ type: "blob" });

            console.log(`💾 Triggering zip download`);
            const url = URL.createObjectURL(zipBlob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "token-collections.zip";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            console.log(
              `✅ Downloaded: token-collections.zip (${fileCount} files)`
            );
          }

          pluginActions.clearDownloadQueue();
        } catch (error) {
          console.error(`❌ Error creating download:`, error);
          pluginActions.setError("Failed to download files. Please try again.");
          pluginActions.clearDownloadQueue();
        }
      };

      downloadFiles();
    }
  }, [pluginState.downloadQueue, pluginActions]);

  // Token Import Handler - now with preview
  const handleTokenImport = useCallback(() => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".json";
    fileInput.multiple = true;

    fileInput.onchange = async (event) => {
      const files = (event.target as HTMLInputElement).files;
      if (!files || files.length === 0) return;

      pluginActions.setLoading(true);
      pluginActions.setLoadingMessage("Validating files...");
      pluginActions.setError(null);

      try {
        const fileContents = [];
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const content = await readFileAsText(file);
          fileContents.push({
            filename: file.name,
            content: content,
          });
        }

        // Store files for later import
        setPendingImportFiles(fileContents);

        // Send validation request (will trigger import-validated message)
        pluginActions.sendMessage({
          type: "validate-import",
          files: fileContents,
        });
      } catch (err) {
        console.error("Failed to read files:", err);
        pluginActions.setError(
          `Failed to read files: ${err instanceof Error ? err.message : "Unknown error"}`
        );
        pluginActions.setLoading(false);
        pluginActions.setLoadingMessage("");
      }
    };

    fileInput.click();
  }, [pluginActions]);

  // Confirm import after preview
  const handleConfirmImport = useCallback(() => {
    setImportPreviewData(null);
    pluginActions.setLoading(true);
    pluginActions.setLoadingMessage("Importing tokens...");
    pluginActions.setCurrentOperation("token-import");

    pluginActions.sendMessage({
      type: "import-tokens",
      files: pendingImportFiles,
    });
  }, [pendingImportFiles, pluginActions]);

  // Cancel import
  const handleCancelImport = useCallback(() => {
    setImportPreviewData(null);
    setPendingImportFiles([]);
    pluginActions.setLoading(false);
    pluginActions.setLoadingMessage("");
  }, [pluginActions]);

  // Helper to read file as text
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () =>
        reject(new Error(`Failed to read file: ${file.name}`));
      reader.readAsText(file);
    });
  };

  // Onboarding Handlers
  const handleGenerateDemoTokens = useCallback(() => {
    dispatch({ type: "COMPLETE_ONBOARDING" });
    pluginActions.setLoading(true);
    pluginActions.setLoadingMessage("Loading demo tokens...");
    pluginActions.sendMessage({ type: "generate-demo-tokens" });
  }, [dispatch, pluginActions]);

  const handleImportFigmaVariables = useCallback(() => {
    dispatch({ type: "COMPLETE_ONBOARDING" });
    setShowExistingTokensImporter(true);
  }, [dispatch]);

  const handleImportFromGitHub = useCallback(() => {
    dispatch({ type: "COMPLETE_ONBOARDING" });
    if (pluginState.githubConfigured) {
      handleGitHubPull();
    } else {
      // Navigate to Sync tab where the wizard lives inline
      dispatch({ type: "SET_TAB", tab: "sync" });
    }
  }, [dispatch, pluginState.githubConfigured, handleGitHubPull]);

  // Operation Cancellation
  const handleCancelOperation = useCallback(() => {
    pluginActions.setLoading(false);
    pluginActions.setLoadingMessage("");
    pluginActions.setProgressSteps([]);
    pluginActions.setProgressStep(0);
    pluginActions.setCurrentOperation(null);
    pluginActions.setSuccessMessage("⚠️ Operation cancelled");
    setTimeout(() => pluginActions.setSuccessMessage(null), 3000);

    if (pluginState.currentOperation) {
      pluginActions.sendMessage({
        type: "cancel-operation",
        operation: pluginState.currentOperation,
      });
    }
  }, [pluginState.currentOperation, pluginActions]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--surface-primary)",
        color: "var(--text-primary)",
      }}
    >
      {/* ── Header (44px, edge-to-edge) ── */}
      <header
        style={{
          height: 44,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "0 12px",
          borderBottom: "1px solid var(--border-default)",
          background: "var(--surface-primary)",
        }}
      >
        {/* BridgeMark logomark */}
        <span
          style={{
            display: "inline-grid",
            placeItems: "center",
            width: 20,
            height: 20,
            borderRadius: 5,
            background: "var(--accent-primary)",
            color: "#fff",
            flexShrink: 0,
          }}
        >
          <svg
            width={14}
            height={14}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.4"
            stroke-linecap="round"
            aria-hidden="true"
          >
            <path d="M4 8h16" />
            <path d="M4 16h16" />
            <path d="M12 8v8" />
          </svg>
        </span>

        <span
          style={{
            fontWeight: "var(--font-weight-semibold)",
            fontSize: "var(--font-size-md)",
            letterSpacing: -0.1,
            color: "var(--text-primary)",
          }}
        >
          Token Bridge
        </span>

        <span style={{ flex: 1 }} />

        <span
          style={{
            fontFamily: "var(--font-family-mono)",
            fontSize: "var(--font-size-xs)",
            color: "var(--text-tertiary)",
          }}
        >
          v0.9.2
        </span>

        {/* Settings / help menu */}
        <HelpMenu
          onReset={() => {
            dispatch({ type: "SET_TAB", tab: "tokens" });
            pluginActions.setLoading(false);
            pluginActions.setError(null);
          }}
        />
      </header>

      {/* ── Alerts ── */}
      {pluginState.error && (
        <div style={{ padding: "8px 12px 0" }}>
          <EnhancedErrorDisplay
            error={pluginState.error}
            onDismiss={() => pluginActions.setError(null)}
            onRetry={() => {
              pluginActions.setError(null);
              if (
                pluginState.error &&
                typeof pluginState.error !== "string" &&
                pluginState.error.type === "network-error"
              ) {
                pluginActions.loadCollections();
              }
            }}
          />
        </div>
      )}

      <SuccessToast
        message={pluginState.successMessage}
        onClose={() => pluginActions.setSuccessMessage(null)}
      />

      {/* ── Main content ── */}
      {pluginState.showOnboarding ? (
        <OnboardingScreen
          onSetupSync={() => {
            dispatch({ type: "COMPLETE_ONBOARDING" });
            dispatch({ type: "SET_TAB", tab: "sync" });
          }}
          onImportFile={() => {
            dispatch({ type: "COMPLETE_ONBOARDING" });
            handleTokenImport();
          }}
          onImportFigmaVariables={handleImportFigmaVariables}
          onDemoTokens={handleGenerateDemoTokens}
          onSkip={() => {
            dispatch({ type: "COMPLETE_ONBOARDING" });
            parent.postMessage(
              { pluginMessage: { type: "mark-file-engaged" } },
              "*"
            );
          }}
        />
      ) : (
        <>
          {/* Tab Navigation — edge-to-edge */}
          <TabBar
            tabs={[
              {
                id: "tokens",
                label: "Tokens",
                count: pluginState.collections.length || undefined,
              },
              { id: "sync", label: "Sync" },
            ]}
            activeTab={uiState.activeTab}
            onTabChange={(tab) => dispatch({ type: "SET_TAB", tab })}
          />

          {/* Tab panels */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
            }}
          >
            {/* TOKENS TAB */}
            {uiState.activeTab === "tokens" && (
              <TokensTab
                collections={pluginState.collections}
                selectedCollection={pluginState.selectedCollection}
                onToggleCollection={(id: string) => {
                  dispatch({ type: "TOGGLE_COLLECTION", id });
                }}
                onViewDetails={(id: string) => {
                  pluginActions.loadCollectionDetails(id);
                }}
                onSelectAll={() => {
                  dispatch({
                    type: "SELECT_ALL_COLLECTIONS",
                    ids: pluginState.collections.map((c) => c.id),
                  });
                }}
                onDeselectAll={() => {
                  dispatch({ type: "DESELECT_ALL_COLLECTIONS" });
                }}
                loading={pluginState.loading}
                onImportFile={handleTokenImport}
                onGenerateDemoTokens={() => {
                  pluginActions.setLoading(true);
                  pluginActions.setLoadingMessage("Loading demo tokens...");
                  pluginActions.sendMessage({ type: "generate-demo-tokens" });
                }}
                onSetupGitHub={() => {
                  dispatch({ type: "SET_TAB", tab: "sync" });
                }}
                githubConfigured={pluginState.githubConfigured}
                onDownloadJSON={() => {
                  if (selectedCollections.size === 0) {
                    pluginActions.setError(
                      "Please select at least one collection to export"
                    );
                    return;
                  }
                  pluginActions.sendMessage({
                    type: "export-tokens",
                    collectionIds: Array.from(selectedCollections),
                  });
                }}
                onPushToGitHub={() => {
                  if (!pluginState.githubConfigured) {
                    dispatch({ type: "SET_TAB", tab: "sync" });
                    return;
                  }
                  if (selectedCollections.size === 0) {
                    pluginActions.setError(
                      "Please select at least one collection to export"
                    );
                    return;
                  }
                  pluginActions.sendMessage({
                    type: "github-sync-tokens",
                    collectionIds: Array.from(selectedCollections),
                  });
                }}
              />
            )}

            {/* SYNC TAB */}
            {uiState.activeTab === "sync" && (
              <SyncTab
                githubConfig={pluginState.githubConfig}
                githubConfigured={pluginState.githubConfigured}
                collections={pluginState.collections}
                loading={pluginState.loading}
                onPushToGitHub={() => {
                  if (selectedCollections.size === 0) {
                    pluginActions.setError(
                      "Please select at least one collection to sync"
                    );
                    return;
                  }
                  pluginActions.sendMessage({
                    type: "github-sync-tokens",
                    collectionIds: Array.from(selectedCollections),
                  });
                }}
                onPullFromGitHub={handleGitHubPull}
                onImportFile={handleTokenImport}
                onGitHubConfigComplete={handleGitHubConfigTest}
                importPreview={importPreviewData}
                onConfirmImport={handleConfirmImport}
                onCancelImport={handleCancelImport}
              />
            )}

            {/* Conflict Resolution */}
            {pluginState.showConflictResolution &&
              pluginState.conflicts.length > 0 && (
                <div style={{ padding: "0 12px 12px" }}>
                  <ConflictResolutionDisplay
                    conflicts={pluginState.conflicts}
                    onResolve={handleConflictResolution}
                    onCancel={() => {
                      pluginActions.setShowConflictResolution(false);
                      pluginActions.setConflicts([]);
                      pluginActions.setLoading(false);
                    }}
                    loading={pluginState.loading}
                  />
                </div>
              )}

            {/* Validation Display */}
            {pluginState.showValidation && pluginState.validationReport && (
              <div style={{ padding: "0 12px 12px" }}>
                <ValidationDisplay
                  validationReport={pluginState.validationReport}
                  onClose={() => pluginActions.setShowValidation(false)}
                />
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Modals ── */}
      {showExistingTokensImporter && (
        <ExistingTokensImporter
          onImport={() => {
            setShowExistingTokensImporter(false);
          }}
          onCancel={() => setShowExistingTokensImporter(false)}
        />
      )}

      {transformationSummary && (
        <TransformationSummary
          summary={transformationSummary}
          onClose={() => setTransformationSummary(null)}
          onViewCollections={() => {
            setTransformationSummary(null);
            dispatch({ type: "SET_TAB", tab: "tokens" });
          }}
        />
      )}

      {showFormatGuidelines && (
        <FormatGuidelinesDialog
          onClose={() => setShowFormatGuidelines(false)}
        />
      )}

      {/* Progress Feedback */}
      <ProgressFeedback
        steps={pluginState.progressSteps}
        currentStep={pluginState.progressStep}
        loading={pluginState.loading}
        loadingMessage={pluginState.loadingMessage}
        onCancel={
          pluginState.currentOperation ? handleCancelOperation : undefined
        }
      />
    </div>
  );
}

/**
 * App Root with Context Provider
 */
function App() {
  return (
    <UIProvider>
      <AppInner />
    </UIProvider>
  );
}

// Render
console.log("About to render App");
const root = document.getElementById("root");
console.log("Root element:", root);

if (root) {
  render(<App />, root);
  console.log("App rendered successfully");
} else {
  console.error("Root element not found!");
}

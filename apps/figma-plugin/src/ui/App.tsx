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
import { ImportTab } from "./components/tabs/ImportTab";
import { SyncTab } from "./components/tabs/SyncTab";
import { EnhancedErrorDisplay } from "./components/EnhancedErrorDisplay";
import { SuccessToast, ErrorToast } from "./components/Toast";
import { ConflictResolutionDisplay } from "./components/ConflictResolutionDisplay";
import { ValidationDisplay } from "./components/ValidationDisplay";
import { ProgressFeedback } from "./components/ProgressFeedback";
import { SetupWizard } from "./components/SetupWizard";
import { GitHubConfig as GitHubConfigDialog } from "./components/GitHubConfig";
import { FirstRunOnboarding } from "./components/FirstRunOnboarding";
import { ExistingTokensImporter } from "./components/ExistingTokensImporter";
import { FormatGuidelinesDialog } from "./components/FormatGuidelinesDialog";
import { HelpMenu } from "./components/HelpMenu";
import { ImportPreview } from "./components/ImportPreview";
import { TransformationSummary } from "./components/TransformationSummary";

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

  // Selected collections (local state - not part of UI context)
  const [selectedCollections, setSelectedCollections] = useState<Set<string>>(
    new Set()
  );

  // Modals (local state)
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [showGitHubSettings, setShowGitHubSettings] = useState(false);
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
    () => setSelectedCollections(new Set())
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
      setShowSetupWizard(true);
    }
  }, [dispatch, pluginState.githubConfigured, handleGitHubPull]);

  // Setup Wizard Complete
  const handleSetupWizardComplete = useCallback(
    (config: GitHubConfig) => {
      setShowSetupWizard(false);
      handleGitHubConfigTest(config);
    },
    [handleGitHubConfigTest]
  );

  // GitHub Config Save (from settings)
  const handleGitHubConfigSave = useCallback(
    (config: GitHubConfig) => {
      setShowGitHubSettings(false);
      handleGitHubConfigTest(config);
    },
    [handleGitHubConfigTest]
  );

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
        padding: "var(--space-4)",
        minHeight: "100vh",
        backgroundColor: "var(--surface-primary)",
        color: "var(--text-primary)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "var(--space-4)",
          paddingBottom: "var(--space-3)",
          borderBottom: "1px solid var(--border-primary)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-3)",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "var(--font-size-xl)",
              fontWeight: "var(--font-weight-semibold)",
              color: "var(--text-primary)",
            }}
          >
            Token Bridge
          </h2>
        </div>
        <HelpMenu
          onReset={() => {
            // Basic reset for now - clear UI state
            dispatch({ type: "SET_TAB", tab: "tokens" });
            pluginActions.setLoading(false);
            pluginActions.setError(null);
            // Could send a message to plugin to clear storage if needed
          }}
        />
      </div>

      {/* Error Display */}
      {pluginState.error && (
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
      )}

      {/* Success Toast */}
      <SuccessToast
        message={pluginState.successMessage}
        onClose={() => pluginActions.setSuccessMessage(null)}
      />

      {/* Error Toast */}
      <ErrorToast
        message={pluginState.error}
        onClose={() => pluginActions.setError(null)}
      />

      {/* Tab Navigation */}
      <TabBar
        tabs={[
          { id: "tokens", label: "Tokens", icon: "🎨" },
          { id: "import", label: "Import", icon: "📥" },
          {
            id: "sync",
            label: "Sync",
            icon: "🔄",
            // Always enabled - shows configuration prompt when not configured
            disabled: false,
          },
        ]}
        activeTab={uiState.activeTab}
        onTabChange={(tab) => dispatch({ type: "SET_TAB", tab })}
      />

      {/* TOKENS TAB */}
      {uiState.activeTab === "tokens" && (
        <TokensTab
          collections={pluginState.collections}
          selectedCollections={selectedCollections}
          selectedCollection={pluginState.selectedCollection}
          onToggleCollection={(id: string) => {
            const newSet = new Set(selectedCollections);
            if (newSet.has(id)) {
              newSet.delete(id);
            } else {
              newSet.add(id);
            }
            setSelectedCollections(newSet);
          }}
          onViewDetails={(id: string) => {
            pluginActions.loadCollectionDetails(id);
          }}
          onSelectAll={() => {
            setSelectedCollections(
              new Set(pluginState.collections.map((c) => c.id))
            );
          }}
          onDeselectAll={() => {
            setSelectedCollections(new Set());
          }}
          loading={pluginState.loading}
          // Enhanced empty state actions
          onImportFile={() => {
            handleTokenImport();
            // Mark engaged after successful import (handled in tokens-imported message)
          }}
          onGenerateDemoTokens={() => {
            pluginActions.setLoading(true);
            pluginActions.setLoadingMessage("Loading demo tokens...");
            pluginActions.sendMessage({ type: "generate-demo-tokens" });
            // Mark engaged after successful import (handled in tokens-imported message)
          }}
          onSetupGitHub={() => {
            // If GitHub is configured, pull tokens; otherwise show setup wizard
            if (pluginState.githubConfigured) {
              handleGitHubPull();
              // Mark engaged after successful pull (handled in github-pull-complete message)
            } else {
              setShowSetupWizard(true);
              // Mark engaged when wizard shows
              parent.postMessage(
                { pluginMessage: { type: "mark-file-engaged" } },
                "*"
              );
            }
          }}
          githubConfigured={pluginState.githubConfigured}
          // Export actions
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
              setShowSetupWizard(true);
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

      {/* IMPORT TAB */}
      {uiState.activeTab === "import" && (
        <ImportTab
          onImportFile={handleTokenImport}
          onImportFromGitHub={handleGitHubPull}
          onLoadDemoTokens={handleGenerateDemoTokens}
          onSetupGitHub={() => setShowSetupWizard(true)}
          loading={pluginState.loading || pluginState.importLoading}
          hasGitHubConfig={pluginState.githubConfigured}
        />
      )}

      {/* SYNC TAB */}
      {uiState.activeTab === "sync" && (
        <SyncTab
          githubConfig={pluginState.githubConfig}
          onConfigureGitHub={() => {
            // If already configured, show settings dialog; otherwise show setup wizard
            if (pluginState.githubConfigured && pluginState.githubConfig) {
              setShowGitHubSettings(true);
            } else {
              setShowSetupWizard(true);
            }
          }}
          onQuickSync={() => {
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
          loading={pluginState.loading}
          selectedCollections={selectedCollections}
        />
      )}

      {/* Conflict Resolution */}
      {pluginState.showConflictResolution &&
        pluginState.conflicts.length > 0 && (
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
        )}

      {/* Validation Display */}
      {pluginState.showValidation && pluginState.validationReport && (
        <ValidationDisplay
          validationReport={pluginState.validationReport}
          onClose={() => pluginActions.setShowValidation(false)}
        />
      )}

      {/* Setup Wizard (for new configuration) */}
      {showSetupWizard && (
        <SetupWizard
          onComplete={handleSetupWizardComplete}
          onClose={() => setShowSetupWizard(false)}
        />
      )}

      {/* GitHub Settings (for editing existing configuration) */}
      {showGitHubSettings && (
        <div
          style={{
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
          }}
        >
          <div
            style={{
              backgroundColor: "var(--surface-primary)",
              borderRadius: "var(--radius-lg)",
              width: "90%",
              maxWidth: "480px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            <GitHubConfigDialog
              onConfigSaved={handleGitHubConfigSave}
              onClose={() => setShowGitHubSettings(false)}
            />
          </div>
        </div>
      )}

      {/* Onboarding */}
      {pluginState.showOnboarding && (
        <FirstRunOnboarding
          onDemoTokens={() => {
            pluginActions.setLoading(true);
            pluginActions.setLoadingMessage("Loading demo tokens...");
            pluginActions.sendMessage({ type: "generate-demo-tokens" });
            // Mark engaged after successful import (handled in tokens-imported message)
          }}
          onImportFile={() => {
            handleTokenImport();
            // Mark engaged after successful import (handled in tokens-imported message)
          }}
          onImportFigmaVariables={handleImportFigmaVariables}
          onSetupGitHub={() => {
            setShowSetupWizard(true);
            // Mark engaged when wizard shows
            parent.postMessage(
              { pluginMessage: { type: "mark-file-engaged" } },
              "*"
            );
          }}
          onSkip={() => {
            parent.postMessage(
              { pluginMessage: { type: "mark-file-engaged" } },
              "*"
            );
          }}
        />
      )}

      {/* Existing Tokens Importer */}
      {showExistingTokensImporter && (
        <ExistingTokensImporter
          onImport={() => {
            setShowExistingTokensImporter(false);
          }}
          onCancel={() => setShowExistingTokensImporter(false)}
        />
      )}

      {/* Import Preview */}
      {importPreviewData && (
        <ImportPreview
          summary={importPreviewData}
          onConfirm={handleConfirmImport}
          onCancel={handleCancelImport}
        />
      )}

      {/* Transformation Summary */}
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

      {/* Format Guidelines */}
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

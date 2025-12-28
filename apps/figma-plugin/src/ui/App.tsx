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
import { useState, useCallback } from "preact/hooks";
import { UIProvider, useUIContext } from "./state";
import { usePluginMessages } from "./hooks/usePluginMessages";
import { useGitHubSync } from "./hooks/domain/useGitHubSync";
import { ConflictAwareGitHubClient } from "../plugin/sync/conflict-aware-github-client";
import type { GitHubConfig } from "../shared/types";
import type { ConflictResolution } from "../plugin/sync/types";

// Components
import { TabBar } from "./components/layout/TabBar";
import { TokensTab } from "./components/tabs/TokensTab";
import { ImportTab } from "./components/tabs/ImportTab";
import { ExportTab } from "./components/tabs/ExportTab";
import { SyncTab } from "./components/tabs/SyncTab";
import { EnhancedErrorDisplay } from "./components/EnhancedErrorDisplay";
import { ConflictResolutionDisplay } from "./components/ConflictResolutionDisplay";
import { ValidationDisplay } from "./components/ValidationDisplay";
import { ProgressFeedback } from "./components/ProgressFeedback";
import { SetupWizard } from "./components/SetupWizard";
import { FirstRunOnboarding } from "./components/FirstRunOnboarding";
import { ExistingTokensImporter } from "./components/ExistingTokensImporter";
import { FormatGuidelinesDialog } from "./components/FormatGuidelinesDialog";

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
  const [showExistingTokensImporter, setShowExistingTokensImporter] =
    useState(false);
  const [showFormatGuidelines, setShowFormatGuidelines] = useState(false);

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
    pluginState.pendingTokensForConflictResolution
  );

  // Token Import Handler
  const handleTokenImport = useCallback(() => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".json";
    fileInput.multiple = true;

    fileInput.onchange = async (event) => {
      const files = (event.target as HTMLInputElement).files;
      if (!files || files.length === 0) return;

      pluginActions.setLoading(true);
      pluginActions.setLoadingMessage("Reading your files...");
      pluginActions.setError(null);
      pluginActions.setCurrentOperation("token-import");

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

        pluginActions.setLoadingMessage("Adding tokens to Figma...");
        pluginActions.sendMessage({
          type: "import-tokens",
          files: fileContents,
        });
      } catch (err) {
        console.error("Failed to read files:", err);
        pluginActions.setError(
          `Failed to read files: ${err instanceof Error ? err.message : "Unknown error"}`
        );
        pluginActions.setLoading(false);
        pluginActions.setLoadingMessage("");
        pluginActions.setCurrentOperation(null);
      }
    };

    fileInput.click();
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

      {/* Success Message */}
      {pluginState.successMessage && (
        <div
          style={{
            padding: "8px 12px",
            marginBottom: "16px",
            backgroundColor: "#f0f9ff",
            border: "1px solid #bae6fd",
            borderRadius: "4px",
            color: "#0369a1",
          }}
        >
          {pluginState.successMessage}
        </div>
      )}

      {/* Tab Navigation */}
      <TabBar
        tabs={[
          { id: "tokens", label: "Tokens", icon: "🎨" },
          { id: "import", label: "Import", icon: "📥" },
          { id: "export", label: "Export", icon: "📤" },
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
        />
      )}

      {/* IMPORT TAB */}
      {uiState.activeTab === "import" && (
        <ImportTab
          onImportFile={handleTokenImport}
          onImportFromGitHub={handleGitHubPull}
          onImportFigmaVariables={handleImportFigmaVariables}
          onLoadDemoTokens={handleGenerateDemoTokens}
          loading={pluginState.loading || pluginState.importLoading}
          hasGitHubConfig={pluginState.githubConfigured}
          hasFigmaVariables={pluginState.hasFigmaVariables}
        />
      )}

      {/* EXPORT TAB */}
      {uiState.activeTab === "export" && (
        <ExportTab
          selectedCollections={selectedCollections}
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
              pluginActions.setError("Please configure GitHub first");
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
          loading={pluginState.loading}
          hasGitHubConfig={pluginState.githubConfigured}
        />
      )}

      {/* SYNC TAB */}
      {uiState.activeTab === "sync" && (
        <SyncTab
          githubConfig={pluginState.githubConfig}
          onConfigureGitHub={() => setShowSetupWizard(true)}
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

      {/* Setup Wizard */}
      {showSetupWizard && (
        <SetupWizard
          onComplete={handleSetupWizardComplete}
          onClose={() => setShowSetupWizard(false)}
        />
      )}

      {/* Onboarding */}
      {pluginState.showOnboarding && (
        <FirstRunOnboarding
          onDemoTokens={handleGenerateDemoTokens}
          onImportVariables={handleImportFigmaVariables}
          onImportFile={() => {
            dispatch({ type: "COMPLETE_ONBOARDING" });
            handleTokenImport();
          }}
          onSetupGitHub={() => {
            dispatch({ type: "COMPLETE_ONBOARDING" });
            setShowSetupWizard(true);
          }}
          onSkip={() => {
            dispatch({ type: "COMPLETE_ONBOARDING" });
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
        loading={pluginState.loading && pluginState.progressSteps.length > 0}
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

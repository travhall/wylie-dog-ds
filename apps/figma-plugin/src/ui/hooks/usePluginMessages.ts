import { useState, useEffect, useCallback } from "preact/hooks";
import type { GitHubConfig } from "../../shared/types";
import type { PluginError } from "../../shared/error-handler";
import type { ConflictAwareGitHubClient } from "../../plugin/sync/conflict-aware-github-client";
import type { TokenConflict } from "../../plugin/sync/types";
import type { ExportData } from "../../plugin/variables/processor";

/**
 * Collection data from Figma
 */
export interface Collection {
  id: string;
  name: string;
  modes: Array<{ modeId: string; name: string }>;
  variableIds: string[];
}

/**
 * Variable data from Figma
 */
export interface Variable {
  id: string;
  name: string;
  description: string;
  resolvedType: string;
  scopes: string[];
  valuesByMode: Record<string, any>;
  remote: boolean;
  key: string;
}

/**
 * Collection with full variable details
 */
export interface CollectionDetails {
  id: string;
  name: string;
  modes: Array<{ modeId: string; name: string }>;
  variables: Variable[];
}

/**
 * Plugin message state managed by this hook
 */
export interface PluginMessageState {
  // Collections
  collections: Collection[];
  selectedCollection: CollectionDetails | null;

  // Loading states
  loading: boolean;
  importLoading: boolean;
  loadingMessage: string;
  currentOperation: string | null;

  // Error & success states
  error: PluginError | string | null;
  successMessage: string | null;

  // GitHub state
  githubConfig: GitHubConfig | null;
  githubConfigured: boolean;

  // Export/Import data
  downloadQueue: ExportData[];
  validationReport: any;
  showValidation: boolean;
  adapterResults: any[];

  // Conflicts
  conflicts: TokenConflict[];
  showConflictResolution: boolean;
  pendingTokensForConflictResolution: ExportData[];

  // Progress
  progressStep: number;
  progressSteps: any[];

  // Onboarding
  showOnboarding: boolean;
  hasFigmaVariables: boolean;
}

/**
 * Actions to send messages to plugin thread
 */
export interface PluginMessageActions {
  loadCollections: () => void;
  loadCollectionDetails: (collectionId: string) => void;
  loadGitHubConfig: () => void;
  loadOnboardingState: () => void;
  sendMessage: (message: any) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: PluginError | string | null) => void;
  setSuccessMessage: (message: string | null) => void;
  setGithubConfig: (config: GitHubConfig | null) => void;
  setGithubConfigured: (configured: boolean) => void;
  setShowConflictResolution: (show: boolean) => void;
  setConflicts: (conflicts: TokenConflict[]) => void;
  setPendingTokensForConflictResolution: (tokens: ExportData[]) => void;
  setProgressStep: (step: number) => void;
  setProgressSteps: (steps: any[]) => void;
  setLoadingMessage: (message: string) => void;
  setCurrentOperation: (operation: string | null) => void;
  setSelectedCollection: (collection: CollectionDetails | null) => void;
  setDownloadQueue: (queue: ExportData[]) => void;
  setShowValidation: (show: boolean) => void;
}

/**
 * Hook for managing plugin thread communication
 *
 * Extracts all message handling logic from App.tsx
 * Manages state updates from plugin messages
 */
export function usePluginMessages(
  githubClient: ConflictAwareGitHubClient,
  handleGitHubConfigTest: (config: GitHubConfig) => Promise<any>,
  handleGitHubSync: (exportData: ExportData[]) => Promise<void>,
  handleGitHubPull: () => Promise<void>
): [PluginMessageState, PluginMessageActions] {
  // Collections
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] =
    useState<CollectionDetails | null>(null);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string>("");
  const [currentOperation, setCurrentOperation] = useState<string | null>(null);

  // Error & success states
  const [error, setError] = useState<PluginError | string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // GitHub state
  const [githubConfig, setGithubConfig] = useState<GitHubConfig | null>(null);
  const [githubConfigured, setGithubConfigured] = useState(false);

  // Export/Import data
  const [downloadQueue, setDownloadQueue] = useState<ExportData[]>([]);
  const [validationReport, setValidationReport] = useState<any>(null);
  const [showValidation, setShowValidation] = useState(false);
  const [adapterResults, setAdapterResults] = useState<any[]>([]);

  // Conflicts
  const [conflicts, setConflicts] = useState<TokenConflict[]>([]);
  const [showConflictResolution, setShowConflictResolution] = useState(false);
  const [
    pendingTokensForConflictResolution,
    setPendingTokensForConflictResolution,
  ] = useState<ExportData[]>([]);

  // Progress
  const [progressStep, setProgressStep] = useState(0);
  const [progressSteps, setProgressSteps] = useState<any[]>([]);

  // Onboarding
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasFigmaVariables, setHasFigmaVariables] = useState(false);

  // Helper functions
  const loadCollections = useCallback(() => {
    parent.postMessage({ pluginMessage: { type: "load-collections" } }, "*");
  }, []);

  const loadCollectionDetails = useCallback((collectionId: string) => {
    parent.postMessage(
      { pluginMessage: { type: "load-collection-detail", collectionId } },
      "*"
    );
  }, []);

  const loadGitHubConfig = useCallback(() => {
    parent.postMessage({ pluginMessage: { type: "load-github-config" } }, "*");
  }, []);

  const loadOnboardingState = useCallback(() => {
    parent.postMessage(
      { pluginMessage: { type: "load-onboarding-state" } },
      "*"
    );
  }, []);

  const sendMessage = useCallback((message: any) => {
    parent.postMessage({ pluginMessage: message }, "*");
  }, []);

  // Message handler
  useEffect(() => {
    console.log("usePluginMessages: Setting up message listener");

    const handleMessage = (event: MessageEvent) => {
      console.log("usePluginMessages: Received message:", event.data);
      const msg = event.data.pluginMessage;

      if (!msg) {
        console.warn("usePluginMessages: No pluginMessage in event data");
        return;
      }

      switch (msg.type) {
        case "collections-loaded":
          console.log("Collections loaded:", msg.collections);
          setCollections(msg.collections || []);
          setLoading(false);
          setError(null);
          setCurrentOperation(null);
          break;

        case "collection-details-loaded":
          console.log("Collection details loaded:", msg.collection);
          setSelectedCollection(msg.collection);
          setLoading(false);
          setError(null);
          break;

        case "tokens-exported":
          console.log("Tokens exported:", msg.exportData);
          setLoading(false);
          setCurrentOperation(null);

          if (msg.exportData) {
            setDownloadQueue(msg.exportData);
            setSuccessMessage(
              `✅ ${msg.exportData.length} ${msg.exportData.length === 1 ? "file" : "files"} ready to download!`
            );
            setTimeout(() => setSuccessMessage(null), 5000);
          }
          break;

        case "tokens-imported":
          console.log("Tokens imported:", msg.result);
          setImportLoading(false);
          setLoading(false);
          setCurrentOperation(null);

          if (msg.result && msg.result.success) {
            setSuccessMessage(
              `✅ Added ${msg.result.totalVariablesCreated} tokens to Figma!`
            );
            setTimeout(() => setSuccessMessage(null), 5000);

            // Reload collections to show imported variables
            setTimeout(() => loadCollections(), 1000);
          } else {
            setError(
              `Import failed: ${msg.result?.message || "Unknown error"}`
            );
          }

          // Show validation report if available
          if (msg.validationReport) {
            setValidationReport(msg.validationReport);
            setShowValidation(true);
          }

          // Show adapter results if available
          if (msg.adapterResults && msg.adapterResults.length > 0) {
            setAdapterResults(msg.adapterResults);
          }
          break;

        case "import-error":
          console.error("Import error:", msg.error);
          setImportLoading(false);
          setLoading(false);
          setCurrentOperation(null);

          // Enhanced error display for reference issues
          if (msg.error.includes("Reference Issues:")) {
            setError(
              `Import failed due to token reference problems:\n\n${msg.error}\n\n💡 Try importing collections in dependency order (base tokens first, then semantic tokens).`
            );
          } else {
            setError(`Import failed: ${msg.error}`);
          }
          break;

        case "github-config-loaded":
          console.log("GitHub config loaded:", msg.config);
          if (msg.config) {
            setGithubConfig(msg.config);
            setGithubConfigured(true);
            // Initialize GitHub client with config
            try {
              githubClient.configure(msg.config);
            } catch (err) {
              console.warn("Failed to configure GitHub client:", err);
            }
          } else {
            setGithubConfig(null);
            setGithubConfigured(false);
          }
          break;

        case "github-config-saved":
          console.log("GitHub config saved:", msg.success);
          if (msg.success) {
            setLoading(false);
            setError(null);
            setSuccessMessage("✅ GitHub settings saved!");
            setTimeout(() => setSuccessMessage(null), 3000);
            // Reload config to update UI
            loadGitHubConfig();
          } else {
            setLoading(false);
            setError(msg.error || "Failed to save GitHub configuration");
          }
          break;

        case "test-github-config":
          console.log("Testing GitHub config:", msg.config);
          handleGitHubConfigTest(msg.config).catch((err) => {
            console.error("GitHub config test failed:", err);
            setError(`GitHub configuration test failed: ${err.message}`);
            setLoading(false);
          });
          break;

        case "github-sync-tokens":
          console.log("GitHub sync initiated:", msg.exportData);
          handleGitHubSync(msg.exportData);
          break;

        case "github-sync-complete":
          console.log("GitHub sync complete:", msg.result);
          setLoading(false);
          setCurrentOperation(null);
          setProgressSteps([]);
          setProgressStep(0);

          if (msg.result && msg.result.success) {
            const message = msg.result.pullRequestUrl
              ? `✅ Pull request created! Check GitHub to review`
              : "✅ Saved to GitHub successfully!";
            setSuccessMessage(message);
            setTimeout(() => setSuccessMessage(null), 6000);
          } else {
            setError(msg.result?.error || "GitHub sync failed");
          }
          break;

        case "github-pull-tokens":
          console.log("GitHub pull initiated");
          handleGitHubPull();
          break;

        case "github-pull-complete":
          console.log("GitHub pull complete:", msg.result);
          setLoading(false);
          setCurrentOperation(null);
          setProgressSteps([]);
          setProgressStep(0);

          if (msg.result && msg.result.success) {
            setSuccessMessage("✅ Got your tokens from GitHub!");
            setTimeout(() => setSuccessMessage(null), 5000);
            // Reload collections
            setTimeout(() => loadCollections(), 1000);
          } else {
            setError(msg.result?.error || "GitHub pull failed");
          }
          break;

        case "loading-state":
          if (typeof msg.loading === "boolean") {
            setLoading(msg.loading);
            if (msg.message) {
              setLoadingMessage(msg.message);
            }
            if (!msg.loading) {
              setLoadingMessage("");
              setCurrentOperation(null);
            }
          }
          break;

        case "error":
          console.error("Plugin error:", msg.message);
          setLoading(false);
          setImportLoading(false);
          setCurrentOperation(null);
          setLoadingMessage("");
          setProgressSteps([]);
          setProgressStep(0);
          setError(msg.message);
          break;

        case "format-transformations":
          console.log("Format transformations applied:", msg.transformations);
          if (msg.transformations && msg.transformations.length > 0) {
            console.log("Format detected:", msg.detection?.format);
            console.log("Stats:", msg.stats);
          }
          break;

        case "onboarding-state-loaded":
          console.log("Onboarding state loaded:", msg.hasSeenOnboarding);
          if (!msg.hasSeenOnboarding) {
            setShowOnboarding(true);
          }
          break;

        default:
          console.warn("Unknown message type:", msg.type);
      }
    };

    window.addEventListener("message", handleMessage);

    // Initial data loads
    loadCollections();
    loadGitHubConfig();
    loadOnboardingState();

    // Cleanup
    return () => {
      console.log("usePluginMessages: Cleaning up");
      window.removeEventListener("message", handleMessage);

      // Clear large objects from memory
      setCollections([]);
      setSelectedCollection(null);
      setDownloadQueue([]);
      setAdapterResults([]);
      setConflicts([]);
      setPendingTokensForConflictResolution([]);
      setValidationReport(null);
    };
  }, [
    githubClient,
    handleGitHubConfigTest,
    handleGitHubSync,
    handleGitHubPull,
    loadCollections,
    loadGitHubConfig,
    loadOnboardingState,
  ]);

  const state: PluginMessageState = {
    collections,
    selectedCollection,
    loading,
    importLoading,
    loadingMessage,
    currentOperation,
    error,
    successMessage,
    githubConfig,
    githubConfigured,
    downloadQueue,
    validationReport,
    showValidation,
    adapterResults,
    conflicts,
    showConflictResolution,
    pendingTokensForConflictResolution,
    progressStep,
    progressSteps,
    showOnboarding,
    hasFigmaVariables,
  };

  const actions: PluginMessageActions = {
    loadCollections,
    loadCollectionDetails,
    loadGitHubConfig,
    loadOnboardingState,
    sendMessage,
    setLoading,
    setError,
    setSuccessMessage,
    setGithubConfig,
    setGithubConfigured,
    setShowConflictResolution,
    setConflicts,
    setPendingTokensForConflictResolution,
    setProgressStep,
    setProgressSteps,
    setLoadingMessage,
    setCurrentOperation,
    setSelectedCollection,
    setDownloadQueue,
    setShowValidation,
  };

  return [state, actions];
}

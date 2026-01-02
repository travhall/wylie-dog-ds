import { useState, useEffect, useCallback, useRef } from "preact/hooks";
import type { GitHubConfig } from "../../shared/types";
import type { PluginError } from "../../shared/error-handler";
import type { ConflictAwareGitHubClient } from "../../plugin/sync/conflict-aware-github-client";
import type { TokenConflict } from "../../plugin/sync/types";
import type { ExportData } from "../../plugin/variables/processor";

/**
 * Downloadable file format
 */
export interface DownloadableFile {
  filename: string;
  content: string;
}

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
  downloadQueue: DownloadableFile[];
  validationReport: any;
  showValidation: boolean;
  adapterResults: any[];

  // Conflicts
  conflicts: TokenConflict[];
  showConflictResolution: boolean;
  conflictOperationType: "push" | "pull" | null;
  pendingTokensForConflictResolution:
    | ExportData[]
    | { local: ExportData[]; remote: ExportData[] };

  // Progress
  progressStep: number;
  progressSteps: any[];

  // Onboarding
  showOnboarding: boolean;
  hasFigmaVariables: boolean;

  // UI Navigation hints
  shouldSwitchToTokensTab: boolean;
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
  setConflictOperationType: (type: "push" | "pull" | null) => void;
  setPendingTokensForConflictResolution: (
    tokens: ExportData[] | { local: ExportData[]; remote: ExportData[] }
  ) => void;
  setProgressStep: (step: number) => void;
  setProgressSteps: (steps: any[]) => void;
  setLoadingMessage: (message: string) => void;
  setCurrentOperation: (operation: string | null) => void;
  setSelectedCollection: (collection: CollectionDetails | null) => void;
  setDownloadQueue: (queue: DownloadableFile[]) => void;
  setShowValidation: (show: boolean) => void;
  // Callback registration methods
  registerGitHubConfigTestHandler: (
    handler: (config: GitHubConfig) => Promise<any>
  ) => void;
  registerGitHubSyncHandler: (
    handler: (exportData: ExportData[]) => Promise<void>
  ) => void;
  registerGitHubPullHandler: (handler: () => Promise<void>) => void;
  clearShouldSwitchToTokensTab: () => void;
  clearDownloadQueue: () => void;
}

/**
 * Hook for managing plugin thread communication
 *
 * Extracts all message handling logic from App.tsx
 * Manages state updates from plugin messages
 *
 * @param githubClient - GitHub client instance for configuration
 */
export function usePluginMessages(
  githubClient: ConflictAwareGitHubClient
): [PluginMessageState, PluginMessageActions] {
  // Callback refs for GitHub operations
  const githubConfigTestHandlerRef = useRef<
    ((config: GitHubConfig) => Promise<any>) | null
  >(null);
  const githubSyncHandlerRef = useRef<
    ((exportData: ExportData[]) => Promise<void>) | null
  >(null);
  const githubPullHandlerRef = useRef<(() => Promise<void>) | null>(null);

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
  const [downloadQueue, setDownloadQueue] = useState<DownloadableFile[]>([]);
  const [validationReport, setValidationReport] = useState<any>(null);
  const [showValidation, setShowValidation] = useState(false);
  const [adapterResults, setAdapterResults] = useState<any[]>([]);

  // Conflicts
  const [conflicts, setConflicts] = useState<TokenConflict[]>([]);
  const [showConflictResolution, setShowConflictResolution] = useState(false);
  const [conflictOperationType, setConflictOperationType] = useState<
    "push" | "pull" | null
  >(null);
  const [
    pendingTokensForConflictResolution,
    setPendingTokensForConflictResolution,
  ] = useState<ExportData[] | { local: ExportData[]; remote: ExportData[] }>(
    []
  );

  // Progress
  const [progressStep, setProgressStep] = useState(0);
  const [progressSteps, setProgressSteps] = useState<any[]>([]);

  // Onboarding
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasFigmaVariables, setHasFigmaVariables] = useState(false);
  const [hasEngagedWithFile, setHasEngagedWithFile] = useState(true); // Default true to avoid flash

  // UI Navigation hints
  const [shouldSwitchToTokensTab, setShouldSwitchToTokensTab] = useState(false);

  // Callback registration functions
  const registerGitHubConfigTestHandler = useCallback(
    (handler: (config: GitHubConfig) => Promise<any>) => {
      githubConfigTestHandlerRef.current = handler;
    },
    []
  );

  const registerGitHubSyncHandler = useCallback(
    (handler: (exportData: ExportData[]) => Promise<void>) => {
      githubSyncHandlerRef.current = handler;
    },
    []
  );

  const registerGitHubPullHandler = useCallback(
    (handler: () => Promise<void>) => {
      githubPullHandlerRef.current = handler;
    },
    []
  );

  // Helper functions
  const loadCollections = useCallback(() => {
    parent.postMessage({ pluginMessage: { type: "get-collections" } }, "*");
  }, []);

  const loadCollectionDetails = useCallback((collectionId: string) => {
    parent.postMessage(
      { pluginMessage: { type: "get-collection-details", collectionId } },
      "*"
    );
  }, []);

  const loadGitHubConfig = useCallback(() => {
    parent.postMessage({ pluginMessage: { type: "get-github-config" } }, "*");
  }, []);

  const loadOnboardingState = useCallback(() => {
    parent.postMessage(
      { pluginMessage: { type: "get-onboarding-state" } },
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
          console.log("📦 Collections loaded from plugin:", msg.collections);
          console.log(`📊 Collection count: ${msg.collections?.length || 0}`);
          setCollections(msg.collections || []);
          setLoading(false);
          setError(null);
          setCurrentOperation(null);
          console.log("✅ Collections state updated");
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
            // Don't show success message - download happens automatically
          }
          break;

        case "tokens-imported":
          console.log("📥 Received tokens-imported message:", msg);
          setImportLoading(false);
          setLoading(false);
          setCurrentOperation(null);

          if (msg.result && msg.result.success) {
            const tokenCount = msg.result.totalVariablesCreated || 0;
            const collectionCount = msg.result.totalCollectionsCreated || 0;

            console.log(
              `✅ Import success: ${tokenCount} tokens in ${collectionCount} collections`
            );
            console.log("Current collections state:", collections);

            setSuccessMessage(
              `✅ Added ${tokenCount} token${tokenCount !== 1 ? "s" : ""} in ${collectionCount} collection${collectionCount !== 1 ? "s" : ""}!`
            );
            setTimeout(() => setSuccessMessage(null), 5000);

            // Mark file as engaged after successful import
            console.log("📝 Marking file as engaged...");
            parent.postMessage(
              { pluginMessage: { type: "mark-file-engaged" } },
              "*"
            );

            // Reload collections immediately to show imported variables
            console.log("🔄 Requesting collections reload...");
            loadCollections();

            // Signal to switch to tokens tab to show results
            console.log("🔀 Signaling tab switch to tokens...");
            setShouldSwitchToTokensTab(true);
          } else {
            console.error("❌ Import failed:", msg.result);
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
          if (githubConfigTestHandlerRef.current) {
            githubConfigTestHandlerRef.current(msg.config).catch((err) => {
              console.error("GitHub config test failed:", err);
              setError(`GitHub configuration test failed: ${err.message}`);
              setLoading(false);
            });
          } else {
            console.warn("No GitHub config test handler registered");
          }
          break;

        case "github-sync-tokens":
          console.log("GitHub sync initiated:", msg.exportData);
          if (githubSyncHandlerRef.current) {
            githubSyncHandlerRef.current(msg.exportData);
          } else {
            console.warn("No GitHub sync handler registered");
          }
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
          if (githubPullHandlerRef.current) {
            githubPullHandlerRef.current();
          } else {
            console.warn("No GitHub pull handler registered");
          }
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

            // Mark file as engaged after successful pull
            parent.postMessage(
              { pluginMessage: { type: "mark-file-engaged" } },
              "*"
            );

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
          // Don't automatically show onboarding - wait for file engagement check
          break;

        case "file-engagement-status":
          console.log("File engagement status:", msg.hasEngaged);
          setHasEngagedWithFile(msg.hasEngaged);
          // Don't show onboarding here - wait for collections and config to load
          break;

        default:
          // Ignore messages sent FROM the UI (like import-tokens, mark-file-engaged, etc)
          // Only warn about unexpected messages FROM the plugin
          const outgoingMessageTypes = [
            "import-tokens",
            "mark-file-engaged",
            "generate-demo-tokens",
            "export-tokens",
            "github-sync-tokens",
            "github-sync-complete", // Response message from GitHub sync operations
            "get-collections",
            "get-collection-details",
            "get-github-config",
            "save-github-config",
            "test-github-config",
            "get-onboarding-state",
            "check-file-engagement",
          ];
          if (!outgoingMessageTypes.includes(msg.type)) {
            console.warn("Unknown message type from plugin:", msg.type);
          }
      }
    };

    window.addEventListener("message", handleMessage);

    // Initial data loads
    loadCollections();
    loadGitHubConfig();
    loadOnboardingState();

    // Check if user has engaged with this specific file
    parent.postMessage(
      { pluginMessage: { type: "check-file-engagement" } },
      "*"
    );

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
  }, [githubClient, loadCollections, loadGitHubConfig, loadOnboardingState]);

  // Determine if onboarding should show based on all conditions
  useEffect(() => {
    // Show onboarding if:
    // 1. User hasn't engaged with THIS file
    // 2. File has no collections
    // 3. File has no GitHub config
    const shouldShowOnboarding =
      !hasEngagedWithFile && collections.length === 0 && !githubConfigured;

    console.log("Onboarding visibility check:", {
      hasEngagedWithFile,
      collectionsCount: collections.length,
      githubConfigured,
      shouldShowOnboarding,
      currentlyShowing: showOnboarding,
    });

    if (shouldShowOnboarding && !showOnboarding) {
      console.log("✅ Showing onboarding based on file state");
      setShowOnboarding(true);
    } else if (!shouldShowOnboarding && showOnboarding) {
      // Hide onboarding if conditions no longer met
      console.log("❌ Hiding onboarding - conditions no longer met");
      setShowOnboarding(false);
    }
  }, [
    hasEngagedWithFile,
    collections.length,
    githubConfigured,
    showOnboarding,
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
    conflictOperationType,
    pendingTokensForConflictResolution,
    progressStep,
    progressSteps,
    showOnboarding,
    hasFigmaVariables,
    shouldSwitchToTokensTab,
  };

  const clearShouldSwitchToTokensTab = useCallback(() => {
    setShouldSwitchToTokensTab(false);
  }, []);

  const clearDownloadQueue = useCallback(() => {
    setDownloadQueue([]);
  }, []);

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
    setConflictOperationType,
    setPendingTokensForConflictResolution,
    setProgressStep,
    setProgressSteps,
    setLoadingMessage,
    setCurrentOperation,
    setSelectedCollection,
    setDownloadQueue,
    setShowValidation,
    registerGitHubConfigTestHandler,
    registerGitHubSyncHandler,
    registerGitHubPullHandler,
    clearShouldSwitchToTokensTab,
    clearDownloadQueue,
  };

  return [state, actions];
}

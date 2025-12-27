import { render } from "preact";
import { useState, useEffect } from "preact/hooks";
import { GitHubConfig as GitHubConfigComponent } from "./components/GitHubConfig";
import { ValidationDisplay } from "./components/ValidationDisplay";
import { TransformationFeedback } from "./components/TransformationFeedback";
import { ConflictResolutionDisplay } from "./components/ConflictResolutionDisplay";
import { SyncStatus } from "./components/SyncStatus";
import { EnhancedErrorDisplay } from "./components/EnhancedErrorDisplay";
import {
  ProgressFeedback,
  SYNC_STEPS,
  PULL_STEPS,
  PUSH_STEPS,
} from "./components/ProgressFeedback";
import { SetupWizard } from "./components/SetupWizard";
import { HelpIcon, HELP_CONTENT } from "./components/ContextualHelp";
import { FirstRunOnboarding } from "./components/FirstRunOnboarding";
import { ExistingTokensImporter } from "./components/ExistingTokensImporter";
import { FormatGuidelinesDialog } from "./components/FormatGuidelinesDialog";
import { GitHubClient } from "../plugin/github/client";
import { ErrorHandler, PluginError, ErrorType } from "../shared/error-handler";
import { ResultHandler, Result } from "../shared/result"; // Quick Win #12
import { ConflictAwareGitHubClient } from "../plugin/sync/conflict-aware-github-client";
import type { GitHubConfig, SyncMode } from "../shared/types";
import type { TokenConflict, ConflictResolution } from "../plugin/sync/types";
import type { ExportData } from "../plugin/variables/processor";
// Tab-based architecture - Phase 1
import { TabBar, type TabId } from "./components/layout/TabBar";
import { TokensTab } from "./components/tabs/TokensTab";
import { ImportTab } from "./components/tabs/ImportTab";
import { ExportTab } from "./components/tabs/ExportTab";
import { SyncTab } from "./components/tabs/SyncTab";
import { QuickGitHubSetup } from "./components/QuickGitHubSetup";

console.log("App.tsx loaded");

interface Collection {
  id: string;
  name: string;
  modes: Array<{ modeId: string; name: string }>;
  variableIds: string[];
}

interface Variable {
  id: string;
  name: string;
  description: string;
  resolvedType: string;
  scopes: string[];
  valuesByMode: Record<string, any>;
  remote: boolean;
  key: string;
}

interface CollectionDetails {
  id: string;
  name: string;
  modes: Array<{ modeId: string; name: string }>;
  variables: Variable[];
}

type ViewState = "collections" | "collection-detail" | "github-config";

function App() {
  console.log("App component rendering");
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<Set<string>>(
    new Set()
  );
  const [currentView, setCurrentView] = useState<ViewState>("collections");
  const [selectedCollection, setSelectedCollection] =
    useState<CollectionDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string>("");
  const [error, setError] = useState<PluginError | string | null>(null);
  const [validationReport, setValidationReport] = useState<any>(null);
  const [showValidation, setShowValidation] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [githubConfig, setGithubConfig] = useState<GitHubConfig | null>(null);
  const [githubConfigured, setGithubConfigured] = useState(false);
  const [downloadQueue, setDownloadQueue] = useState<any[]>([]);
  const [importLoading, setImportLoading] = useState(false);
  const [adapterResults, setAdapterResults] = useState<any[]>([]);
  const [conflicts, setConflicts] = useState<TokenConflict[]>([]);
  const [showConflictResolution, setShowConflictResolution] = useState(false);
  const [
    pendingTokensForConflictResolution,
    setPendingTokensForConflictResolution,
  ] = useState<ExportData[]>([]);
  const [progressStep, setProgressStep] = useState(0);
  const [progressSteps, setProgressSteps] = useState<any[]>([]);

  // Setup wizard - Quick Win #4
  const [showSetupWizard, setShowSetupWizard] = useState(false);

  // Operation cancellation - Quick Win #6
  const [currentOperation, setCurrentOperation] = useState<string | null>(null);

  // Onboarding modal - v2.0 Enhancement
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showExistingTokensImporter, setShowExistingTokensImporter] =
    useState(false);
  const [showFormatGuidelines, setShowFormatGuidelines] = useState(false);
  const [hasFigmaVariables, setHasFigmaVariables] = useState(false);

  // Tab navigation - Phase 1
  const [activeTab, setActiveTab] = useState<TabId>("tokens");

  // GitHub client instance
  const [githubClient] = useState(() => new ConflictAwareGitHubClient());

  // Helper functions for GitHub operations
  // Helper functions for GitHub operations with standardized error handling - Quick Win #12
  const handleGitHubConfigTest = async (
    config: GitHubConfig
  ): Promise<Result<boolean>> => {
    return ResultHandler.asyncOperation(
      async () => {
        setLoading(true);
        setError(null);

        const initialized = await githubClient.initialize(config);

        if (initialized) {
          const validation = await githubClient.validateRepository();

          if (validation.valid) {
            // Save the configuration
            parent.postMessage(
              {
                pluginMessage: {
                  type: "save-github-config",
                  config: config,
                },
              },
              "*"
            );

            setGithubConfig(config);
            setGithubConfigured(true);
            setCurrentView("collections");
            setSuccessMessage("✅ Connected to GitHub successfully!");
            setTimeout(() => setSuccessMessage(null), 5000);
            return true;
          } else {
            throw new Error(
              `Repository validation failed: ${validation.error || "Unknown validation error"}`
            );
          }
        } else {
          throw new Error(
            "Failed to initialize GitHub client. Please check your access token and repository details."
          );
        }
      },
      "GitHub configuration test",
      [
        "Verify your access token has repo permissions",
        "Check that the repository owner and name are correct",
        "Ensure the repository exists and is accessible",
        "Try regenerating your GitHub access token",
      ]
    ).finally(() => {
      setLoading(false);
    });
  };

  const handleGitHubSync = async (exportData: ExportData[]) => {
    try {
      setLoading(true);
      setProgressSteps(PUSH_STEPS);
      setProgressStep(0);

      setLoadingMessage("Preparing your tokens...");
      setProgressStep(1);

      setLoadingMessage("Checking for changes...");
      const syncResult =
        await githubClient.syncTokensWithConflictDetection(exportData);
      setProgressStep(2);

      if (syncResult.conflicts && syncResult.conflicts.length > 0) {
        setConflicts(syncResult.conflicts);
        setPendingTokensForConflictResolution(exportData);
        setShowConflictResolution(true);
        setLoading(false);
        setLoadingMessage("");
        setProgressSteps([]);
        return;
      }

      setLoadingMessage("Saving to GitHub...");
      setProgressStep(3);

      // Send success message back to plugin
      parent.postMessage(
        {
          pluginMessage: {
            type: "github-sync-complete",
            result: syncResult,
          },
        },
        "*"
      );
    } catch (error: any) {
      console.error("GitHub sync error:", error);
      parent.postMessage(
        {
          pluginMessage: {
            type: "github-sync-complete",
            result: {
              success: false,
              error: error.message || "GitHub sync failed",
            },
          },
        },
        "*"
      );
    }
  };

  const handleGitHubPull = async () => {
    try {
      setLoading(true);
      setProgressSteps(PULL_STEPS);
      setProgressStep(0);

      setLoadingMessage("Getting from GitHub...");
      setProgressStep(1);

      setLoadingMessage("Checking for changes...");
      const pullResult = await githubClient.pullTokensWithConflictDetection();
      setProgressStep(2);

      if (pullResult.conflicts && pullResult.conflicts.length > 0) {
        setConflicts(pullResult.conflicts);
        setPendingTokensForConflictResolution(pullResult.tokens || []);
        setShowConflictResolution(true);
        setLoading(false);
        setLoadingMessage("");
        setProgressSteps([]);
        return;
      }

      setLoadingMessage("Loading your tokens...");
      setProgressStep(3);

      if (pullResult.success && pullResult.tokens) {
        const files = pullResult.tokens.map((tokenCollection, index) => {
          const collectionName =
            Object.keys(tokenCollection)[0] || `collection-${index}`;
          return {
            filename: `${collectionName.toLowerCase().replace(/\s+/g, "-")}.json`,
            content: JSON.stringify([tokenCollection], null, 2),
          };
        });

        parent.postMessage(
          {
            pluginMessage: {
              type: "import-tokens",
              files: files,
            },
          },
          "*"
        );
      } else {
        parent.postMessage(
          {
            pluginMessage: {
              type: "github-pull-complete",
              result: {
                success: false,
                error: pullResult.error || "GitHub pull failed",
              },
            },
          },
          "*"
        );
      }
    } catch (error: any) {
      console.error("GitHub pull error:", error);
      parent.postMessage(
        {
          pluginMessage: {
            type: "github-pull-complete",
            result: {
              success: false,
              error: error.message || "GitHub pull failed",
            },
          },
        },
        "*"
      );
    }
  };

  // Advanced mode toggle removed - features now always available via tabs

  useEffect(() => {
    console.log("useEffect running - setting up message listener");

    const handleMessage = (event: MessageEvent) => {
      console.log("Received message:", event.data);
      const msg = event.data.pluginMessage;

      if (!msg) {
        console.warn("No pluginMessage in event data");
        return;
      }

      switch (msg.type) {
        case "collections-loaded":
          console.log("Collections loaded:", msg.collections);
          setCollections(msg.collections || []);
          setSelectedCollections(
            new Set(
              (msg.collections &&
                msg.collections.map((c: Collection) => c.id)) ||
                []
            )
          );
          setLoading(false);
          setError(null);
          setCurrentOperation(null);
          break;

        case "collection-details-loaded":
          console.log("Collection details loaded:", msg.collection);
          setSelectedCollection(msg.collection);
          setCurrentView("collection-detail");
          setLoading(false);
          setError(null);
          break;

        case "tokens-exported":
          console.log("Tokens exported:", msg.exportData);
          setLoading(false);
          setCurrentOperation(null);

          // Queue downloads for each collection
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
            // Could add UI to show transformations
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
    loadCollections();
    loadGitHubConfig();
    loadOnboardingState();

    // Memory cleanup - Quick Win #7
    return () => {
      console.log("App component unmounting - cleaning up");
      window.removeEventListener("message", handleMessage);

      // Clear large objects from memory
      setCollections([]);
      setSelectedCollection(null);
      setDownloadQueue([]);
      setAdapterResults([]);
      setConflicts([]);
      setPendingTokensForConflictResolution([]);
      setValidationReport(null);

      // Clear any ongoing operations
      setLoading(false);
      setCurrentOperation(null);
      setProgressSteps([]);
    };
  }, []);

  const loadCollections = () => {
    console.log("loadCollections clicked");
    setLoading(true);
    setError(null);
    setCollections([]);
    setCurrentView("collections");

    try {
      parent.postMessage({ pluginMessage: { type: "get-collections" } }, "*");
      console.log("Message sent to plugin");
    } catch (err) {
      console.error("Failed to send message:", err);
      setError("Failed to communicate with plugin");
      setLoading(false);
    }
  };

  const loadGitHubConfig = () => {
    try {
      parent.postMessage({ pluginMessage: { type: "get-github-config" } }, "*");
    } catch (err) {
      console.error("Failed to load GitHub config:", err);
    }
  };

  const loadOnboardingState = () => {
    try {
      parent.postMessage(
        { pluginMessage: { type: "get-onboarding-state" } },
        "*"
      );
    } catch (err) {
      console.error("Failed to load onboarding state:", err);
    }
  };

  const saveOnboardingComplete = () => {
    try {
      parent.postMessage(
        {
          pluginMessage: {
            type: "save-onboarding-state",
            hasSeenOnboarding: true,
          },
        },
        "*"
      );
    } catch (err) {
      console.error("Failed to save onboarding state:", err);
    }
  };

  const loadCollectionDetails = (collectionId: string) => {
    console.log("Loading collection details for:", collectionId);
    setLoading(true);
    setError(null);

    try {
      parent.postMessage(
        {
          pluginMessage: {
            type: "get-collection-details",
            collectionId,
          },
        },
        "*"
      );
    } catch (err) {
      console.error("Failed to send message:", err);
      setError("Failed to load collection details");
      setLoading(false);
    }
  };

  const exportTokens = (useGitHub = false) => {
    console.log(
      "Exporting tokens for selected collections:",
      Array.from(selectedCollections)
    );
    console.log("Export mode:", useGitHub ? "GitHub sync" : "Local download");

    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    setCurrentOperation(useGitHub ? "github-sync" : "local-export"); // Quick Win #6

    if (useGitHub && githubConfigured) {
      setLoadingMessage("Saving to GitHub...");
      try {
        parent.postMessage(
          {
            pluginMessage: {
              type: "github-sync-tokens",
              selectedCollectionIds: Array.from(selectedCollections),
            },
          },
          "*"
        );
      } catch (err) {
        console.error("Failed to sync to GitHub:", err);
        setError("Failed to sync to GitHub");
        setLoading(false);
        setLoadingMessage("");
        setCurrentOperation(null);
      }
    } else if (useGitHub && !githubConfigured) {
      setLoading(false);
      setCurrentOperation(null);
      setError("Please configure GitHub integration first");
      return;
    } else {
      setLoadingMessage("Preparing your files...");
      try {
        parent.postMessage(
          {
            pluginMessage: {
              type: "export-tokens",
              selectedCollectionIds: Array.from(selectedCollections),
            },
          },
          "*"
        );
      } catch (err) {
        console.error("Failed to export tokens:", err);
        setError("Failed to export tokens");
        setLoading(false);
        setLoadingMessage("");
        setCurrentOperation(null);
      }
    }
  };

  const pullFromGitHub = () => {
    console.log("Pulling tokens from GitHub");
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    setLoadingMessage("Getting from GitHub...");

    try {
      parent.postMessage(
        {
          pluginMessage: { type: "github-pull-tokens" },
        },
        "*"
      );
    } catch (err) {
      console.error("Failed to pull from GitHub:", err);
      setError("Failed to pull from GitHub");
      setLoading(false);
      setLoadingMessage("");
    }
  };

  const downloadSingleFile = (collectionData: any) => {
    try {
      const collectionName = Object.keys(collectionData)[0];
      const tokens = collectionData[collectionName];
      const fileContent = [{ [collectionName]: tokens }];
      const jsonString = JSON.stringify(fileContent, null, 2);

      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${collectionName.toLowerCase().replace(/\s+/g, "-")}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDownloadQueue((prev) =>
        prev.filter((item) => Object.keys(item)[0] !== collectionName)
      );
    } catch (err) {
      console.error("Failed to download file:", err);
      setError(`Failed to download ${Object.keys(collectionData)[0]}.json`);
    }
  };

  const clearDownloadQueue = () => {
    setDownloadQueue([]);
  };

  const toggleCollection = (collectionId: string) => {
    const newSelection = new Set(selectedCollections);
    if (newSelection.has(collectionId)) {
      newSelection.delete(collectionId);
    } else {
      newSelection.add(collectionId);
    }
    setSelectedCollections(newSelection);
  };

  const formatTokenValue = (variable: Variable, modeId: string) => {
    const value = variable.valuesByMode[modeId];
    if (!value) return "undefined";

    if (typeof value === "object" && value.type === "VARIABLE_ALIAS") {
      return `{${value.id}}`;
    }

    switch (variable.resolvedType) {
      case "COLOR":
        if (typeof value === "object" && value.r !== undefined) {
          const r = Math.round(value.r * 255);
          const g = Math.round(value.g * 255);
          const b = Math.round(value.b * 255);
          return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
        }
        return String(value);
      case "FLOAT":
        return `${value}px`;
      case "STRING":
        return `"${value}"`;
      case "BOOLEAN":
        return value ? "true" : "false";
      default:
        return String(value);
    }
  };

  const showGitHubConfig = () => {
    setCurrentView("github-config");
  };

  const handleGitHubConfigSaved = async (config: GitHubConfig) => {
    console.log("GitHub config saved:", config);

    const result = await handleGitHubConfigTest(config);

    if (ResultHandler.isFailure(result)) {
      // Enhanced error handling with suggestions - Quick Win #12
      setError(
        ErrorHandler.createError(
          ErrorType.AUTHENTICATION_ERROR,
          result.error,
          undefined,
          result.suggestions
        )
      );
    }
    // Success case already handled in handleGitHubConfigTest
  };

  const handleGitHubConfigClose = () => {
    setCurrentView("collections");
  };

  const handleTokenImport = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".json";
    fileInput.multiple = true;

    fileInput.onchange = async (event) => {
      const files = (event.target as HTMLInputElement).files;
      if (!files || files.length === 0) return;

      setImportLoading(true);
      setLoading(true);
      setLoadingMessage("Reading your files...");
      setError(null);
      setCurrentOperation("token-import"); // Quick Win #6

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

        setLoadingMessage("Adding tokens to Figma...");

        parent.postMessage(
          {
            pluginMessage: {
              type: "import-tokens",
              files: fileContents,
            },
          },
          "*"
        );
      } catch (err) {
        console.error("Failed to read files:", err);
        setError(
          `Failed to read files: ${err instanceof Error ? err.message : "Unknown error"}`
        );
        setImportLoading(false);
        setLoading(false);
        setLoadingMessage("");
        setCurrentOperation(null);
      }
    };

    fileInput.click();
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () =>
        reject(new Error(`Failed to read file: ${file.name}`));
      reader.readAsText(file);
    });
  };

  const goBack = () => {
    setCurrentView("collections");
    setSelectedCollection(null);
  };

  const closePlugin = () => {
    console.log("closePlugin clicked");
    try {
      parent.postMessage({ pluginMessage: { type: "close" } }, "*");
    } catch (err) {
      console.error("Failed to send close message:", err);
    }
  };

  // Setup wizard handler - Quick Win #4
  const handleSetupWizardComplete = (config: GitHubConfig) => {
    setShowSetupWizard(false);
    handleGitHubConfigSaved(config);
  };

  // Conflict resolution handler
  const handleConflictResolution = async (
    resolutions: ConflictResolution[]
  ) => {
    try {
      setLoading(true);
      setLoadingMessage("Saving your choices...");

      const exportData = pendingTokensForConflictResolution || [];
      const resolvedTokens = githubClient.applyConflictResolutions(
        exportData,
        resolutions
      );

      const files = resolvedTokens.map((tokenCollection, index) => {
        const collectionName =
          Object.keys(tokenCollection)[0] || `collection-${index}`;
        return {
          filename: `${collectionName.toLowerCase().replace(/\s+/g, "-")}.json`,
          content: JSON.stringify([tokenCollection], null, 2),
        };
      });

      parent.postMessage(
        {
          pluginMessage: {
            type: "import-tokens",
            files: files,
          },
        },
        "*"
      );

      setShowConflictResolution(false);
      setConflicts([]);
      setSuccessMessage(
        `✅ All set! Applied ${resolutions.length} ${resolutions.length === 1 ? "change" : "changes"}`
      );
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error: any) {
      console.error("Conflict resolution error:", error);
      setError(`Conflict resolution failed: ${error.message}`);
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  };

  // Operation cancellation handler - Quick Win #6
  const handleCancelOperation = () => {
    console.log("Cancelling operation:", currentOperation);

    // Reset state
    setLoading(false);
    setLoadingMessage("");
    setProgressSteps([]);
    setProgressStep(0);
    setCurrentOperation(null);

    // Send cancellation message to plugin
    if (currentOperation) {
      parent.postMessage(
        {
          pluginMessage: {
            type: "cancel-operation",
            operation: currentOperation,
          },
        },
        "*"
      );
    }

    // Show cancellation message
    setSuccessMessage("⚠️ Operation cancelled");
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Onboarding handlers - v2.0 Enhancement
  const handleGenerateDemoTokens = () => {
    console.log("Generate demo tokens clicked");
    setShowOnboarding(false);
    saveOnboardingComplete();
    setLoading(true);
    setLoadingMessage("Loading demo tokens...");

    parent.postMessage(
      {
        pluginMessage: {
          type: "generate-demo-tokens",
        },
      },
      "*"
    );
  };

  const handleImportFigmaVariables = () => {
    console.log("Import Figma Variables clicked");
    setShowOnboarding(false);
    saveOnboardingComplete();
    setShowExistingTokensImporter(true);
  };

  const handleImportFromGitHub = () => {
    console.log("Import from GitHub clicked");
    setShowOnboarding(false);
    saveOnboardingComplete();
    // Use existing GitHub pull functionality
    if (githubConfigured) {
      pullFromGitHub();
    } else {
      setShowSetupWizard(true);
    }
  };

  console.log(
    "Rendering with collections:",
    collections.length,
    "loading:",
    loading,
    "error:",
    error
  );

  if (currentView === "github-config") {
    return (
      <GitHubConfigComponent
        onConfigSaved={handleGitHubConfigSaved}
        onClose={handleGitHubConfigClose}
      />
    );
  }

  if (currentView === "collection-detail" && selectedCollection) {
    return (
      <div style={{ padding: "16px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <button
            onClick={goBack}
            style={{
              marginRight: "12px",
              padding: "4px 8px",
              backgroundColor: "#f1f5f9",
              border: "1px solid #cbd5e1",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "11px",
            }}
          >
            ← Back
          </button>
          <h2 style={{ margin: "0", fontSize: "16px", fontWeight: "bold" }}>
            {selectedCollection.name}
          </h2>
        </div>

        {loading && (
          <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
            {loadingMessage || "Loading..."}
          </div>
        )}

        {error && (
          <div
            style={{
              padding: "8px 12px",
              marginBottom: "16px",
              backgroundColor: "#fee",
              border: "1px solid #fcc",
              borderRadius: "4px",
              color: "#c33",
            }}
          >
            ❌ {error}
          </div>
        )}

        <div style={{ marginBottom: "16px", fontSize: "12px", color: "#666" }}>
          {selectedCollection.variables.length} variables •{" "}
          {selectedCollection.modes.length} modes
        </div>

        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
          {selectedCollection.variables.map((variable) => (
            <div
              key={variable.id}
              style={{
                marginBottom: "12px",
                padding: "12px",
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                backgroundColor: "#f8fafc",
              }}
            >
              <div
                style={{
                  fontWeight: "bold",
                  fontSize: "13px",
                  marginBottom: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>{variable.name}</span>
                <span
                  style={{
                    fontSize: "10px",
                    backgroundColor: "#cbd5e1",
                    padding: "2px 6px",
                    borderRadius: "3px",
                    fontWeight: "normal",
                  }}
                >
                  {variable.resolvedType}
                </span>
              </div>

              {variable.description && (
                <div
                  style={{
                    fontSize: "11px",
                    color: "#64748b",
                    marginBottom: "8px",
                  }}
                >
                  {variable.description}
                </div>
              )}

              {selectedCollection.modes.map((mode) => {
                const value = formatTokenValue(variable, mode.modeId);
                return (
                  <div
                    key={mode.modeId}
                    style={{
                      fontSize: "11px",
                      marginBottom: "4px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: "medium",
                        minWidth: "60px",
                        color: "#475569",
                      }}
                    >
                      {mode.name}:
                    </span>
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontSize: "10px",
                        marginLeft: "8px",
                      }}
                    >
                      {value}
                    </span>
                    {variable.resolvedType === "COLOR" &&
                      value.startsWith("#") && (
                        <div
                          style={{
                            width: "16px",
                            height: "16px",
                            backgroundColor: value,
                            border: "1px solid #ccc",
                            borderRadius: "3px",
                            marginLeft: "8px",
                          }}
                        />
                      )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "16px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "16px",
        }}
      >
        <h2
          style={{
            margin: "0",
            fontSize: "var(--font-size-xl)",
            fontWeight: "var(--font-weight-semibold)",
            color: "var(--text-primary)",
          }}
        >
          Token Bridge
        </h2>

        {/* Help/Settings button */}
        <button
          onClick={() => setShowOnboarding(true)}
          aria-label="Show onboarding guide"
          title="Show onboarding guide"
          style={{
            padding: "8px",
            backgroundColor: "transparent",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-md)",
            cursor: "pointer",
            fontSize: "18px",
            lineHeight: 1,
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--surface-secondary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          ?
        </button>
      </div>

      {error && (
        <EnhancedErrorDisplay
          error={error}
          onDismiss={() => setError(null)}
          onRetry={() => {
            setError(null);
            if (typeof error !== "string" && error.type === "network-error") {
              loadCollections();
            }
          }}
        />
      )}

      {successMessage && (
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
          {successMessage}
        </div>
      )}

      {/* Tab Navigation - Phase 1 UX Enhancement */}
      <TabBar
        tabs={[
          { id: "tokens", label: "Tokens", icon: "🎨" },
          { id: "import", label: "Import", icon: "📥" },
          { id: "export", label: "Export", icon: "📤" },
          {
            id: "sync",
            label: "Sync",
            icon: "🔄",
            disabled: !githubConfigured,
          },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* TOKENS TAB */}
      {activeTab === "tokens" && (
        <>
          {collections.length > 0 && (
            <TokensTab
              collections={collections}
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
                parent.postMessage(
                  { pluginMessage: { type: "get-collection-details", id } },
                  "*"
                );
              }}
              onSelectAll={() => {
                setSelectedCollections(new Set(collections.map((c) => c.id)));
              }}
              onDeselectAll={() => {
                setSelectedCollections(new Set());
              }}
              loading={loading}
            />
          )}
          {collections.length === 0 && !loading && (
            <div
              style={{
                padding: "var(--space-8)",
                textAlign: "center" as const,
                color: "var(--text-secondary)",
                backgroundColor: "var(--surface-secondary)",
                borderRadius: "var(--radius-md)",
              }}
            >
              <div
                style={{
                  fontSize: "var(--font-size-lg)",
                  marginBottom: "var(--space-2)",
                }}
              >
                No token collections found
              </div>
              <div style={{ fontSize: "var(--font-size-xs)" }}>
                Import tokens or create variable collections in Figma
              </div>
            </div>
          )}
        </>
      )}

      {/* IMPORT TAB */}
      {activeTab === "import" && (
        <ImportTab
          onImportFile={handleTokenImport}
          onImportFromGitHub={pullFromGitHub}
          onImportFigmaVariables={handleImportFigmaVariables}
          onLoadDemoTokens={handleGenerateDemoTokens}
          onShowFormatGuidelines={() => setShowFormatGuidelines(true)}
          loading={loading || importLoading}
          hasGitHubConfig={githubConfigured}
          hasFigmaVariables={hasFigmaVariables}
        />
      )}

      {/* EXPORT TAB */}
      {activeTab === "export" && (
        <ExportTab
          selectedCollections={selectedCollections}
          onDownloadJSON={() => {
            if (selectedCollections.size === 0) {
              setError("Please select at least one collection to export");
              return;
            }
            parent.postMessage(
              {
                pluginMessage: {
                  type: "export-tokens",
                  collectionIds: Array.from(selectedCollections),
                },
              },
              "*"
            );
          }}
          onPushToGitHub={() => {
            if (!githubConfigured) {
              setError("Please configure GitHub first");
              return;
            }
            if (selectedCollections.size === 0) {
              setError("Please select at least one collection to export");
              return;
            }
            parent.postMessage(
              {
                pluginMessage: {
                  type: "github-sync-tokens",
                  collectionIds: Array.from(selectedCollections),
                },
              },
              "*"
            );
          }}
          loading={loading}
          hasGitHubConfig={githubConfigured}
        />
      )}

      {/* SYNC TAB */}
      {activeTab === "sync" && (
        <SyncTab
          githubConfig={githubConfig}
          onConfigureGitHub={() => {
            if (githubConfigured) {
              setCurrentView("github-config");
            } else {
              setShowSetupWizard(true);
            }
          }}
          onQuickSync={() => {
            if (selectedCollections.size === 0) {
              setError("Please select collections from the Tokens tab first");
              return;
            }
            parent.postMessage(
              {
                pluginMessage: {
                  type: "github-sync-tokens",
                  collectionIds: Array.from(selectedCollections),
                },
              },
              "*"
            );
          }}
          onPullFromGitHub={pullFromGitHub}
          onPushToGitHub={() => {
            if (selectedCollections.size === 0) {
              setError("Please select collections from the Tokens tab first");
              return;
            }
            parent.postMessage(
              {
                pluginMessage: {
                  type: "github-sync-tokens",
                  collectionIds: Array.from(selectedCollections),
                },
              },
              "*"
            );
          }}
          loading={loading}
          selectedCollections={selectedCollections}
        />
      )}

      {showConflictResolution && conflicts.length > 0 && (
        <ConflictResolutionDisplay
          conflicts={conflicts}
          onResolve={handleConflictResolution}
          onCancel={() => {
            setShowConflictResolution(false);
            setConflicts([]);
            setLoading(false);
          }}
          loading={loading}
        />
      )}

      {/* Setup Wizard - Quick Win #4 */}
      {showSetupWizard && (
        <SetupWizard
          onComplete={handleSetupWizardComplete}
          onClose={() => setShowSetupWizard(false)}
        />
      )}

      {/* First-Run Onboarding - v2.0 Enhancement */}
      {showOnboarding && (
        <FirstRunOnboarding
          onDemoTokens={handleGenerateDemoTokens}
          onImportVariables={handleImportFigmaVariables}
          onImportFile={() => {
            setShowOnboarding(false);
            saveOnboardingComplete();
            handleTokenImport();
          }}
          onSetupGitHub={() => {
            setShowOnboarding(false);
            saveOnboardingComplete();
            setShowSetupWizard(true);
          }}
          onSkip={() => {
            setShowOnboarding(false);
            saveOnboardingComplete();
          }}
        />
      )}

      {/* Existing Tokens Importer - v2.0 Enhancement */}
      {showExistingTokensImporter && (
        <ExistingTokensImporter
          onImport={() => {
            setShowExistingTokensImporter(false);
            // Conversion will be handled by plugin message handler
          }}
          onCancel={() => setShowExistingTokensImporter(false)}
        />
      )}

      {/* Format Guidelines Dialog - v2.0 Enhancement */}
      {showFormatGuidelines && (
        <FormatGuidelinesDialog
          onClose={() => setShowFormatGuidelines(false)}
        />
      )}

      <ProgressFeedback
        steps={progressSteps}
        currentStep={progressStep}
        loading={loading && progressSteps.length > 0}
        onCancel={currentOperation ? handleCancelOperation : undefined}
      />
    </div>
  );
}

console.log("About to render App");
const root = document.getElementById("root");
console.log("Root element:", root);

if (root) {
  render(<App />, root);
  console.log("App rendered successfully");
} else {
  console.error("Root element not found!");
}

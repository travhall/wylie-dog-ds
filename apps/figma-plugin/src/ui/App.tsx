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

  // Progressive disclosure - Quick Win #2
  const [advancedMode, setAdvancedMode] = useState(false);

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

  // Settings menu - UX Overhaul
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

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

  const toggleAdvancedMode = () => {
    const newMode = !advancedMode;
    setAdvancedMode(newMode);

    // Save preference
    parent.postMessage(
      {
        pluginMessage: {
          type: "save-advanced-mode",
          advancedMode: newMode,
        },
      },
      "*"
    );
  };

  // Close settings menu when clicking outside
  useEffect(() => {
    if (!showSettingsMenu) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-settings-menu]")) {
        setShowSettingsMenu(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showSettingsMenu]);

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

        case "advanced-mode-loaded":
          console.log("Advanced mode loaded:", msg.advancedMode);
          setAdvancedMode(msg.advancedMode);
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
    loadAdvancedMode();
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

  const loadAdvancedMode = () => {
    try {
      parent.postMessage({ pluginMessage: { type: "get-advanced-mode" } }, "*");
    } catch (err) {
      console.error("Failed to load advanced mode:", err);
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
        <h2 style={{ margin: "0", fontSize: "16px", fontWeight: "bold" }}>
          Token Bridge
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {/* Advanced Mode Toggle */}
          <button
            onClick={toggleAdvancedMode}
            aria-label={
              advancedMode ? "Switch to Simple mode" : "Switch to Advanced mode"
            }
            style={{
              padding: "6px 10px",
              backgroundColor: "#f3f4f6",
              color: "#374151",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "10px",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              transition: "all 0.2s ease",
            }}
            title={
              advancedMode ? "Switch to Simple mode" : "Switch to Advanced mode"
            }
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#e5e7eb";
              e.currentTarget.style.borderColor = "#9ca3af";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#f3f4f6";
              e.currentTarget.style.borderColor = "#d1d5db";
            }}
          >
            <span>{advancedMode ? "🔧" : "⚡"}</span>
            <span>{advancedMode ? "Advanced" : "Simple"}</span>
          </button>

          {/* Settings Menu Button */}
          <div style={{ position: "relative" }} data-settings-menu>
            <button
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              aria-label="Settings menu"
              aria-expanded={showSettingsMenu}
              aria-haspopup="true"
              style={{
                padding: "6px 8px",
                backgroundColor: showSettingsMenu ? "#e5e7eb" : "#f3f4f6",
                color: "#374151",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                transition: "all 0.2s ease",
              }}
              title="Settings"
              onMouseEnter={(e) => {
                if (!showSettingsMenu) {
                  e.currentTarget.style.backgroundColor = "#e5e7eb";
                  e.currentTarget.style.borderColor = "#9ca3af";
                }
              }}
              onMouseLeave={(e) => {
                if (!showSettingsMenu) {
                  e.currentTarget.style.backgroundColor = "#f3f4f6";
                  e.currentTarget.style.borderColor = "#d1d5db";
                }
              }}
            >
              ⚙️
            </button>

            {/* Settings Dropdown */}
            {showSettingsMenu && (
              <div
                role="menu"
                aria-label="Settings menu"
                style={{
                  position: "absolute",
                  top: "32px",
                  right: "0",
                  backgroundColor: "white",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  minWidth: "200px",
                  zIndex: 1000,
                }}
              >
                <div
                  style={{
                    padding: "8px 0",
                  }}
                >
                  {/* GitHub Configuration */}
                  <button
                    role="menuitem"
                    onClick={() => {
                      setShowSettingsMenu(false);
                      if (githubConfigured) {
                        setCurrentView("github-config");
                      } else {
                        setShowSetupWizard(true);
                      }
                    }}
                    aria-label="GitHub Configuration"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      backgroundColor: "transparent",
                      border: "none",
                      textAlign: "left",
                      cursor: "pointer",
                      fontSize: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      transition: "background-color 0.15s ease",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f3f4f6")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <span>🔗</span>
                    <span>GitHub Configuration</span>
                  </button>

                  {/* Get Started */}
                  <button
                    role="menuitem"
                    onClick={() => {
                      setShowSettingsMenu(false);
                      setShowOnboarding(true);
                    }}
                    aria-label="Get Started"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      backgroundColor: "transparent",
                      border: "none",
                      textAlign: "left",
                      cursor: "pointer",
                      fontSize: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      transition: "background-color 0.15s ease",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f3f4f6")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <span>🚀</span>
                    <span>Get Started</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
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

      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        <button
          onClick={handleTokenImport}
          disabled={loading || importLoading}
          aria-label="Add tokens from file"
          style={{
            flex: 1,
            padding: "8px 16px",
            backgroundColor: loading || importLoading ? "#cbd5e1" : "#16a34a",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading || importLoading ? "not-allowed" : "pointer",
            fontSize: "12px",
            fontWeight: "bold",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            if (!loading && !importLoading) {
              e.currentTarget.style.backgroundColor = "#15803d";
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
            }
          }}
          onMouseLeave={(e) => {
            if (!loading && !importLoading) {
              e.currentTarget.style.backgroundColor = "#16a34a";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }
          }}
        >
          {importLoading ? "Adding..." : "Add Tokens"}
        </button>
      </div>

      {collections.length > 0 && (
        <div
          style={{
            padding: "16px",
            backgroundColor: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <h3
              style={{
                margin: "0",
                fontSize: "14px",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                color: "#1f2937",
              }}
            >
              📦 Your Design Tokens
              <HelpIcon
                content={HELP_CONTENT.COLLECTION_SELECTION.content}
                title={HELP_CONTENT.COLLECTION_SELECTION.title}
              />
            </h3>
            {advancedMode && (
              <div style={{ fontSize: "11px", color: "#6b7280" }}>
                {selectedCollections.size} of {collections.length} selected
              </div>
            )}
          </div>

          {collections.map((collection) => (
            <div
              key={collection.id}
              style={{
                marginBottom: "10px",
                padding: "14px",
                border: selectedCollections.has(collection.id)
                  ? "2px solid #0ea5e9"
                  : "1px solid #e5e7eb",
                borderRadius: "6px",
                backgroundColor: selectedCollections.has(collection.id)
                  ? "#f0f9ff"
                  : "#fafafa",
                transition: "all 0.2s ease",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "4px",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: "bold",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedCollections.has(collection.id)}
                    onChange={() => toggleCollection(collection.id)}
                    style={{ marginRight: "8px" }}
                  />
                  {collection.name}
                </label>
                {advancedMode && (
                  <button
                    onClick={() => loadCollectionDetails(collection.id)}
                    style={{
                      padding: "4px 8px",
                      backgroundColor: "#e2e8f0",
                      border: "1px solid #cbd5e1",
                      borderRadius: "3px",
                      cursor: "pointer",
                      fontSize: "10px",
                    }}
                  >
                    View Details →
                  </button>
                )}
              </div>
              {advancedMode && (
                <div
                  style={{
                    fontSize: "11px",
                    color: "#6b7280",
                    fontWeight: "500",
                  }}
                >
                  {collection.variableIds.length} variables •{" "}
                  {collection.modes.length} modes
                </div>
              )}
            </div>
          ))}

          <div
            style={{
              marginTop: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {/* GitHub Sync Section */}
            <div
              style={{
                padding: "16px",
                backgroundColor: githubConfigured ? "#f0f9ff" : "#ffffff",
                border: githubConfigured
                  ? "2px solid #0ea5e9"
                  : "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: "bold",
                  color: "#1f2937",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginBottom: "12px",
                }}
              >
                💾 Save to GitHub
              </div>

              {githubConfigured ? (
                <div>
                  {/* GitHub Connection Status */}
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#059669",
                      marginBottom: "12px",
                      padding: "8px",
                      backgroundColor: "#ecfdf5",
                      borderRadius: "4px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span style={{ fontSize: "16px" }}>✅</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: "bold", marginBottom: "2px" }}>
                        Connected
                      </div>
                      <div style={{ fontSize: "10px", color: "#047857" }}>
                        {githubConfig?.owner}/{githubConfig?.repo}
                        {githubConfig?.syncMode === "pull-request" &&
                          " (PR mode)"}
                      </div>
                    </div>
                  </div>

                  {advancedMode && (
                    <div style={{ marginBottom: "8px" }}>
                      <SyncStatus
                        githubClient={githubClient}
                        githubConfigured={githubConfigured}
                        onRefresh={loadCollections}
                      />
                    </div>
                  )}

                  {githubConfig?.syncMode === "direct" ? (
                    <div style={{ display: "flex", gap: "4px" }}>
                      <button
                        onClick={pullFromGitHub}
                        disabled={loading}
                        aria-label="Get tokens from GitHub"
                        style={{
                          flex: 1,
                          padding: "8px 12px",
                          backgroundColor: loading ? "#cbd5e1" : "#16a34a",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: loading ? "not-allowed" : "pointer",
                          fontSize: "11px",
                          fontWeight: "bold",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!loading) {
                            e.currentTarget.style.backgroundColor = "#15803d";
                            e.currentTarget.style.transform =
                              "translateY(-1px)";
                            e.currentTarget.style.boxShadow =
                              "0 2px 4px rgba(0, 0, 0, 0.1)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!loading) {
                            e.currentTarget.style.backgroundColor = "#16a34a";
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "none";
                          }
                        }}
                      >
                        {loading ? "Getting..." : "⬇️ Get from GitHub"}
                      </button>
                      <button
                        onClick={() => exportTokens(true)}
                        disabled={loading || selectedCollections.size === 0}
                        aria-label="Save tokens to GitHub"
                        style={{
                          flex: 1,
                          padding: "8px 12px",
                          backgroundColor:
                            loading || selectedCollections.size === 0
                              ? "#cbd5e1"
                              : "#0ea5e9",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor:
                            loading || selectedCollections.size === 0
                              ? "not-allowed"
                              : "pointer",
                          fontSize: "11px",
                          fontWeight: "bold",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!loading && selectedCollections.size > 0) {
                            e.currentTarget.style.backgroundColor = "#0284c7";
                            e.currentTarget.style.transform =
                              "translateY(-1px)";
                            e.currentTarget.style.boxShadow =
                              "0 2px 4px rgba(0, 0, 0, 0.1)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!loading && selectedCollections.size > 0) {
                            e.currentTarget.style.backgroundColor = "#0ea5e9";
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "none";
                          }
                        }}
                      >
                        {loading ? "Saving..." : "⬆️ Save to GitHub"}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => exportTokens(true)}
                      disabled={loading || selectedCollections.size === 0}
                      style={{
                        width: "100%",
                        padding: "10px 16px",
                        backgroundColor:
                          loading || selectedCollections.size === 0
                            ? "#cbd5e1"
                            : "#0ea5e9",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor:
                          loading || selectedCollections.size === 0
                            ? "not-allowed"
                            : "pointer",
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}
                    >
                      {loading
                        ? "Saving..."
                        : `💾 Save ${selectedCollections.size} ${selectedCollections.size === 1 ? "Set" : "Sets"}`}
                    </button>
                  )}
                </div>
              ) : (
                <div
                  style={{
                    fontSize: "11px",
                    color: "#6b7280",
                    padding: "12px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ marginBottom: "8px" }}>
                    Not connected to GitHub
                  </div>
                  <button
                    onClick={() => setShowSetupWizard(true)}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#0ea5e9",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "11px",
                      fontWeight: "bold",
                    }}
                  >
                    Connect to GitHub
                  </button>
                  <div
                    style={{
                      fontSize: "10px",
                      marginTop: "8px",
                      color: "#9ca3af",
                    }}
                  >
                    Or use Settings ⚙️
                  </div>
                </div>
              )}
            </div>

            {/* Local Export Section */}
            <div
              style={{
                padding: "16px",
                backgroundColor: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: "bold",
                  color: "#1f2937",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginBottom: "12px",
                }}
              >
                📥 Download Files
              </div>
              <button
                onClick={() => exportTokens(false)}
                disabled={loading || selectedCollections.size === 0}
                aria-label={`Download ${selectedCollections.size} token file${selectedCollections.size === 1 ? "" : "s"}`}
                style={{
                  width: "100%",
                  padding: "10px 16px",
                  backgroundColor:
                    loading || selectedCollections.size === 0
                      ? "#cbd5e1"
                      : "#16a34a",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor:
                    loading || selectedCollections.size === 0
                      ? "not-allowed"
                      : "pointer",
                  fontSize: "12px",
                  fontWeight: "bold",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (!loading && selectedCollections.size > 0) {
                    e.currentTarget.style.backgroundColor = "#15803d";
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow =
                      "0 2px 4px rgba(0, 0, 0, 0.1)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading && selectedCollections.size > 0) {
                    e.currentTarget.style.backgroundColor = "#16a34a";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }
                }}
              >
                {loading
                  ? "Preparing..."
                  : `Download ${selectedCollections.size} ${selectedCollections.size === 1 ? "File" : "Files"}`}
              </button>
            </div>
          </div>

          {downloadQueue.length > 0 && (
            <div
              style={{
                marginTop: "16px",
                padding: "12px",
                backgroundColor: "#f0f9ff",
                border: "1px solid #bae6fd",
                borderRadius: "6px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "#0369a1",
                  }}
                >
                  📥 Files Ready for Download
                </div>
                <button
                  onClick={clearDownloadQueue}
                  style={{
                    padding: "2px 6px",
                    backgroundColor: "#f3f4f6",
                    border: "1px solid #d1d5db",
                    borderRadius: "3px",
                    cursor: "pointer",
                    fontSize: "9px",
                    color: "#374151",
                  }}
                >
                  Clear
                </button>
              </div>

              <div
                style={{
                  fontSize: "10px",
                  color: "#0369a1",
                  marginBottom: "8px",
                }}
              >
                Click each button to download individual files (browser blocks
                multiple downloads)
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: "4px" }}
              >
                {downloadQueue.map((collectionData, index) => {
                  const collectionName = Object.keys(collectionData)[0];
                  const tokenCount = Object.keys(
                    collectionData[collectionName]
                  ).length;

                  return (
                    <button
                      key={index}
                      onClick={() => downloadSingleFile(collectionData)}
                      style={{
                        padding: "8px 12px",
                        backgroundColor: "#0ea5e9",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "11px",
                        textAlign: "left",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span>📄 {collectionName}.json</span>
                      <span style={{ fontSize: "9px", opacity: 0.8 }}>
                        {tokenCount} tokens
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {advancedMode && (
            <div
              style={{
                marginTop: "12px",
                padding: "12px",
                backgroundColor: "#f1f5f9",
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: "bold",
                  marginBottom: "6px",
                }}
              >
                ℹ️ Export Information
              </div>
              <div
                style={{
                  fontSize: "10px",
                  color: "#64748b",
                  lineHeight: "1.4",
                }}
              >
                <strong>Local Export:</strong> Downloads W3C DTCG format JSON
                files to your computer
                <br />
                <strong>GitHub Sync:</strong>{" "}
                {githubConfig?.syncMode === "direct"
                  ? "Direct push/pull to branch"
                  : "Creates pull request"}{" "}
                with token files
                <br />
                <strong>Format:</strong> Each collection becomes a separate file
                (e.g., primitive.json, semantic-light.json)
              </div>
            </div>
          )}
        </div>
      )}

      {collections.length === 0 && !loading && !error && !showOnboarding && (
        <div
          style={{
            padding: "40px 20px",
            textAlign: "center",
            backgroundColor: "#f9fafb",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
          }}
        >
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>🎨</div>
          <div
            style={{
              fontSize: "14px",
              fontWeight: "bold",
              color: "#374151",
              marginBottom: "8px",
            }}
          >
            No design tokens yet
          </div>
          <div
            style={{ fontSize: "12px", color: "#6b7280", marginBottom: "16px" }}
          >
            Use "Add Tokens" above or click Get Started
          </div>
          <button
            onClick={() => setShowOnboarding(true)}
            aria-label="Get started with Token Bridge"
            style={{
              padding: "10px 20px",
              backgroundColor: "#0ea5e9",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "bold",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#0284c7";
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#0ea5e9";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Get Started
          </button>
        </div>
      )}

      {advancedMode && adapterResults.length > 0 && (
        <TransformationFeedback adapterResults={adapterResults} />
      )}

      {advancedMode && showValidation && validationReport && (
        <ValidationDisplay
          validationReport={validationReport}
          onClose={() => setShowValidation(false)}
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

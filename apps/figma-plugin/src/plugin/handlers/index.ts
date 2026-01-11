/**
 * Handler Registry
 *
 * Central message router with type-safe handler mapping.
 * Routes incoming messages to appropriate handler functions.
 */

// Collection handlers
import {
  handleGetCollections,
  handleGetCollectionDetails,
} from "./collection-handlers";

// Token handlers
import {
  handleValidateImport,
  handleImportTokens,
  handleExportTokens,
  handleGetLocalTokens,
} from "./token-handlers";

// GitHub handlers
import {
  handleGitHubSyncTokens,
  handleGitHubPullTokens,
  handleGitHubPullWithConflicts,
  handleResolveConflicts,
  handleTestGitHubConfig,
} from "./github-handlers";

// Storage handlers
import {
  handleGetGitHubConfig,
  handleSaveGitHubConfig,
  handleClearGitHubConfig,
  handleGetAdvancedMode,
  handleSaveAdvancedMode,
  handleGetOnboardingState,
  handleSaveOnboardingState,
  handleCheckFileEngagement,
  handleMarkFileEngaged,
} from "./storage-handlers";

// Utility handlers
import {
  handleGenerateDemoTokens,
  handleDetectFigmaVariables,
  handleConvertFigmaVariables,
  handleCancelOperation,
} from "./utility-handlers";

// OAuth handlers
import {
  handleOAuthInitiate,
  handleOAuthSignOut,
  handleOAuthStatus,
  handleGetAccessToken,
} from "../oauth/message-handler";

/**
 * Message handler function type
 */
export type MessageHandler = (msg: any) => Promise<void> | void;

/**
 * Handler registry mapping message types to handler functions
 */
export interface HandlerRegistry {
  [messageType: string]: MessageHandler;
}

/**
 * Create the handler registry with all message handlers
 */
export function createHandlerRegistry(): HandlerRegistry {
  return {
    // Collection handlers
    "get-collections": handleGetCollections,
    "get-collection-details": handleGetCollectionDetails,

    // Token handlers
    "validate-import": handleValidateImport,
    "import-tokens": handleImportTokens,
    "export-tokens": handleExportTokens,
    "get-local-tokens": handleGetLocalTokens,

    // GitHub handlers
    "github-sync-tokens": handleGitHubSyncTokens,
    "github-pull-tokens": handleGitHubPullTokens,
    "github-pull-with-conflicts": handleGitHubPullWithConflicts,
    "resolve-conflicts": handleResolveConflicts,
    "test-github-config": handleTestGitHubConfig,

    // Storage handlers
    "get-github-config": handleGetGitHubConfig,
    "save-github-config": handleSaveGitHubConfig,
    "clear-github-config": handleClearGitHubConfig,
    "get-advanced-mode": handleGetAdvancedMode,
    "save-advanced-mode": handleSaveAdvancedMode,
    "get-onboarding-state": handleGetOnboardingState,
    "save-onboarding-state": handleSaveOnboardingState,
    "check-file-engagement": handleCheckFileEngagement,
    "mark-file-engaged": handleMarkFileEngaged,

    // Utility handlers
    "generate-demo-tokens": handleGenerateDemoTokens,
    "detect-figma-variables": handleDetectFigmaVariables,
    "convert-figma-variables": handleConvertFigmaVariables,
    "cancel-operation": handleCancelOperation,

    // OAuth handlers
    "oauth-initiate": (msg: any) =>
      handleOAuthInitiate(msg.provider, msg.repoUrl),
    "oauth-signout": handleOAuthSignOut,
    "oauth-status": handleOAuthStatus,
    "get-access-token": handleGetAccessToken,
  };
}

/**
 * Route a message to the appropriate handler
 *
 * @param msg - The message to route
 */
export async function routeMessage(msg: any): Promise<void> {
  const registry = createHandlerRegistry();
  const handler = registry[msg.type];

  if (!handler) {
    console.warn(`⚠️ Unknown message type: ${msg.type}`);
    figma.ui.postMessage({
      type: "error",
      message: `Unknown message type: ${msg.type}`,
    });
    return;
  }

  try {
    await handler(msg);
  } catch (error) {
    console.error(`❌ Error handling ${msg.type}:`, error);
    figma.ui.postMessage({
      type: "error",
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
}

/**
 * Get list of all supported message types
 */
export function getSupportedMessageTypes(): string[] {
  return Object.keys(createHandlerRegistry());
}

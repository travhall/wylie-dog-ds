/**
 * Custom Hooks Module
 *
 * Exports all custom hooks for the Token Bridge plugin
 */

// Plugin Message Communication
export { usePluginMessages } from "./usePluginMessages";
export type {
  PluginMessageState,
  PluginMessageActions,
  Collection,
  Variable,
  CollectionDetails,
} from "./usePluginMessages";

// Domain-Specific Hooks
export { useGitHubSync } from "./domain/useGitHubSync";

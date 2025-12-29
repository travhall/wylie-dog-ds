/**
 * UI State Types
 *
 * Defines all UI-specific state (tabs, modals, selections)
 * Separate from plugin message state (managed by usePluginMessages)
 */

/**
 * Tab identifiers for main navigation
 */
export type Tab = "tokens" | "import" | "sync";

/**
 * Active modal dialogs
 */
export type ModalType =
  | "github-setup"
  | "conflict-resolution"
  | "validation"
  | "onboarding"
  | "settings"
  | null;

/**
 * Theme preference
 */
export type Theme = "light" | "dark" | "auto";

/**
 * UI State shape
 */
export interface UIState {
  // Navigation
  activeTab: Tab;

  // Modals
  activeModal: ModalType;

  // Theme
  theme: Theme;

  // Selections
  selectedCollectionId: string | null;
  selectedExportFormat: string;

  // Advanced mode toggles
  showAdvancedGitHub: boolean;
  showAdvancedExport: boolean;

  // Help system
  showHelp: boolean;
  helpContext: string | null; // Context-specific help key

  // Onboarding
  hasSeenOnboarding: boolean;
}

/**
 * UI Actions (discriminated union)
 */
export type UIAction =
  | { type: "SET_TAB"; tab: Tab }
  | { type: "OPEN_MODAL"; modal: ModalType }
  | { type: "CLOSE_MODAL" }
  | { type: "SET_THEME"; theme: Theme }
  | { type: "SELECT_COLLECTION"; collectionId: string | null }
  | { type: "SET_EXPORT_FORMAT"; format: string }
  | { type: "TOGGLE_ADVANCED_GITHUB" }
  | { type: "TOGGLE_ADVANCED_EXPORT" }
  | { type: "SHOW_HELP"; context?: string }
  | { type: "HIDE_HELP" }
  | { type: "COMPLETE_ONBOARDING" }
  | { type: "RESET_UI" };

/**
 * Initial UI state
 */
export const initialUIState: UIState = {
  // Navigation
  activeTab: "tokens",

  // Modals
  activeModal: null,

  // Theme
  theme: "auto",

  // Selections
  selectedCollectionId: null,
  selectedExportFormat: "w3c-dtcg",

  // Advanced toggles
  showAdvancedGitHub: false,
  showAdvancedExport: false,

  // Help
  showHelp: false,
  helpContext: null,

  // Onboarding
  hasSeenOnboarding: false,
};

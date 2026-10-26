/**
 * UI State Types
 *
 * Defines all UI-specific state (tabs, modals, selections)
 * Separate from plugin message state (managed by usePluginMessages)
 */

/**
 * Tab identifiers for main navigation
 */
export type Tab = "tokens" | "sync";

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
  selectedCollections: Set<string>;
  // Sync tab Styles section (plan 206): Pull also creates and updates the text
  // styles in the definitions file. Pull only; Push never offers it.
  includeTextStyles: boolean;
  // Plan 207: the box holds a choice (restored from the file, or made here), so
  // the first-run default must not touch it.
  textStylesChosen: boolean;
  // Plan 207: the first-run default was weighed once; it never runs again.
  textStylesDefaultChecked: boolean;

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
  | { type: "RESET_UI" }
  | { type: "TOGGLE_COLLECTION"; id: string }
  | { type: "SELECT_ALL_COLLECTIONS"; ids: string[] }
  | { type: "DESELECT_ALL_COLLECTIONS" }
  | { type: "SET_INCLUDE_TEXT_STYLES"; value: boolean }
  // The file's stored choice arrived (null: it never chose).
  | { type: "LOAD_TEXT_STYLES_CHOICE"; value: boolean | null }
  // First-run default after the first Refresh (plan 207).
  | { type: "APPLY_TEXT_STYLES_DEFAULT"; value: boolean };

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
  selectedCollections: new Set<string>(),
  includeTextStyles: false,
  textStylesChosen: false,
  textStylesDefaultChecked: false,

  // Advanced toggles
  showAdvancedGitHub: false,
  showAdvancedExport: false,

  // Help
  showHelp: false,
  helpContext: null,

  // Onboarding
  hasSeenOnboarding: false,
};

/**
 * UI State Reducer
 *
 * Pure reducer for UI state management
 * Handles all UI-specific actions (tabs, modals, selections)
 */

import type { UIState, UIAction } from "./types";

/**
 * UI state reducer
 *
 * @param state Current UI state
 * @param action Action to perform
 * @returns Updated UI state
 */
export function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case "SET_TAB":
      return {
        ...state,
        activeTab: action.tab,
        // Close help when switching tabs
        showHelp: false,
        helpContext: null,
      };

    case "OPEN_MODAL":
      return {
        ...state,
        activeModal: action.modal,
      };

    case "CLOSE_MODAL":
      return {
        ...state,
        activeModal: null,
      };

    case "SET_THEME":
      return {
        ...state,
        theme: action.theme,
      };

    case "SELECT_COLLECTION":
      return {
        ...state,
        selectedCollectionId: action.collectionId,
      };

    case "SET_EXPORT_FORMAT":
      return {
        ...state,
        selectedExportFormat: action.format,
      };

    case "TOGGLE_ADVANCED_GITHUB":
      return {
        ...state,
        showAdvancedGitHub: !state.showAdvancedGitHub,
      };

    case "TOGGLE_ADVANCED_EXPORT":
      return {
        ...state,
        showAdvancedExport: !state.showAdvancedExport,
      };

    case "SHOW_HELP":
      return {
        ...state,
        showHelp: true,
        helpContext: action.context || null,
      };

    case "HIDE_HELP":
      return {
        ...state,
        showHelp: false,
        helpContext: null,
      };

    case "COMPLETE_ONBOARDING":
      return {
        ...state,
        hasSeenOnboarding: true,
        activeModal: null, // Close onboarding modal
      };

    case "RESET_UI":
      return {
        ...state,
        activeTab: "tokens",
        activeModal: null,
        selectedCollectionId: null,
        showAdvancedGitHub: false,
        showAdvancedExport: false,
        showHelp: false,
        helpContext: null,
      };

    default:
      // Exhaustiveness check
      const _exhaustive: never = action;
      return state;
  }
}

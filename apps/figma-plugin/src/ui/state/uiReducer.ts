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

    case "REQUEST_EDIT_SETUP":
      return {
        ...state,
        activeTab: "sync",
        editSetupRequests: state.editSetupRequests + 1,
      };

    case "RESET_UI":
      return {
        ...state,
        activeTab: "tokens",
        activeModal: null,
        selectedCollectionId: null,
        selectedCollections: new Set<string>(),
        selectionTouched: false,
        showAdvancedGitHub: false,
        showAdvancedExport: false,
        showHelp: false,
        helpContext: null,
      };

    case "TOGGLE_COLLECTION": {
      const next = new Set(state.selectedCollections);
      if (next.has(action.id)) {
        next.delete(action.id);
      } else {
        next.add(action.id);
      }
      return { ...state, selectedCollections: next, selectionTouched: true };
    }

    case "SELECT_ALL_COLLECTIONS":
      return {
        ...state,
        selectedCollections: new Set(action.ids),
        selectionTouched: true,
      };

    case "DESELECT_ALL_COLLECTIONS":
      return {
        ...state,
        selectedCollections: new Set<string>(),
        selectionTouched: true,
      };

    case "PRESELECT_COLLECTIONS":
      if (state.selectionTouched) return state;
      return { ...state, selectedCollections: new Set(action.ids) };

    case "SET_INCLUDE_TEXT_STYLES":
      return {
        ...state,
        includeTextStyles: action.value,
        textStylesChosen: true,
      };

    case "LOAD_TEXT_STYLES_CHOICE":
      // Nothing stored, or the user already chose in this session: keep it.
      if (action.value === null || state.textStylesChosen) return state;
      return {
        ...state,
        includeTextStyles: action.value,
        textStylesChosen: true,
      };

    case "APPLY_TEXT_STYLES_DEFAULT":
      // Weighed once, and never over a choice (stored or made here).
      if (state.textStylesChosen || state.textStylesDefaultChecked)
        return state;
      return {
        ...state,
        textStylesDefaultChecked: true,
        ...(action.value
          ? { includeTextStyles: true, textStylesChosen: true }
          : {}),
      };

    default:
      // Exhaustiveness check
      const _exhaustive: never = action;
      return state;
  }
}

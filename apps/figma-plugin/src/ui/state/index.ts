/**
 * UI State Module
 *
 * Exports all state management utilities
 */

export {
  UIProvider,
  useUIContext,
  useUIState,
  useUIDispatch,
} from "./UIContext";
export { uiReducer } from "./uiReducer";
export { initialUIState } from "./types";
export type { UIState, UIAction, Tab, ModalType, Theme } from "./types";

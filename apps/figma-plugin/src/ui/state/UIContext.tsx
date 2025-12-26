/**
 * UI State Context
 *
 * Provides UI state and dispatch to all components
 * Uses Preact's Context API with useReducer
 */

import { h, createContext } from "preact";
import { useContext, useReducer, useMemo } from "preact/hooks";
import type { ComponentChildren } from "preact";
import { uiReducer } from "./uiReducer";
import { initialUIState } from "./types";
import type { UIState, UIAction } from "./types";

/**
 * Context value shape
 */
interface UIContextValue {
  state: UIState;
  dispatch: (action: UIAction) => void;
}

/**
 * UI Context
 */
const UIContext = createContext<UIContextValue | undefined>(undefined);

/**
 * UI Context Provider Props
 */
interface UIProviderProps {
  children: ComponentChildren;
  initialState?: Partial<UIState>;
}

/**
 * UI Context Provider
 *
 * Wraps the application and provides UI state
 *
 * @example
 * ```tsx
 * <UIProvider>
 *   <App />
 * </UIProvider>
 * ```
 */
export function UIProvider({ children, initialState }: UIProviderProps) {
  const [state, dispatch] = useReducer(
    uiReducer,
    initialState ? { ...initialUIState, ...initialState } : initialUIState
  );

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({ state, dispatch }), [state]);

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

/**
 * Hook to access UI state and dispatch
 *
 * @throws Error if used outside UIProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { state, dispatch } = useUIContext();
 *
 *   return (
 *     <button onClick={() => dispatch({ type: "SET_TAB", tab: "import" })}>
 *       Go to Import
 *     </button>
 *   );
 * }
 * ```
 */
export function useUIContext(): UIContextValue {
  const context = useContext(UIContext);

  if (!context) {
    throw new Error("useUIContext must be used within UIProvider");
  }

  return context;
}

/**
 * Hook for UI state only (no dispatch)
 *
 * Use this for read-only components to prevent unnecessary re-renders
 *
 * @example
 * ```tsx
 * function DisplayTab() {
 *   const state = useUIState();
 *   return <div>Current tab: {state.activeTab}</div>;
 * }
 * ```
 */
export function useUIState(): UIState {
  const { state } = useUIContext();
  return state;
}

/**
 * Hook for dispatch only (no state)
 *
 * Use this for action-only components
 *
 * @example
 * ```tsx
 * function TabButton({ tab }: { tab: Tab }) {
 *   const dispatch = useUIDispatch();
 *   return (
 *     <button onClick={() => dispatch({ type: "SET_TAB", tab })}>
 *       {tab}
 *     </button>
 *   );
 * }
 * ```
 */
export function useUIDispatch(): (action: UIAction) => void {
  const { dispatch } = useUIContext();
  return dispatch;
}

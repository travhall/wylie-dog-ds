/**
 * The file's "Text styles" choice (plan 207).
 *
 * It lives in the Figma file's plugin data, so a plugin reload (a hot reload
 * too) finds the box as the user left it. The UI asks once at startup and the
 * plugin answers `text-styles-choice-loaded`; a click saves the new choice.
 */
import { useEffect } from "preact/hooks";
import type { UIAction } from "../state/types";

/** Remember the user's choice for this file. */
export function saveTextStylesChoice(value: boolean): void {
  parent.postMessage(
    {
      pluginMessage: {
        type: "save-text-styles-choice",
        includeTextStyles: value,
      },
    },
    "*"
  );
}

/** Restore the stored choice into the UI state once, at startup. */
export function useStoredTextStylesChoice(
  dispatch: (action: UIAction) => void
): void {
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const message = event.data?.pluginMessage;
      if (message?.type !== "text-styles-choice-loaded") return;
      dispatch({
        type: "LOAD_TEXT_STYLES_CHOICE",
        value: typeof message.value === "boolean" ? message.value : null,
      });
    };
    window.addEventListener("message", handler);
    parent.postMessage(
      { pluginMessage: { type: "get-text-styles-choice" } },
      "*"
    );
    return () => window.removeEventListener("message", handler);
    // dispatch is stable for the app's lifetime; ask once.
  }, []);
}

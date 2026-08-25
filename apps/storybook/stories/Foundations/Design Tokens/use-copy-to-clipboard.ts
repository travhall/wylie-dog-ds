import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Copies text to the clipboard, tracking which `key` was last successfully
 * copied so callers can show a per-item "Copied" state. On write failure
 * (permission denied, API unavailable — both real possibilities inside a
 * Storybook iframe canvas), `copiedKey` is never set — no false-positive UI.
 */
export function useCopyToClipboard(resetDelayMs = 1800) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const copy = useCallback(
    (key: string, text: string) => {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          setCopiedKey(key);
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          timeoutRef.current = setTimeout(() => {
            setCopiedKey(null);
          }, resetDelayMs);
        })
        .catch(() => {
          // Clipboard write failed — leave copiedKey untouched so no
          // "Copied" state is shown for something that didn't happen.
        });
    },
    [resetDelayMs]
  );

  return { copiedKey, copy };
}

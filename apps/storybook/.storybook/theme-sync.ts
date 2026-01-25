type ThemeChoice = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

type ThemeState = {
  choice: ThemeChoice;
  resolved: ResolvedTheme;
};

const STORAGE_KEY = "storybook-theme";
const MEDIA_QUERY = "(prefers-color-scheme: dark)";

class ThemeSync {
  private initialized = false;
  private mediaQuery: MediaQueryList | null = null;
  private state: ThemeState = { choice: "system", resolved: "light" };

  init(initialChoice?: ThemeChoice) {
    if (this.initialized || typeof window === "undefined") {
      return;
    }

    this.mediaQuery = window.matchMedia(MEDIA_QUERY);
    const choice = initialChoice ?? this.getStoredChoice() ?? "system";
    this.applyChoice(choice, { persist: false });

    if (typeof this.mediaQuery.addEventListener === "function") {
      this.mediaQuery.addEventListener("change", this.handleMediaChange);
    } else if (typeof this.mediaQuery.addListener === "function") {
      this.mediaQuery.addListener(this.handleMediaChange);
    }
    this.initialized = true;
  }

  private handleMediaChange = () => {
    if (this.state.choice === "system") {
      this.applyResolved(this.resolveChoice("system"));
    }
  };

  setChoice(choice: ThemeChoice) {
    if (typeof window === "undefined") {
      return;
    }

    if (!this.initialized) {
      this.init(choice);
      return;
    }

    const resolved = this.resolveChoice(choice);
    const hasChoiceChanged = this.state.choice !== choice;

    // Update choice in state
    this.state.choice = choice;

    if (hasChoiceChanged) {
      this.persistChoice(choice);
    }

    // Apply resolved theme (early return guard prevents redundant DOM updates)
    this.applyResolved(resolved);
  }

  getPreferredChoice(): ThemeChoice {
    return this.getStoredChoice() ?? "system";
  }

  getState(): ThemeState {
    return this.state;
  }

  private applyChoice(
    choice: ThemeChoice,
    options: { persist?: boolean } = {}
  ) {
    const { persist = true } = options;
    this.state.choice = choice;

    if (persist) {
      this.persistChoice(choice);
    }

    this.applyResolved(this.resolveChoice(choice));
  }

  private applyResolved(resolved: ResolvedTheme) {
    if (typeof document === "undefined") {
      return;
    }

    // Don't apply if already applied - prevents unnecessary DOM manipulations
    if (
      this.state.resolved === resolved &&
      document.documentElement.classList.contains(resolved)
    ) {
      return;
    }

    this.state = { ...this.state, resolved };
    const root = document.documentElement;

    root.classList.remove("light", "dark", "sb-theme-light", "sb-theme-dark");
    root.classList.add(resolved);
    root.classList.add(
      resolved === "dark" ? "sb-theme-dark" : "sb-theme-light"
    );
    root.dataset.theme = resolved;
    root.style.setProperty("color-scheme", resolved);
  }

  private resolveChoice(choice: ThemeChoice): ResolvedTheme {
    if (choice === "system") {
      return this.mediaQuery?.matches ? "dark" : "light";
    }

    return choice;
  }

  private getStoredChoice(): ThemeChoice | null {
    try {
      const stored =
        typeof window !== "undefined"
          ? window.localStorage.getItem(STORAGE_KEY)
          : null;
      if (stored === "light" || stored === "dark" || stored === "system") {
        return stored;
      }
    } catch {
      // Access to localStorage can fail in private mode – ignore and fall back.
    }

    return null;
  }

  private persistChoice(choice: ThemeChoice) {
    try {
      window.localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      // Ignore persistence failures – theme will still update in-memory.
    }
  }
}

const themeManager = new ThemeSync();

export { themeManager };
export type { ThemeChoice, ThemeState };

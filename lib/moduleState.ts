/**
 * Per-module sessionStorage persistence.
 * Keeps chat/state when switching between modules in the same browser tab.
 */

const PREFIX = "ai-assistant-module-";

export function saveModuleState<T>(module: string, state: T): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(`${PREFIX}${module}`, JSON.stringify(state));
  } catch {
    // Quota exceeded — ignore
  }
}

export function loadModuleState<T>(module: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(`${PREFIX}${module}`);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function clearModuleState(module: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(`${PREFIX}${module}`);
}

/** Map history module names to routes */
export const MODULE_ROUTES: Record<string, string> = {
  general: "/general",
  chatbot: "/chatbot",
  resume: "/resume",
  interview: "/interview",
  research: "/research",
  vision: "/vision",
};

// Shared fetch helpers for the external APIs.

export const DEFAULT_TIMEOUT_MS = 15000;

// Wraps fetch with an abort timeout so a stalled connection can never leave
// the UI spinning forever. Callers do not pass their own signals today; if
// that changes, combine them here instead of overriding.
export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

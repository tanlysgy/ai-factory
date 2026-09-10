/**
 * Minimal client-side event tracking for experiments.
 *
 * Console-only today: no analytics, no network requests.
 * When a real analytics provider is chosen, replace the body of `track`
 * — the rest of the codebase stays unchanged.
 */
export function track(event: string, details: Record<string, unknown> = {}): void {
  console.info(`[track] ${event}`, details);
}

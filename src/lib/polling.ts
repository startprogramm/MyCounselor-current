export function startVisibilityAwarePolling(
  callback: () => Promise<void> | void,
  intervalMs: number
) {
  let inFlight = false;

  const tick = async () => {
    if (typeof document !== 'undefined' && document.hidden) return;
    if (inFlight) return;

    inFlight = true;
    try {
      await callback();
    } catch {
      // Keep polling alive even if one tick fails.
    } finally {
      inFlight = false;
    }
  };

  const intervalId = window.setInterval(tick, intervalMs);
  return () => window.clearInterval(intervalId);
}

import { useEffect } from "react";

export function useAbortableEffect(effect, deps = []) {
  useEffect(() => {
    const controller = new AbortController();
    effect(controller.signal);
    return () => controller.abort();
  }, deps);
}

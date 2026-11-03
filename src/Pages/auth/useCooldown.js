import { useCallback, useEffect, useState } from "react";

/** A countdown in seconds, used to disable the "send a new code" button for a while. */
export default function useCooldown(initialSeconds = 0) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (seconds <= 0) return undefined;
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds]);

  const start = useCallback((s = 60) => setSeconds(s), []);
  return [seconds, start];
}
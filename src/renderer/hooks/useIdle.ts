import { useState, useEffect, useCallback } from "react";

export function useIdle(timeoutInMs: number = 300000) {
  const [isIdle, setIsIdle] = useState(false);

  // Fonction explicite pour déverrouiller (appelée uniquement si le PIN est bon)
  const resetIdle = useCallback(() => {
    setIsIdle(false);
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    // N'écoute PLUS l'activité globale quand le mode veille est actif
    if (isIdle) return;

    const handleActivity = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setIsIdle(true), timeoutInMs);
    };

    const events = ["mousemove", "keydown", "wheel", "touchstart", "click"];

    events.forEach((event) =>
      window.addEventListener(event, handleActivity, { passive: true }),
    );

    timer = setTimeout(() => setIsIdle(true), timeoutInMs);

    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, handleActivity),
      );
      clearTimeout(timer);
    };
  }, [timeoutInMs, isIdle]);

  return { isIdle, resetIdle, setIsIdle };
}

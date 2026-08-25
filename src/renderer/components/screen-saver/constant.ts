export const IDLE_EVENTS: readonly (keyof WindowEventMap)[] = [
  "mousemove",
  "keydown",
  "wheel",
  "touchstart",
  "click",
];

export const THROTTLE_DELAY_MS = 250;
export const MAX_ALLOWED_ATTEMPTS = 5;
export const INITIAL_COOLDOWN_SECONDS = 300; // 5 minutes
export const DEFAULT_TIMEOUT_MS = 300000;

import React, { useState, useEffect, useCallback, memo } from "react";
import { create } from "zustand";
import { Button } from "@/components/ui/button";
import { Power, Lock, RefreshCw } from "lucide-react";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { cn } from "@/renderer/utils";
import { INITIAL_COOLDOWN_SECONDS, MAX_ALLOWED_ATTEMPTS } from "./constant";

interface SecurityState {
  failedAttempts: number;
  lockoutUntil: number | null;
  cooldownSeconds: number;
  registerFailure: () => void;
  resetAttempts: () => void;
  isLockedOut: () => boolean;
}

/**
 * Zustand store managing PIN security state, failure count, and exponential lockout timers.
 */
export const useSecurityStore = create<SecurityState>((set, get) => ({
  failedAttempts: 0,
  lockoutUntil: null,
  cooldownSeconds: INITIAL_COOLDOWN_SECONDS,

  registerFailure: () => {
    const currentFailures = get().failedAttempts + 1;
    if (currentFailures >= MAX_ALLOWED_ATTEMPTS) {
      const cooldown = get().cooldownSeconds;
      set({
        failedAttempts: currentFailures,
        lockoutUntil: Date.now() + cooldown * 1000,
        cooldownSeconds: cooldown * 2,
      });
    } else {
      set({ failedAttempts: currentFailures });
    }
  },

  resetAttempts: () => {
    set({
      failedAttempts: 0,
      lockoutUntil: null,
      cooldownSeconds: INITIAL_COOLDOWN_SECONDS,
    });
  },

  isLockedOut: () => {
    const { lockoutUntil } = get();
    return lockoutUntil !== null && Date.now() < lockoutUntil;
  },
}));

/**
 * Isolated real-time clock component rendering time in 24h format.
 */
export const ClockDisplay = memo(function ClockDisplay(): React.JSX.Element {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      setTime(
        new Date().toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <h1 className="text-8xl font-extrabold tracking-tighter text-foreground drop-shadow-md sm:text-9xl">
      {time}
    </h1>
  );
});

export interface SecurityPinModalProps {
  isOpen: boolean;
  requiredPin?: string;
  onDismiss: () => void;
  onClosePanel: () => void;
  onResetPin?: () => void;
}

/**
 * Slide-up security panel handling PIN input, failure thresholds, and session recovery in French.
 * @param props - Component configuration properties.
 */
export function SecurityPinModal({
  isOpen,
  requiredPin,
  onDismiss,
  onClosePanel,
  onResetPin,
}: SecurityPinModalProps): React.JSX.Element {
  const [otpValue, setOtpValue] = useState<string>("");
  const [hasError, setHasError] = useState<boolean>(false);
  const [remainingLockoutTime, setRemainingLockoutTime] = useState<number>(0);

  const {
    failedAttempts,
    lockoutUntil,
    registerFailure,
    resetAttempts,
    isLockedOut,
  } = useSecurityStore();

  const locked = isLockedOut();

  useEffect(() => {
    if (!lockoutUntil) return;

    const updateCountdown = () => {
      const remaining = Math.max(
        0,
        Math.ceil((lockoutUntil - Date.now()) / 1000),
      );
      setRemainingLockoutTime(remaining);
      if (remaining === 0) {
        useSecurityStore.setState({ lockoutUntil: null });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [lockoutUntil]);

  const handleOtpChange = (value: string) => {
    if (locked) return;

    setOtpValue(value);
    setHasError(false);

    if (value.length === 4) {
      if (value === requiredPin) {
        resetAttempts();
        setOtpValue("");
        onDismiss();
      } else {
        registerFailure();
        setHasError(true);
        setTimeout(() => setOtpValue(""), 800);
      }
    }
  };

  const formatCountdown = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const remainingAttempts = MAX_ALLOWED_ATTEMPTS - failedAttempts;

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 flex flex-col items-center justify-center p-8 bg-background/60 backdrop-blur-2xl border-t border-border/50 rounded-t-[3rem] shadow-2xl transition-transform duration-500 ease-out",
        isOpen ? "translate-y-0" : "translate-y-full",
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col items-center space-y-5 max-w-sm w-full text-center">
        <div className="p-4 bg-primary/10 rounded-full">
          <Lock className="w-8 h-8 text-primary" />
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl font-semibold">Code de sécurité</h2>
          <p className="text-muted-foreground text-sm">
            {locked
              ? "Nombre maximal de tentatives atteint. Accès temporairement bloqué."
              : "Saisissez votre code à 4 chiffres pour reprendre la session."}
          </p>
        </div>

        {locked ? (
          <div className="p-4 rounded-xl w-full">
            <p className="text-sm font-medium">Veuillez patienter encore</p>
            <p className="text-3xl font-bold tracking-tight">
              {formatCountdown(remainingLockoutTime)}
            </p>
          </div>
        ) : (
          <>
            <InputOTP
              maxLength={4}
              pattern={REGEXP_ONLY_DIGITS}
              value={otpValue}
              onChange={handleOtpChange}
              autoFocus={isOpen}
              disabled={locked}
            >
              <InputOTPGroup
                className={hasError ? "animate-bounce text-destructive" : ""}
              >
                {Array.from({ length: 4 }).map((_, index) => (
                  <InputOTPSlot
                    key={index}
                    index={index}
                    className={cn(
                      "w-14 h-14 text-2xl",
                      hasError && "border-destructive text-destructive",
                    )}
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>

            {hasError && (
              <div className="space-y-1">
                <p className="text-sm text-destructive font-medium">
                  Code PIN incorrect
                </p>
                <p className="text-xs text-muted-foreground">
                  {remainingAttempts} tentative
                  {remainingAttempts > 1 ? "s" : ""} restante
                  {remainingAttempts > 1 ? "s" : ""}
                </p>
              </div>
            )}
          </>
        )}

        <div className="flex items-center gap-3 pt-2">
          {onResetPin && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-full gap-2"
              onClick={onResetPin}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Réinitialiser le PIN
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="rounded-full"
            onClick={() => {
              onClosePanel();
              setOtpValue("");
              setHasError(false);
            }}
          >
            Masquer
          </Button>
        </div>
      </div>
    </div>
  );
}

export interface ScreensaverProps {
  onDismiss: () => void;
  onResetPin?: () => void;
  requiredPin?: string;
}

/**
 * Main screensaver overlay handling visuals, key triggers, and backdrop interaction in French.
 * @param props - Screen saver event triggers and configuration.
 */
export function Screensaver({
  onDismiss,
  onResetPin,
  requiredPin,
}: ScreensaverProps): React.JSX.Element {
  const [isUnlocking, setIsUnlocking] = useState<boolean>(false);

  const toggleUnlockPanel = useCallback(() => {
    if (requiredPin) {
      setIsUnlocking((prev) => !prev);
    } else {
      onDismiss();
    }
  }, [requiredPin, onDismiss]);

  useEffect(() => {
    const handleKeyDown = () => {
      if (!isUnlocking) {
        toggleUnlockPanel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isUnlocking, toggleUnlockPanel]);

  return (
    <div
      onClick={toggleUnlockPanel}
      className="fixed inset-0 z-40 flex flex-col items-center justify-between bg-background/90 p-8 select-none transition-all duration-500 overflow-hidden cursor-pointer"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/30 rounded-full mix-blend-screen filter blur-[100px] opacity-70 animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-blue-500/30 rounded-full mix-blend-screen filter blur-[100px] opacity-70 animate-pulse" />
      </div>

      <div
        className="flex items-center gap-2 text-muted-foreground text-xs z-10 transition-opacity duration-300"
        style={{ opacity: isUnlocking ? 0 : 1 }}
      >
        <span>Mode Veille</span>
      </div>

      <div
        className="flex flex-col items-center text-center space-y-4 z-10 transition-transform duration-500"
        style={{
          transform: isUnlocking
            ? "translateY(-10vh) scale(0.9)"
            : "translateY(0) scale(1)",
        }}
      >
        <ClockDisplay />
        <p
          className={cn(
            "text-muted-foreground text-lg max-w-sm transition-opacity duration-300",
            isUnlocking ? "opacity-0" : "opacity-100",
          )}
        >
          {requiredPin
            ? "Touchez l'écran ou appuyez sur une touche pour déverrouiller."
            : "Bougez la souris ou touchez l'écran pour reprendre."}
        </p>
      </div>

      <div
        className={cn(
          "z-10 transition-opacity duration-300",
          isUnlocking ? "opacity-0 pointer-events-none" : "opacity-100",
        )}
      >
        <Button
          variant="outline"
          size="lg"
          className="rounded-full px-6 gap-2 shadow-lg hover:scale-105 transition-transform bg-background/50 backdrop-blur-md"
        >
          <Power className="h-4 w-4" />
          Déverrouiller
        </Button>
      </div>

      <SecurityPinModal
        isOpen={isUnlocking}
        requiredPin={requiredPin}
        onDismiss={onDismiss}
        onClosePanel={() => setIsUnlocking(false)}
        onResetPin={onResetPin}
      />
    </div>
  );
}

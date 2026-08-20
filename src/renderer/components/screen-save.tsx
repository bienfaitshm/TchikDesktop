"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Power, Lock } from "lucide-react";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { cn } from "../utils";

interface ScreensaverProps {
  onDismiss: () => void;
  requiredPin?: string;
}

export function Screensaver({ onDismiss, requiredPin }: ScreensaverProps) {
  const [time, setTime] = useState<string>("");
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [error, setError] = useState(false);

  // Horloge en temps réel
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Bascule (toggle) le panneau OTP
  const handleInteraction = useCallback(() => {
    if (requiredPin) {
      setIsUnlocking((prev) => {
        const nextState = !prev;
        if (!nextState) {
          // Réinitialise la saisie quand le panneau se masque
          setOtpValue("");
          setError(false);
        }
        return nextState;
      });
    } else {
      onDismiss();
    }
  }, [requiredPin, onDismiss]);

  // Raccourci clavier (Ouvre si fermé, ne ferme pas à la frappe)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isUnlocking) {
        handleInteraction();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isUnlocking, handleInteraction]);

  // Validation du code OTP
  const handleOtpChange = (value: string) => {
    setOtpValue(value);
    setError(false);

    if (value.length === 4) {
      if (value === requiredPin) {
        onDismiss();
      } else {
        setError(true);
        setTimeout(() => setOtpValue(""), 800);
      }
    }
  };

  return (
    <>
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animate-shake { animation: shake 0.4s ease-in-out; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>

      {/* Arrière-plan cliquable pour TOGGLE */}
      <div
        onClick={handleInteraction}
        className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-background/90 p-8 select-none transition-all duration-500 animate-in fade-in-0 overflow-hidden cursor-pointer"
      >
        {/* Blobs animés */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/30 rounded-full mix-blend-screen filter blur-[100px] opacity-70 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-blue-500/30 rounded-full mix-blend-screen filter blur-[100px] opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-pink-500/30 rounded-full mix-blend-screen filter blur-[100px] opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        {/* Indicateur haut */}
        <div
          className="flex items-center gap-2 text-muted-foreground text-xs z-10 transition-opacity duration-300"
          style={{ opacity: isUnlocking ? 0 : 1 }}
        >
          <span>Mode Veille</span>
        </div>

        {/* Zone centrale Heure */}
        <div
          className="flex flex-col items-center text-center space-y-4 z-10 transition-transform duration-500"
          style={{
            transform: isUnlocking
              ? "translateY(-10vh) scale(0.9)"
              : "translateY(0) scale(1)",
          }}
        >
          <h1 className="text-8xl font-extrabold tracking-tighter text-foreground drop-shadow-md sm:text-9xl">
            {time}
          </h1>
          <p
            className={cn(
              "text-muted-foreground text-lg max-w-sm transition-opacity duration-300",
              isUnlocking ? "opacity-0" : "opacity-100",
            )}
          >
            {requiredPin
              ? "Touchez l'écran pour afficher ou masquer le code."
              : "Bougez la souris ou touchez l'écran pour reprendre."}
          </p>
        </div>

        {/* Bouton du bas */}
        <div
          className={cn(
            "z-10 transition-opacity duration-300",
            isUnlocking ? "opacity-0 pointer-events-none" : "opacity-100",
          )}
        >
          <Button
            variant="outline"
            size="lg"
            className="rounded-full px-4 gap-2 shadow-lg hover:scale-105 transition-transform bg-background/50 backdrop-blur-md"
          >
            <Power className="h-4 w-4" />
            Déverrouiller
          </Button>
        </div>
      </div>

      {/* --- PANEL SLIDE-UP POUR LE CODE OTP --- */}
      <div
        className={`fixed inset-x-0 bottom-0 z-60 flex flex-col items-center justify-center p-12 bg-background/50 backdrop-blur-2xl border-t border-border/50 rounded-t-[3rem] shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isUnlocking ? "translate-y-0" : "translate-y-full"
        }`}
        onClick={(e) => e.stopPropagation()} // Bloque la propagation pour ne pas fermer au clic dans le panneau
      >
        <div className="flex flex-col items-center space-y-6 max-w-sm w-full">
          <div className="p-4 bg-primary/10 rounded-full">
            <Lock className="w-8 h-8 text-primary" />
          </div>

          <div className="text-center space-y-1">
            <h2 className="text-2xl font-semibold">Code de sécurité</h2>
            <p className="text-muted-foreground text-sm">
              Entrez votre code à 4 chiffres pour reprendre.
            </p>
          </div>

          <InputOTP
            maxLength={4}
            pattern={REGEXP_ONLY_DIGITS}
            value={otpValue}
            onChange={handleOtpChange}
            autoFocus={isUnlocking}
          >
            <InputOTPGroup
              className={error ? "animate-shake text-destructive" : ""}
            >
              <InputOTPSlot
                index={0}
                className={`w-14 h-14 text-2xl ${error ? "border-destructive text-destructive" : ""}`}
              />
              <InputOTPSlot
                index={1}
                className={`w-14 h-14 text-2xl ${error ? "border-destructive text-destructive" : ""}`}
              />
              <InputOTPSlot
                index={2}
                className={`w-14 h-14 text-2xl ${error ? "border-destructive text-destructive" : ""}`}
              />
              <InputOTPSlot
                index={3}
                className={`w-14 h-14 text-2xl ${error ? "border-destructive text-destructive" : ""}`}
              />
            </InputOTPGroup>
          </InputOTP>

          {error && (
            <p className="text-sm text-destructive font-medium animate-in fade-in-0">
              Code incorrect
            </p>
          )}

          <Button
            variant="ghost"
            className="mt-4 px-4 rounded-full"
            onClick={() => {
              setIsUnlocking(false);
              setOtpValue("");
              setError(false);
            }}
          >
            Masquer
          </Button>
        </div>
      </div>
    </>
  );
}

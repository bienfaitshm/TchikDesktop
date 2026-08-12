"use client";

import React, { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/renderer/utils";

// Définition propre de l'interface en omettant value/onChange natifs
interface InputSuggestionProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange"
> {
  suggestions: string[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function InputSuggestion({
  suggestions,
  value: externalValue,
  defaultValue = "",
  onValueChange,
  onChange,
  className,
  ...props
}: InputSuggestionProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const isControlled = externalValue !== undefined;
  const currentValue = isControlled ? externalValue : internalValue;

  // Recherche de la première correspondance (case-insensitive)
  const activeSuggestion =
    currentValue.length > 0
      ? suggestions.find((s) =>
          s.toLowerCase().startsWith(currentValue.toLowerCase()),
        ) || ""
      : "";

  // Suffixe à afficher en filigrane (ghost text)
  const suggestionSuffix = activeSuggestion
    ? activeSuggestion.slice(currentValue.length)
    : "";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (!isControlled) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
    onChange?.(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Validation par Tab OU Flèche Droite s'il y a une suggestion
    if ((e.key === "Tab" || e.key === "ArrowRight") && activeSuggestion) {
      e.preventDefault(); // Empêche le saut de focus ou le mouvement du curseur
      if (!isControlled) {
        setInternalValue(activeSuggestion);
      }
      onValueChange?.(activeSuggestion);
    }

    // Propagation des autres événements clavier
    props.onKeyDown?.(e);
  };

  // ID unique pour lier l'input à la zone d'aide (a11y)
  const helperId = React.useId();

  return (
    <div className="relative w-full flex flex-col gap-1.5">
      {/* Zone ARIA Live : Annonce la suggestion aux lecteurs d'écran sans l'afficher visuellement */}
      <span className="sr-only" aria-live="polite">
        {activeSuggestion ? `Suggestion disponible : ${activeSuggestion}` : ""}
      </span>

      <div className="relative flex items-center">
        {/* Layer filigrane (Ghost Text) : Calque visuel uniquement (aria-hidden) */}
        <div
          className="absolute inset-0 flex items-center px-3 text-sm pointer-events-none overflow-hidden whitespace-pre select-none"
          aria-hidden="true"
        >
          {/* Masque invisible pour aligner le suffixe exactement après le texte tapé */}
          <span className="opacity-0">{currentValue}</span>
          <span className="text-muted-foreground/40">{suggestionSuffix}</span>
        </div>

        <Input
          value={currentValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          // Utilisation de transparent pour le fond de l'input afin que le ghost text reste visible derrière
          className={cn("bg-transparent relative z-10", className)}
          // Lier l'input à la description d'aide
          aria-describedby={helperId}
          {...props}
        />
      </div>

      {/* Aide visuelle pour la découvrabilité (micro-copy) */}
      <p id={helperId} className="text-xs text-muted-foreground/70 px-1">
        Appuyez sur{" "}
        <kbd className="px-1.5 py-0.5 text-xs font-sans font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-md">
          Tab ↹
        </kbd>{" "}
        ou{" "}
        <kbd className="px-1.5 py-0.5 text-xs font-sans font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-md">
          →
        </kbd>{" "}
        pour valider la suggestion.
      </p>
    </div>
  );
}

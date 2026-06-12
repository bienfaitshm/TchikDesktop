"use client";

import * as React from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/renderer/components/ui/avatar";
import { cn } from "@/renderer/utils";

interface StudentAvatarProps {
  /** Nom complet de l'élève (ex: "Jean Dupont") */
  fullName?: string | null;
  /** URL optionnelle de l'image de l'élève */
  imageUrl?: string | null;
  /** Classes CSS additionnelles pour le conteneur Avatar */
  className?: string;
  /** Taille de l'avatar (par défaut: md) */
  size?: "sm" | "md" | "lg" | "xl";
}

/**
 * Génère un hash numérique simple à partir d'une chaîne de caractères.
 * Algorithme djb2 (rapide et bonne distribution).
 */
const hashCode = (str: string): number => {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) + hash + str.charCodeAt(i);
  }
  return hash;
};

/**
 * Retourne le degré de teinte (Hue) HSL déterministe basée sur le hash d'une chaîne.
 */
const getHslHue = (text: string): number => {
  if (!text) return 0;
  const hash = hashCode(text);
  return Math.abs(hash) % 360;
};

/**
 * Génère les initiales à partir d'un nom complet.
 */
const getInitials = (fullName: string | null | undefined): string => {
  if (!fullName?.trim()) return "??";

  const parts = fullName.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  const firstInitial = parts[0].charAt(0);
  const lastInitial = parts[parts.length - 1].charAt(0);

  return (firstInitial + lastInitial).toUpperCase();
};

export const StudentAvatar: React.FC<StudentAvatarProps> = ({
  fullName,
  imageUrl,
  className,
  size = "md",
}) => {
  const safeFullName = fullName?.trim() || "Élève Inconnu";

  const initials = React.useMemo(
    () => getInitials(safeFullName),
    [safeFullName],
  );
  const hue = React.useMemo(() => getHslHue(safeFullName), [safeFullName]);

  const sizeClasses = {
    sm: "size-7 text-[10px]",
    md: "size-9 text-xs",
    lg: "size-12 text-sm",
    xl: "size-16 text-base",
  };

  return (
    <Avatar
      data-slot="avatar"
      className={cn(
        "shrink-0 select-none shadow-xs border border-border/10",
        sizeClasses[size],
        className,
      )}
    >
      {imageUrl && (
        <AvatarImage
          src={imageUrl}
          alt={`Photo de ${safeFullName}`}
          className="object-cover"
        />
      )}

      <AvatarFallback
        style={{ "--avatar-hue": `${hue}deg` } as React.CSSProperties}
        className={cn(
          "font-semibold uppercase tracking-wider text-white",
          "bg-[hsl(var(--avatar-hue),65%,50%)] dark:bg-[hsl(var(--avatar-hue),60%,40%)]",
          "shadow-[inset_0_1px_2px_rgba(255,255,255,0.15)]",
          "text-shadow-sm",
        )}
        aria-label={safeFullName}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
};

StudentAvatar.displayName = "StudentAvatar";

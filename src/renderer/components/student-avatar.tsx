"use client"

import * as React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/renderer/components/ui/avatar"
import { cn } from "@/renderer/utils"


interface StudentAvatarProps {
    /** Nom complet de l'élève (ex: "Jean Dupont") */
    fullName?: string | null
    /** URL optionnelle de l'image de l'élève */
    imageUrl?: string | null
    /** Classes CSS additionnelles pour le conteneur Avatar */
    className?: string
    /** Taille de l'avatar (par défaut: h-9 w-9) */
    size?: "sm" | "md" | "lg" | "xl"
}


/**
 * Génère un hash numérique simple à partir d'une chaîne de caractères.
 * Algorithme djb2 (rapide et bonne distribution).
 */
const hashCode = (str: string): number => {
    let hash = 5381
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) + hash + str.charCodeAt(i)
    }
    return hash
}

/**
 * Retourne une couleur HSL déterministe basée sur le hash d'une chaîne.
 * On fixe la saturation et la luminosité pour garantir la lisibilité du texte blanc.
 */
const getHslColor = (text: string): string => {
    if (!text) return "hsl(var(--muted))"

    const hash = hashCode(text)
    const hue = Math.abs(hash) % 360
    return `hsl(${hue}, 65%, 55%)`
}

/**
 * Génère les initiales à partir d'un nom complet.
 * - 1 mot : les 2 premières lettres.
 * - 2 mots et plus : la première lettre du premier et du dernier mot.
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
    size = "md"
}) => {
    const safeFullName = fullName?.trim() || "Élève Inconnu"

    const initials = React.useMemo(() => getInitials(safeFullName), [safeFullName])
    const backgroundColor = React.useMemo(() => getHslColor(safeFullName), [safeFullName])

    const sizeClasses = {
        sm: "h-7 w-7 text-xs",
        md: "h-9 w-9 text-sm",
        lg: "h-12 w-12 text-base",
        xl: "h-16 w-16 text-xl",
    }

    return (
        <Avatar
            className={cn(
                "shrink-0 select-none shadow-inner",
                sizeClasses[size],
                className
            )}
        >
            {/* Si une image est fournie, on essaie de la charger */}
            {imageUrl && (
                <AvatarImage
                    src={imageUrl}
                    alt={`Photo de ${safeFullName}`}
                    className="object-cover"
                />
            )}

            {/* Fallback : Initiales sur fond coloré aléatoire/déterministe */}
            <AvatarFallback
                style={{ backgroundColor }}
                className={cn(
                    "font-bold text-sm uppercase tracking-wider text-white",
                    "drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]"
                )}
                aria-label={safeFullName}
            >
                {initials}
            </AvatarFallback>
        </Avatar>
    )
}

StudentAvatar.displayName = "StudentAvatar"
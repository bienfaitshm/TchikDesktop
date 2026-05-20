"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/renderer/utils"

interface LoadingSpinnerProps extends React.ComponentPropsWithoutRef<"svg"> {
    size?: number | string
    label?: string
}

/**
 * LoadingSpinner - Composant de chargement standardisé.
 * Utilise l'icône Loader2 de Lucide pour une animation fluide et moderne.
 */
export const LoadingSpinner = React.forwardRef<SVGSVGElement, LoadingSpinnerProps>(
    ({ className, size = 24, label = "Chargement...", ...props }, ref) => {
        return (
            <div role="status" className="flex items-center justify-center">
                <Loader2
                    ref={ref}
                    size={size}
                    className={cn("animate-spin text-muted-foreground", className)}
                    {...props}
                />
                <span className="sr-only">{label}</span>
            </div>
        )
    }
)

LoadingSpinner.displayName = "LoadingSpinner"
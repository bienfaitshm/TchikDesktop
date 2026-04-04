"use client"

import * as React from "react"
import { motion, HTMLMotionProps } from "framer-motion"
import { Eye, Pencil, Trash2, Copy, type LucideIcon } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/renderer/utils"

// --- Variants Definition (The Shadcn Way) ---

const actionTileVariants = cva(
    "group relative flex flex-col items-center justify-center p-4 gap-2.5 rounded-xl border border-border/50 bg-background text-center text-foreground transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "hover:border-primary/30 hover:bg-primary/5 hover:shadow-sm",
                warning: "hover:border-amber-300/50 hover:bg-amber-50 dark:hover:bg-amber-950/20",
                success: "hover:border-emerald-300/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/20",
                danger: "hover:border-red-300/50 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-700 dark:hover:text-red-400",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

const iconWrapperVariants = cva(
    "flex items-center justify-center p-2.5 rounded-lg transition-colors duration-200 bg-muted text-muted-foreground",
    {
        variants: {
            variant: {
                default: "group-hover:bg-primary/10 group-hover:text-primary",
                warning: "group-hover:bg-amber-100 group-hover:text-amber-600 dark:group-hover:bg-amber-900/40 dark:group-hover:text-amber-400",
                success: "group-hover:bg-emerald-100 group-hover:text-emerald-600 dark:group-hover:bg-emerald-900/40 dark:group-hover:text-emerald-400",
                danger: "group-hover:bg-red-100 group-hover:text-red-600 dark:group-hover:bg-red-900/40 dark:group-hover:text-red-400",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

// --- Components ---

export interface ActionTileProps
    extends Omit<HTMLMotionProps<"button">, "variant">,
    VariantProps<typeof actionTileVariants> {
    label: string
    description?: string
    icon: LucideIcon
}

const ActionTile = React.forwardRef<HTMLButtonElement, ActionTileProps>(
    ({ className, variant, label, description, icon: Icon, ...props }, ref) => {
        return (
            <motion.button
                ref={ref}
                type="button"
                whileTap={{ scale: 0.97 }}
                className={cn(actionTileVariants({ variant }), className)}
                {...props}
            >
                <div className={cn(iconWrapperVariants({ variant }))}>
                    <Icon className="h-5 w-5" strokeWidth={2.5} />
                </div>

                <div className="flex flex-col items-center gap-0.5">
                    <span className="text-sm font-semibold tracking-tight leading-none">
                        {label}
                    </span>
                    {description && (
                        <span className="hidden text-xs text-muted-foreground opacity-80 line-clamp-1 sm:block">
                            {description}
                        </span>
                    )}
                </div>
            </motion.button>
        )
    }
)
ActionTile.displayName = "ActionTile"

/**
 * ActionContainer: Un wrapper layout avec un typage sémantique
 */
interface ActionContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string
}

const ActionContainer = React.forwardRef<HTMLDivElement, ActionContainerProps>(
    ({ children, className, title, ...props }, ref) => {
        return (
            <div ref={ref} className={cn("w-full space-y-4 p-1", className)} {...props}>
                {title && (
                    <h3 className="px-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                        {title}
                    </h3>
                )}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {children}
                </div>
            </div>
        )
    }
)
ActionContainer.displayName = "ActionContainer"

// --- Preset Components (Clean & Typed) ---

export const ActionTileDetail = React.forwardRef<HTMLButtonElement, Partial<ActionTileProps>>((props, ref) => (
    <ActionTile
        ref={ref}
        label="Détails"
        description="Consulter les informations"
        icon={Eye}
        {...props}
    />
))
ActionTileDetail.displayName = "ActionTileDetail"

export const ActionTileEdit = React.forwardRef<HTMLButtonElement, Partial<ActionTileProps>>((props, ref) => (
    <ActionTile
        ref={ref}
        label="Modifier"
        description="Mettre à jour les données"
        icon={Pencil}
        {...props}
    />
))
ActionTileEdit.displayName = "ActionTileEdit"

export const ActionTileCopy = React.forwardRef<HTMLButtonElement, Partial<ActionTileProps>>((props, ref) => (
    <ActionTile
        ref={ref}
        label="Dupliquer"
        description="Créer une copie exacte"
        icon={Copy}
        {...props}
    />
))
ActionTileCopy.displayName = "ActionTileCopy"

export const ActionTileDelete = React.forwardRef<HTMLButtonElement, Partial<ActionTileProps>>((props, ref) => (
    <ActionTile
        ref={ref}
        label="Supprimer"
        description="Action irréversible"
        icon={Trash2}
        variant="danger"
        {...props}
    />
))
ActionTileDelete.displayName = "ActionTileDelete"

export { ActionTile, ActionContainer }
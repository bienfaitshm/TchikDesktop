import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Pencil, Trash2, Copy, LucideIcon } from 'lucide-react';
import { cn } from "@/renderer/utils";

export type ActionVariant = 'default' | 'danger' | 'success' | 'warning';

interface ActionTileProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    label: string;
    description?: string;
    icon: LucideIcon;
    variant?: ActionVariant;
}

const variantStyles: Record<ActionVariant, { wrapper: string; icon: string }> = {
    default: {
        wrapper: "hover:border-primary/30 hover:bg-primary/5 hover:shadow-sm",
        icon: "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary",
    },
    warning: {
        wrapper: "hover:border-amber-300/50 hover:bg-amber-50 hover:shadow-sm dark:hover:bg-amber-950/20",
        icon: "bg-muted text-muted-foreground group-hover:bg-amber-100 group-hover:text-amber-600 dark:group-hover:bg-amber-900/40 dark:group-hover:text-amber-400",
    },
    success: {
        wrapper: "hover:border-emerald-300/50 hover:bg-emerald-50 hover:shadow-sm dark:hover:bg-emerald-950/20",
        icon: "bg-muted text-muted-foreground group-hover:bg-emerald-100 group-hover:text-emerald-600 dark:group-hover:bg-emerald-900/40 dark:group-hover:text-emerald-400",
    },
    danger: {
        wrapper: "hover:border-red-300/50 hover:bg-red-50 hover:shadow-sm dark:hover:bg-red-950/20 hover:text-red-700 dark:hover:text-red-400",
        icon: "bg-muted text-muted-foreground group-hover:bg-red-100 group-hover:text-red-600 dark:group-hover:bg-red-900/40 dark:group-hover:text-red-400",
    },
};

export const ActionTile = React.forwardRef<HTMLButtonElement, ActionTileProps>(({
    label,
    description,
    icon: Icon,
    onClick,
    variant = 'default',
    className,
    ...props
}, ref) => {
    const { onDrag, onDragStart, onDragEnd, ...restProps } = props as any;

    return (
        <motion.button
            ref={ref}
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={onClick}
            className={cn(
                "group relative flex flex-col items-center justify-center p-4 gap-2.5",
                "rounded-xl border border-border/50 bg-background text-center text-foreground",
                "transition-all duration-200 ease-in-out",
                "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                variantStyles[variant].wrapper,
                className
            )}
            {...restProps}
        >
            {/* Pastille de l'icône */}
            <div className={cn(
                "flex items-center justify-center p-2.5 rounded-lg transition-colors duration-200",
                variantStyles[variant].icon
            )}>
                <Icon size={18} strokeWidth={2.5} />
            </div>

            {/* Textes */}
            <div className="flex flex-col items-center gap-0.5">
                <span className="text-sm font-medium tracking-tight">
                    {label}
                </span>
                {description && (
                    <span className="text-xs text-muted-foreground opacity-80 line-clamp-2 hidden sm:block">
                        {description}
                    </span>
                )}
            </div>
        </motion.button>
    );
});
ActionTile.displayName = "ActionTile";

interface ActionContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    title?: string;
}

export const ActionContainer = ({
    children,
    className,
    title,
    ...props
}: ActionContainerProps) => {
    return (
        <div
            className={cn(
                "w-full p-1 rounded-2xl",
                "flex flex-col gap-4",
            )}
            {...props}
        >
            {title && (
                <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70 px-1">
                    {title}
                </h3>
            )}

            <div className={cn("grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4", className)}>
                {children}
            </div>
        </div>
    );
};

// --- Composants Spécifiques ---

export const ActionTileDetail: React.FC<Partial<ActionTileProps>> = (props) => (
    <ActionTile
        label="Détails"
        description="Consulter les informations complètes"
        icon={Eye}
        {...props}
    />
);

export const ActionTileEdit: React.FC<Partial<ActionTileProps>> = (props) => (
    <ActionTile
        label="Modifier"
        description="Mettre à jour les données"
        icon={Pencil}
        {...props}
    />
);

export const ActionTileCopy: React.FC<Partial<ActionTileProps>> = (props) => (
    <ActionTile
        label="Dupliquer"
        description="Créer une copie exacte"
        icon={Copy}
        {...props}
    />
);

export const ActionTileDelete: React.FC<Partial<ActionTileProps>> = (props) => (
    <ActionTile
        label="Supprimer"
        description="Action irréversible"
        icon={Trash2}
        variant="danger"
        {...props}
    />
);
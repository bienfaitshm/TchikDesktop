import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from "@/renderer/utils";
import { Eye, Pencil, Trash2, Copy } from 'lucide-react';


export type ActionVariant = 'default' | 'danger' | 'success' | 'warning';

interface ActionTileProps {
    label: string;
    description?: string;
    icon: LucideIcon;
    onClick?: () => void;
    variant?: ActionVariant;
    className?: string;
}

const variantStyles: Record<ActionVariant, string> = {
    default: "hover:border-muted-foreground/20",
    warning: "hover:border-amber-200 hover:text-amber-700",
    success: "hover:border-emerald-200 hover:text-emerald-700",
    danger: "hover:border-red-200 hover:text-red-700",
};

export const ActionTile = React.forwardRef<HTMLButtonElement, ActionTileProps>(({
    label,
    description,
    icon: Icon,
    onClick,
    variant = 'default',
    className
}, ref) => {
    return (
        <motion.button
            ref={ref}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={cn(
                "flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 group text-center border border-muted-foreground/10",
                variantStyles[variant],
                className
            )}
        >
            <div className="mb-2 p-2 rounded-lg">
                <Icon size={20} strokeWidth={2} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
            {description && (
                <span className="text-[10px] opacity-60 leading-tight mt-1 hidden md:block">
                    {description}
                </span>
            )}
        </motion.button>
    );
});
ActionTile.displayName = "ActionTile"


interface ActionGridProps {
    children: React.ReactNode;
    className?: string;
    columns?: number;
}

export const ActionGrid = ({ children, className, columns = 4 }: ActionGridProps) => {
    return (
        <div className={cn(
            "grid gap-3 p-4",
            columns === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2",
            className
        )}>
            {children}
        </div>
    );
};



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
        description="Mettre à jour les données existantes"
        icon={Pencil}
        {...props}
    />
);

export const ActionTileCopy: React.FC<Partial<ActionTileProps>> = (props) => (
    <ActionTile
        label="Dupliquer"
        description="Créer une copie à partir de cet élément"
        icon={Copy}
        {...props}
    />
);

export const ActionTileDelete: React.FC<Partial<ActionTileProps>> = (props) => (
    <ActionTile
        label="Supprimer"
        description="Retirer définitivement cet élément"
        icon={Trash2}
        variant="danger"
        {...props}
    />
);


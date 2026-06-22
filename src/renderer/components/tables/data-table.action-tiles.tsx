import * as React from "react";
import { Eye, Pencil, Trash2, Copy, type LucideIcon } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/renderer/utils";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/renderer/components/ui/tooltip";

const actionButtonVariants = cva(
  "group flex h-9 w-9 items-center justify-center rounded-lg border border-border/50 bg-background text-muted-foreground transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "hover:border-primary/30 hover:bg-primary/5 hover:text-primary hover:shadow-sm",
        warning:
          "hover:border-amber-300/50 hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-950/20 dark:hover:text-amber-400",
        success:
          "hover:border-emerald-300/50 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/20 dark:hover:text-emerald-400",
        danger:
          "hover:border-red-300/50 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 dark:hover:text-red-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface ActionTileProps
  extends
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "variant">,
    VariantProps<typeof actionButtonVariants> {
  label: string;
  description?: string;
  icon: LucideIcon;
}

const ActionTile = React.forwardRef<HTMLButtonElement, ActionTileProps>(
  ({ className, variant, label, description, icon: Icon, ...props }, ref) => {
    return (
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <button
            ref={ref}
            type="button"
            className={cn(actionButtonVariants({ variant }), className)}
            {...props}
          >
            <Icon
              className="h-4 w-4 transition-transform group-hover:scale-105"
              strokeWidth={2}
            />
            <span className="sr-only">{label}</span>
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="flex flex-col gap-0.5 px-2.5 py-1.5 text-xs font-medium"
        >
          <span>{label}</span>
          {description && (
            <span className="text-[10px] font-normal">{description}</span>
          )}
        </TooltipContent>
      </Tooltip>
    );
  },
);
ActionTile.displayName = "ActionTile";

/**
 * ActionContainer: Un wrapper épuré pour aligner vos icônes (ex: une toolbar)
 */
interface ActionContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
}

const ActionContainer = React.forwardRef<HTMLDivElement, ActionContainerProps>(
  ({ children, className, title, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("w-full space-y-2 p-1")} {...props}>
        {title && (
          <h3 className="px-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            {title}
          </h3>
        )}
        <div className={cn("flex items-center gap-1.5 justify-end", className)}>
          {children}
        </div>
      </div>
    );
  },
);
ActionContainer.displayName = "ActionContainer";

export const ActionTileDetail = React.forwardRef<
  HTMLButtonElement,
  Partial<ActionTileProps>
>((props, ref) => (
  <ActionTile
    ref={ref}
    label="Détails"
    description="Consulter les informations"
    icon={Eye}
    {...props}
  />
));
ActionTileDetail.displayName = "ActionTileDetail";

export const ActionTileEdit = React.forwardRef<
  HTMLButtonElement,
  Partial<ActionTileProps>
>((props, ref) => (
  <ActionTile
    ref={ref}
    label="Modifier"
    description="Mettre à jour les données"
    icon={Pencil}
    {...props}
  />
));
ActionTileEdit.displayName = "ActionTileEdit";

export const ActionTileCopy = React.forwardRef<
  HTMLButtonElement,
  Partial<ActionTileProps>
>((props, ref) => (
  <ActionTile
    ref={ref}
    label="Dupliquer"
    description="Créer une copie exacte"
    icon={Copy}
    {...props}
  />
));
ActionTileCopy.displayName = "ActionTileCopy";

export const ActionTileDelete = React.forwardRef<
  HTMLButtonElement,
  Partial<ActionTileProps>
>((props, ref) => (
  <ActionTile
    ref={ref}
    label="Supprimer"
    description="Action irréversible"
    icon={Trash2}
    variant="danger"
    {...props}
  />
));
ActionTileDelete.displayName = "ActionTileDelete";

export { ActionTile, ActionContainer };

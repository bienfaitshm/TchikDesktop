"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/renderer/components/ui/select";
import { cn } from "@/renderer/utils";
import { STUDENT_STATUS_ENUM } from "@/packages/@core/data-access/db/enum";

/** * On définit les couleurs de manière constante pour la réutilisation
 */
const STATUS_INDICATORS: Record<string, string> = {
  [STUDENT_STATUS_ENUM.ACTIVE]:
    "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]",
  [STUDENT_STATUS_ENUM.DROPOUT]:
    "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]",
  [STUDENT_STATUS_ENUM.EXPELLED]:
    "bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.5)]",
};

export type StudentStatusOption = {
  value: string;
  label: string;
};

interface StudentStatusProps {
  value?: string;
  onChange?: (status: string) => void;
  disabled?: boolean;
  options?: StudentStatusOption[];
  className?: string;
}

/**
 * StudentStatus
 * Un sélecteur de statut avec indicateurs visuels colorés.
 */
export const StudentStatus = React.forwardRef<
  HTMLButtonElement,
  StudentStatusProps
>(({ onChange, value, options = [], disabled = false, className }, ref) => {
  return (
    <Select onValueChange={onChange} value={value ?? ""} disabled={disabled}>
      <SelectTrigger
        ref={ref}
        className={cn(
          "w-full h-10 transition-all hover:bg-muted/50 focus:ring-1",
          className,
        )}
        aria-label="Statut de l'élève"
      >
        <div className="flex items-center gap-2 truncate">
          {/* On affiche la pastille dans le bouton seulement si une valeur existe */}
          {value && (
            <span
              className={cn(
                "h-2 w-2 rounded-full shrink-0 transition-colors",
                STATUS_INDICATORS[value] || "bg-slate-300",
              )}
              aria-hidden="true"
            />
          )}
          <SelectValue placeholder="Sélectionner un statut..." />
        </div>
      </SelectTrigger>
      <SelectContent>
        {options.length > 0 ? (
          options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="cursor-pointer focus:bg-accent"
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "h-2 w-2 rounded-full shrink-0",
                    STATUS_INDICATORS[option.value] || "bg-slate-300",
                  )}
                  aria-hidden="true"
                />
                <span className="text-sm font-medium">{option.label}</span>
              </div>
            </SelectItem>
          ))
        ) : (
          <div className="p-4 text-center text-xs text-muted-foreground italic">
            Aucun statut disponible
          </div>
        )}
      </SelectContent>
    </Select>
  );
});

StudentStatus.displayName = "StudentStatus";

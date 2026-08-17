import * as React from "react";
import { InfoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  FEE_SCHEDULES_ENUM,
  FEE_SCHEDULES_OPTIONS,
} from "@/packages/@core/data-access/db/options";
import { cn } from "@/renderer/utils";

/**
 * Mapping of fee schedule statuses to their visual color indicator classes.
 */
export const STATUS_INDICATORS: Record<FEE_SCHEDULES_ENUM, string> = {
  [FEE_SCHEDULES_ENUM.PAID]: "bg-emerald-500 ring-emerald-500/20",
  [FEE_SCHEDULES_ENUM.UNPAID]: "bg-rose-500 ring-rose-500/20",
  [FEE_SCHEDULES_ENUM.PARTIALLY_PAID]: "bg-amber-500 ring-amber-500/20",
  [FEE_SCHEDULES_ENUM.EXEMPTED]: "bg-slate-400 ring-slate-400/20",
  [FEE_SCHEDULES_ENUM.OVERPAID]: "bg-indigo-500 ring-indigo-500/20",
};

/**
 * Popover component that displays a visual legend explaining payment status color indicators in French.
 * @returns The rendered payment colors legend popover element.
 */
export const PaymentColorsLegend: React.FC = () => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size="icon"
          variant="outline"
          aria-label="Voir la légende des couleurs de paiement"
        >
          <InfoIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-4">
        <PopoverHeader className="mb-3 space-y-1 pb-2 border-b">
          <PopoverTitle className="text-sm font-semibold">
            Légende des couleurs
          </PopoverTitle>
          <PopoverDescription className="text-xs text-muted-foreground">
            Signification des indicateurs de statut de paiement
          </PopoverDescription>
        </PopoverHeader>

        <ul className="flex flex-col gap-2">
          {FEE_SCHEDULES_OPTIONS.map((info) => (
            <li
              key={info.key}
              className="flex items-center justify-between text-xs font-medium py-1 px-1.5 rounded-md hover:bg-muted/50 transition-colors"
            >
              <span className="text-foreground">{info.label}</span>
              <div
                className={cn(
                  "size-2.5 rounded-full ring-2 ring-offset-1 ring-offset-background",
                  STATUS_INDICATORS[info.value],
                )}
                aria-hidden="true"
              />
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
};

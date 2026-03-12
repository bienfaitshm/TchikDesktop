"use client"

import * as React from "react";
import { forwardRef } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { Button } from "@/renderer/components/ui/button";
import { Calendar } from "@/renderer/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/renderer/components/ui/popover";
import { cn } from "@/renderer/utils";

export interface DateInputProps {
    value?: Date;
    name?: string;
    onChange?: (date?: Date) => void;
    className?: string;
    placeholder?: string;
    disabled?: boolean;
    /** Année minimale affichée dans le sélecteur (ex: 1950 pour les naissances) */
    fromYear?: number;
    /** Année maximale affichée (ex: 2050) */
    toYear?: number;
}

/**
 * DateInput Professionnel
 * Un sélecteur de date optimisé pour la saisie rapide et l'accessibilité.
 */
export const DateInput = forwardRef<HTMLButtonElement, DateInputProps>(
    ({
        name,
        value,
        onChange,
        className,
        placeholder = "Sélectionnez une date",
        disabled = false,
    }, ref) => {
        const [open, setOpen] = React.useState(false);

        const handleDateSelect = (date: Date | undefined) => {
            onChange?.(date);
            setOpen(false);
        };

        const displayDate = React.useMemo(() => {
            if (!value) return placeholder;
            return format(value, "dd MMMM yyyy", { locale: fr });
        }, [value, placeholder]);

        return (
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        ref={ref}
                        name={name}
                        type="button"
                        variant="outline"
                        disabled={disabled}
                        className={cn(
                            "w-full h-10 justify-between text-left font-normal transition-all",
                            "hover:bg-accent hover:text-accent-foreground focus:ring-2 focus:ring-primary/20",
                            !value && "text-muted-foreground",
                            className
                        )}
                        role="combobox"
                        aria-expanded={open}
                        aria-haspopup="dialog"
                        aria-label={value ? `Changer la date, actuellement : ${displayDate}` : placeholder}
                    >
                        <span className="truncate">{displayDate}</span>
                        <CalendarIcon className="ml-2 h-4 w-4 shrink-0 opacity-60" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="w-auto p-0 shadow-xl border-border"
                    align="start"
                    sideOffset={4}
                >
                    <Calendar
                        mode="single"
                        selected={value}
                        onSelect={handleDateSelect}
                        locale={fr}
                        className="p-3 pointer-events-auto"
                        captionLayout="dropdown-years"
                        classNames={{
                            day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                            day_today: "bg-accent text-accent-foreground font-bold",
                        }}
                    />
                </PopoverContent>
            </Popover>
        );
    }
);

DateInput.displayName = "DateInput";
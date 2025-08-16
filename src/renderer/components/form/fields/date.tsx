"use client"
// import { formatDate } from "@/commons/libs/times";

import * as React from "react";
import { forwardRef } from "react";
import { Calendar as CalendarIcon } from "lucide-react"; // Renommé pour éviter le conflit
import { format } from "date-fns"; // Utilisé pour formater les dates
import { fr } from "date-fns/locale"; // Pour le formatage en français

import { Button } from "@/renderer/components/ui/button";
import { Calendar } from "@/renderer/components/ui/calendar"; // Votre composant Calendar
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/renderer/components/ui/popover";
import { cn } from "@/renderer/utils"; // Assurez-vous d'avoir une fonction `cn` pour fusionner les classes Tailwind

/**
 * @typedef {Object} DateInputProps
 * @property {Date} [value] - La date sélectionnée.
 * @property {string} [name] - Le nom de l'input HTML.
 * @property {(date?: Date) => void} [onChange] - Fonction de rappel appelée lorsque la date change.
 * @property {string} [className] - Classes CSS additionnelles pour le bouton du sélecteur de date.
 * @property {string} [placeholder] - Texte affiché lorsque aucune date n'est sélectionnée.
 */
interface DateInputProps {
    value?: Date;
    name?: string;
    onChange?: (date?: Date) => void;
    className?: string; // Ajouté pour permettre des styles personnalisés sur le bouton
    placeholder?: string; // Ajouté pour un texte de remplacement personnalisable
}

/**
 * Composant de sélection de date basé sur un Popover et un Calendar.
 * Permet aux utilisateurs de choisir une date via une interface conviviale.
 *
 * @param {DateInputProps} props - Les propriétés du composant.
 * @param {React.ForwardedRef<HTMLButtonElement>} ref - La référence transmise au bouton déclencheur.
 * @returns {JSX.Element} Le composant DateInput.
 */
export const DateInput = forwardRef<HTMLButtonElement, DateInputProps>(
    ({ name, value, onChange, className, placeholder = "Sélectionnez une date" }, ref) => {
        const [open, setOpen] = React.useState(false);

        // Gère la sélection de la date et ferme le popover
        const handleDateSelect = (date: Date | undefined) => {
            onChange?.(date);
            setOpen(false); // Ferme le popover après la sélection
        };

        return (
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        ref={ref}
                        name={name}
                        variant="outline"
                        className={cn(
                            "w-full justify-between text-left font-normal", // `w-full` pour une meilleure flexibilité
                            !value && "text-muted-foreground", // Ajoute une couleur de texte si aucune date n'est sélectionnée
                            className // Applique les classes personnalisées
                        )}
                        aria-label={value ? `Date sélectionnée : ${format(value, "PPP", { locale: fr })}` : placeholder}
                    >
                        {value ? format(value, "PPP", { locale: fr }) : placeholder}
                        <CalendarIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={value}
                        onSelect={handleDateSelect}
                        locale={fr}
                        className="rounded-md border shadow-sm"
                        captionLayout="dropdown"
                    />
                </PopoverContent>
            </Popover>
        );
    }
);

DateInput.displayName = "DateInput";
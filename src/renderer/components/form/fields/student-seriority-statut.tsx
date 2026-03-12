import React, { useCallback, useMemo } from "react";
import {
    FormControl,
    FormDescription,
    FormItem,
    FormLabel,
} from "@/renderer/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/renderer/components/ui/radio-group";
import { cn } from "@/renderer/utils";
import { UserPlus, UserCheck } from "lucide-react"; // Icônes pour le sens sémantique

export interface StudentSeniorityStatusSelectProps {
    value?: boolean;
    onChangeValue?: (value: boolean) => void;
    disabled?: boolean;
}

const OPTIONS = [
    {
        value: "true",
        label: "Nouvel élève",
        description: "Première inscription dans cet établissement.",
        icon: UserPlus,
    },
    {
        value: "false",
        label: "Ancien élève",
        description: "Ré-inscription ou retour d'un élève connu.",
        icon: UserCheck,
    },
] as const;

/**
 * StudentSeniorityStatusSelect
 * Un sélecteur de statut sous forme de cartes interactives.
 */
export const StudentSeniorityStatusSelect: React.FC<StudentSeniorityStatusSelectProps> = ({
    onChangeValue,
    value,
    disabled = false
}) => {
    const handleValueChange = useCallback((val: string) => {
        onChangeValue?.(val === "true");
    }, [onChangeValue]);

    const stringValue = useMemo(() => (value === undefined ? undefined : String(value)), [value]);

    return (
        <RadioGroup
            onValueChange={handleValueChange}
            value={stringValue}
            disabled={disabled}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
            {OPTIONS.map((option) => {
                const isSelected = stringValue === option.value;
                const Icon = option.icon;

                return (
                    <FormItem key={option.value} className="space-y-0">
                        <FormLabel
                            htmlFor={option.value}
                            className={cn(
                                "relative flex flex-row items-start space-x-3 space-y-0 rounded-xl border p-4 cursor-pointer transition-all duration-200 outline-none",
                                "hover:bg-muted/40",
                                isSelected
                                    ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary"
                                    : "border-input bg-transparent",
                                disabled && "opacity-50 cursor-not-allowed grayscale"
                            )}
                        >
                            <FormControl>
                                <RadioGroupItem
                                    value={option.value}
                                    id={option.value}
                                    className="sr-only"
                                />
                            </FormControl>

                            <div className={cn(
                                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-colors",
                                isSelected ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground"
                            )}>
                                <Icon className="h-5 w-5" />
                            </div>

                            <div className="flex flex-col space-y-1 overflow-hidden">
                                <span className={cn(
                                    "font-bold leading-none tracking-tight text-sm",
                                    isSelected ? "text-primary" : "text-foreground"
                                )}>
                                    {option.label}
                                </span>
                                <FormDescription className="text-[11px] leading-snug line-clamp-2">
                                    {option.description}
                                </FormDescription>
                            </div>

                            {/* Indicateur visuel "Checked" en haut à droite */}
                            {isSelected && (
                                <div className="absolute right-2 top-2">
                                    <div className="rounded-full bg-primary p-0.5">
                                        <svg
                                            width="10"
                                            height="10"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="white"
                                            strokeWidth="4"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    </div>
                                </div>
                            )}
                        </FormLabel>
                    </FormItem>
                );
            })}
        </RadioGroup>
    );
};
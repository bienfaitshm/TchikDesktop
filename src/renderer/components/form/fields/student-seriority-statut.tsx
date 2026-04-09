"use client"

import * as React from "react"
import { UserPlus, UserCheck, Check } from "lucide-react"
import {
    FormControl,
    FormDescription,
    FormItem,
    FormLabel,
} from "@/renderer/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/renderer/components/ui/radio-group"
import { cn } from "@/renderer/utils"

export interface StudentSeniorityStatusSelectProps {
    value?: boolean
    onChangeValue?: (value: boolean) => void
    disabled?: boolean
    className?: string
}

const SENIORITY_OPTIONS = [
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
] as const

/**
 * StudentSeniorityStatusSelect
 * Composant de sélection sous forme de cartes interactives (Radio Group Custom).
 */
export const StudentSeniorityStatusSelect: React.FC<StudentSeniorityStatusSelectProps> = ({
    onChangeValue,
    value,
    disabled = false,
    className,
}) => {
    const stringValue = React.useMemo(() => {
        if (value === true) return "true"
        if (value === false) return "false"
        return undefined
    }, [value])

    const handleValueChange = React.useCallback(
        (val: string) => {
            onChangeValue?.(val === "true")
        },
        [onChangeValue]
    )

    return (
        <RadioGroup
            onValueChange={handleValueChange}
            value={stringValue}
            disabled={disabled}
            className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2", className)}
        >
            {SENIORITY_OPTIONS.map((option) => {
                const isSelected = stringValue === option.value
                const Icon = option.icon

                return (
                    <FormItem key={option.value} className="space-y-0">
                        {/* Le label sert de conteneur cliquable pour le RadioGroupItem caché */}
                        <FormLabel
                            className={cn(
                                "relative flex cursor-pointer flex-row items-start space-x-3 space-y-0 rounded-xl border p-4 transition-all duration-200",
                                "hover:bg-muted/50 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2",
                                isSelected
                                    ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary"
                                    : "border-input bg-background",
                                disabled && "pointer-events-none opacity-50 grayscale"
                            )}
                        >
                            <FormControl>
                                {/* sr-only cache l'input radio natif mais le laisse accessible */}
                                <RadioGroupItem
                                    value={option.value}
                                    id={option.value}
                                    className="sr-only"
                                />
                            </FormControl>

                            {/* Conteneur d'icône */}
                            <div
                                className={cn(
                                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-colors",
                                    isSelected
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-border bg-muted text-muted-foreground"
                                )}
                            >
                                <Icon className="h-5 w-5" />
                            </div>

                            {/* Textes */}
                            <div className="flex flex-col space-y-1 pr-4">
                                <span
                                    className={cn(
                                        "text-sm font-bold leading-none tracking-tight",
                                        isSelected ? "text-primary" : "text-foreground"
                                    )}
                                >
                                    {option.label}
                                </span>
                                <FormDescription className="text-[11px] leading-snug">
                                    {option.description}
                                </FormDescription>
                            </div>

                            {/* Indicateur visuel "Check" */}
                            {isSelected && (
                                <div className="absolute right-3 top-3 animate-in zoom-in duration-200">
                                    <div className="rounded-full bg-primary p-0.5 text-white">
                                        <Check className="h-3 w-3 stroke-" />
                                    </div>
                                </div>
                            )}
                        </FormLabel>
                    </FormItem>
                )
            })}
        </RadioGroup>
    )
}

StudentSeniorityStatusSelect.displayName = "StudentSeniorityStatusSelect"
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

export const StudentSeniorityStatusSelect: React.FC<StudentSeniorityStatusSelectProps> = ({
    onChangeValue,
    value,
    disabled = false,
    className,
}) => {
    const stringValue = value === true ? "true" : value === false ? "false" : undefined

    return (
        <RadioGroup
            onValueChange={(val) => onChangeValue?.(val === "true")}
            value={stringValue}
            disabled={disabled}
            className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2", className)}
            aria-label="Provenance de l'élève"
        >
            {SENIORITY_OPTIONS.map((option) => {
                const isSelected = stringValue === option.value
                const Icon = option.icon

                return (
                    <FormItem key={option.value} className="space-y-0">
                        <div className="relative flex">
                            <FormControl>
                                <RadioGroupItem
                                    value={option.value}
                                    id={`seniority-${option.value}`}
                                    className="peer sr-only"
                                />
                            </FormControl>

                            <FormLabel
                                htmlFor={`seniority-${option.value}`}
                                className={cn(
                                    "flex flex-1 cursor-pointer flex-row items-start gap-4 rounded-xl border-2 p-4 transition-all duration-200 outline-none",
                                    "hover:bg-muted/50",
                                    "peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2",
                                    isSelected
                                        ? "border-primary bg-primary/5 shadow-md"
                                        : "border-muted bg-background hover:border-muted-foreground/30",
                                    disabled && "cursor-not-allowed opacity-50 grayscale"
                                )}
                            >
                                {/* Icône décorative (aria-hidden car le texte suffit) */}
                                <div
                                    className={cn(
                                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border-2 transition-colors",
                                        isSelected
                                            ? "border-primary bg-primary text-primary-foreground shadow-inner"
                                            : "border-muted bg-muted/30 text-muted-foreground"
                                    )}
                                    aria-hidden="true"
                                >
                                    <Icon className="h-6 w-6" />
                                </div>

                                <div className="flex flex-col gap-1 pr-6">
                                    <span className={cn(
                                        "text-sm font-bold leading-tight tracking-tight",
                                        isSelected ? "text-primary" : "text-foreground"
                                    )}>
                                        {option.label}
                                    </span>
                                    <FormDescription className="text-xs leading-normal opacity-90">
                                        {option.description}
                                    </FormDescription>
                                </div>

                                {/* Indicateur visuel "Check" (Optionnel mais recommandé pour l'UX) */}
                                <div
                                    className={cn(
                                        "absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full border transition-all duration-300",
                                        isSelected
                                            ? "scale-110 border-primary bg-primary text-primary-foreground opacity-100"
                                            : "scale-75 border-muted bg-transparent opacity-0"
                                    )}
                                    aria-hidden="true"
                                >
                                    <Check className="h-3 w-3" strokeWidth={3} />
                                </div>
                            </FormLabel>
                        </div>
                    </FormItem>
                )
            })}
        </RadioGroup>
    )
}

StudentSeniorityStatusSelect.displayName = "StudentSeniorityStatusSelect"
"use client"

import * as React from "react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/renderer/components/ui/select"
import { FormControl } from "@/renderer/components/ui/form"

export type GenderOption = {
    value: string
    label: string
}

interface GenderInputProps {
    options?: GenderOption[]
    value?: string
    defaultValue?: string
    onChange?: (value: string) => void
    placeholder?: string
    disabled?: boolean
}

/**
 * GenderInput
 */
export const GenderInput = React.forwardRef<HTMLButtonElement, GenderInputProps>(
    ({ onChange, value, options = [], defaultValue, placeholder = "Sélectionner...", disabled }, ref) => {

        const currentValue = value ?? ""

        return (
            <Select
                onValueChange={onChange}
                value={currentValue}
                defaultValue={defaultValue}
                disabled={disabled}
            >
                <FormControl>
                    <SelectTrigger
                        ref={ref}
                        aria-label="Sélectionner une option"
                        className="w-full h-11"
                    >
                        <SelectValue placeholder={placeholder} />
                    </SelectTrigger>
                </FormControl>
                <SelectContent>
                    {options.length > 0 ? (
                        options.map((option) => (
                            <SelectItem
                                key={option.value}
                                value={option.value}
                                className="cursor-pointer"
                            >
                                {option.label}
                            </SelectItem>
                        ))
                    ) : (
                        <div className="p-2 text-sm text-muted-foreground text-center">
                            Aucune option disponible
                        </div>
                    )}
                </SelectContent>
            </Select>
        )
    }
)

GenderInput.displayName = "GenderInput"
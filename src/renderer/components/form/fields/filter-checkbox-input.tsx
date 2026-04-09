"use client"

import * as React from "react"
import { ChevronsUpDown, Check } from "lucide-react"
import { Button } from "@/renderer/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/renderer/components/ui/popover"
import { Checkbox } from "@/renderer/components/ui/checkbox"
import { Label } from "@/renderer/components/ui/label"
import { Input } from "@/renderer/components/ui/input"
import { cn } from "@/renderer/utils"
import { useFilterCheckBoxInput, type FilterOption } from "./filter-checkbox-input.utils"

export type FilterCheckboxInputProps = {
    name: string
    placeholder?: string
    options?: FilterOption[]
    value?: string[]
    onChangeValue?(values: string[]): void
    className?: string
}

export const FilterCheckboxInput: React.FC<FilterCheckboxInputProps> = ({
    options = [],
    name,
    value = [],
    placeholder = "Sélectionner...",
    onChangeValue,
    className
}) => {
    const {
        open,
        setOpen,
        searchTerm,
        setSearchTerm,
        filteredOptions,
        getButtonText,
        clearSelection,
        toggleAllFiltered,
        handleCheckedChange,
        areAllFilteredSelected,
        selectedSet
    } = useFilterCheckBoxInput({
        options,
        onChangeValue,
        placeholder,
        value,
        labelPlural: name
    })

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between font-normal h-9 px-3", className)}
                >
                    <span className="truncate text-xs font-medium">{getButtonText()}</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-[var(--radix-popover-trigger-width)] min-w-[280px] p-0 shadow-md"
                align="start"
            >
                {/* Barre de recherche */}
                <div className="flex items-center border-b p-2">
                    <Input
                        placeholder={`Filtrer par ${name.toLowerCase()}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-8 text-xs focus-visible:ring-1 border-none shadow-none"
                        autoFocus
                    />
                </div>

                {/* Liste des options */}
                <div
                    role="listbox"
                    className="max-h-[240px] overflow-y-auto p-1 scrollbar-thin"
                >
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option) => {
                            const isSelected = selectedSet.has(option.value)
                            const checkboxId = `filter-${name}-${option.value}`

                            return (
                                <div
                                    key={option.value}
                                    role="option"
                                    aria-selected={isSelected}
                                    className={cn(
                                        "flex items-center gap-2 px-2 py-1.5 rounded-sm transition-colors cursor-pointer select-none",
                                        isSelected ? "bg-accent/50 text-accent-foreground" : "hover:bg-muted"
                                    )}
                                    onClick={() => handleCheckedChange(!isSelected, option.value)}
                                >
                                    <Checkbox
                                        id={checkboxId}
                                        checked={isSelected}
                                        onCheckedChange={(checked) => handleCheckedChange(!!checked, option.value)}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    <Label
                                        htmlFor={checkboxId}
                                        className="flex-1 font-normal cursor-pointer text-xs leading-none"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {option.label}
                                    </Label>
                                    {isSelected && <Check className="h-3 w-3 text-primary" />}
                                </div>
                            )
                        })
                    ) : (
                        <div className="py-6 text-center text-xs text-muted-foreground italic">
                            Aucun résultat pour "{searchTerm}"
                        </div>
                    )}
                </div>

                {/* Actions de pied de page */}
                <div className="border-t bg-muted/20 p-2 grid grid-cols-2 gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        disabled={filteredOptions.length === 0}
                        className="h-7 text-[10px] uppercase tracking-wider font-bold"
                        onClick={(e) => {
                            e.preventDefault()
                            toggleAllFiltered()
                        }}
                    >
                        {areAllFilteredSelected ? "Tout décocher" : "Tout cocher"}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        disabled={value.length === 0}
                        className="h-7 text-[10px] uppercase tracking-wider font-bold text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                            e.preventDefault()
                            clearSelection()
                        }}
                    >
                        Effacer ({value.length})
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    )
}

FilterCheckboxInput.displayName = "FilterCheckboxInput"
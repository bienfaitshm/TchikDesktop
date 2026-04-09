"use client"

import * as React from "react"

export type FilterOption = {
    label: string
    value: string
    icon?: React.ComponentType<{ className?: string }>
}

export interface FilterCheckBoxInputParams {
    options: FilterOption[]
    value?: string[]
    onChangeValue?: (values: string[]) => void
    placeholder?: string
    labelPlural?: string
}

export function useFilterCheckBoxInput({
    options,
    value = [],
    onChangeValue,
    placeholder = "Sélectionner...",
    labelPlural = "éléments",
}: FilterCheckBoxInputParams) {
    const [open, setOpen] = React.useState(false)
    const [searchTerm, setSearchTerm] = React.useState("")

    const selectedSet = React.useMemo(() => new Set(value), [value])

    const filteredOptions = React.useMemo(() => {
        if (!searchTerm) return options
        const lowerTerm = searchTerm.toLowerCase()
        return options.filter((opt) =>
            opt.label.toLowerCase().includes(lowerTerm)
        )
    }, [options, searchTerm])

    const areAllFilteredSelected = React.useMemo(() => {
        if (filteredOptions.length === 0) return false
        return filteredOptions.every((opt) => selectedSet.has(opt.value))
    }, [filteredOptions, selectedSet])

    const handleCheckedChange = React.useCallback(
        (checked: boolean | "indeterminate", optionValue: string) => {
            const newValues = checked
                ? [...value, optionValue]
                : value.filter((val) => val !== optionValue)
            onChangeValue?.(newValues)
        },
        [value, onChangeValue]
    )

    const toggleAllFiltered = React.useCallback(() => {
        const filteredValues = filteredOptions.map((opt) => opt.value)

        if (areAllFilteredSelected) {
            // Désélectionner uniquement les éléments actuellement filtrés
            const newValues = value.filter(
                (v) => !filteredValues.includes(v)
            )
            onChangeValue?.(newValues)
        } else {
            // Ajouter les éléments filtrés manquants
            const merged = Array.from(new Set([...value, ...filteredValues]))
            onChangeValue?.(merged)
        }
    }, [filteredOptions, areAllFilteredSelected, value, onChangeValue])

    const clearSelection = React.useCallback(() => {
        onChangeValue?.([])
    }, [onChangeValue])

    const getButtonText = React.useCallback(() => {
        const count = value.length
        if (count === 0) return placeholder
        if (count === 1) {
            const label = options.find((opt) => opt.value === value[0])?.label
            return label ?? `1 sélectionné`
        }
        return `${count} ${labelPlural} sélectionnés`
    }, [value, options, placeholder, labelPlural])

    return {
        // États
        open,
        setOpen,
        searchTerm,
        setSearchTerm,
        filteredOptions,

        // Actions
        getButtonText,
        clearSelection,
        toggleAllFiltered,
        handleCheckedChange,

        // État de sélection
        areAllFilteredSelected,
        selectedSet
    }
}
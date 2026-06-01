"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Search, X } from "lucide-react"
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
import { useFilterCheckBoxInput, type FilterOption } from "./multi-select-input.utils"

export interface MultiSelectProps
  extends Omit<React.ComponentPropsWithoutRef<typeof Button>, "value" | "onChange"> {
  name: string
  placeholder?: string
  options?: FilterOption[]
  value?: string[]
  onChange?(values: string[]): void
  labelPlural?: string
}

const MultiSelect = React.forwardRef<HTMLButtonElement, MultiSelectProps>(
  ({
    options = [],
    name,
    value = [],
    placeholder = "Sélectionner...",
    onChange,
    className,
    labelPlural,
    ...props
  }, ref) => {
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
      onChange,
      placeholder,
      value,
      labelPlural: labelPlural || name
    })

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-haspopup="listbox"
            className={cn("w-full justify-between font-normal h-9 px-3", className)}
            {...props}
          >
            <span className="truncate text-xs font-medium text-left">
              {getButtonText()}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-(--radix-popover-trigger-width) min-w-[280px] p-0 shadow-md"
          align="start"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <div className="flex items-center px-3 border-b bg-background sticky top-0 z-10">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-40" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher..."
              className={cn(
                "flex w-full bg-transparent py-3 text-xs outline-hidden placeholder:text-xs placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
                "h-8 text-xs border-0 border-none shadow-none focus:ring-0 focus:outline-hidden focus-visible:ring-0 focus-visible:ring-offset-0"
              )}
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setSearchTerm("")}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          <div
            role="listbox"
            className="max-h-[240px] overflow-y-auto p-1 overflow-x-hidden"
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isSelected = selectedSet.has(option.value)
                const checkboxId = `select-${name}-${option.value}`

                return (
                  <div
                    key={option.value}
                    className={cn(
                      "group flex items-center space-x-2 px-2 py-1.5 rounded-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                      isSelected && "bg-accent/40"
                    )}
                  >
                    <Checkbox
                      id={checkboxId}
                      checked={isSelected}
                      onCheckedChange={(checked) => handleCheckedChange(!!checked, option.value)}
                    />
                    <Label
                      htmlFor={checkboxId}
                      className="flex-1 font-normal cursor-pointer text-xs py-0.5"
                    >
                      {option.label}
                    </Label>
                    {isSelected && <Check className="h-3 w-3 text-primary" />}
                  </div>
                )
              })
            ) : (
              <div className="py-6 text-center text-xs text-muted-foreground">
                Aucun résultat pour <span className="font-semibold italic">"{searchTerm}"</span>
              </div>
            )}
          </div>

          <div className="border-t bg-muted/30 p-2 flex items-center justify-between gap-2">
            <Button
              variant="default"
              size="sm"
              disabled={filteredOptions.length === 0}
              className="h-7 px-2 text-xs flex-1"
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
              className="h-7 px-2 text-xs flex-1 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={(e) => {
                e.preventDefault()
                clearSelection()
              }}
            >
              Réinitialiser ({value.length})
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    )
  }
)

MultiSelect.displayName = "MultiSelect"

export { MultiSelect }
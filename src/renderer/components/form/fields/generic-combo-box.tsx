"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/renderer/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/renderer/components/ui/popover"
import { Button } from "@/renderer/components/ui/button"
import { cn } from "@/renderer/utils"

export type ComboBoxOption<T = any> = {
    value: string
    label: string
    data?: T
}

type GenericComboBoxProps<T> = {
    id?: string
    options: ComboBoxOption<T>[]
    value?: string
    onChangeValue: (value: string) => void
    placeholder?: string
    searchPlaceholder?: string
    emptyMessage?: string
    className?: string
    contentClassName?: string
    renderTrigger?: (selected: ComboBoxOption<T> | undefined) => React.ReactNode
    renderItem?: (item: ComboBoxOption<T>, isSelected: boolean) => React.ReactNode
}


function GenericComboBoxInner<T>(
    {
        options = [],
        value,
        onChangeValue,
        placeholder = "Sélectionner...",
        searchPlaceholder = "Rechercher...",
        emptyMessage = "Aucun résultat.",
        className,
        contentClassName,
        renderTrigger,
        renderItem,
        id
    }: GenericComboBoxProps<T>,
    ref: React.ForwardedRef<HTMLButtonElement>
) {
    const [open, setOpen] = React.useState(false)

    const selectedOption = React.useMemo(() =>
        options.find((opt) => opt.value === value),
        [value, options])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    ref={ref}
                    id={id}
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between font-normal h-9 px-3", className)}
                >
                    <div className="flex-1 truncate text-left">
                        {renderTrigger ? (
                            renderTrigger(selectedOption)
                        ) : (
                            <span className={cn("text-xs font-medium", !selectedOption && "text-muted-foreground")}>
                                {selectedOption ? selectedOption.label : placeholder}
                            </span>
                        )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>

            <PopoverContent
                className={cn("w-(--radix-popover-trigger-width) min-w-[280px] p-0 shadow-md", contentClassName)}
                align="start"
            >
                <Command className="flex flex-col">
                    <CommandInput
                        placeholder={searchPlaceholder}
                        className="h-8 text-xs border-none focus-visible:ring-0 shadow-none"
                    />
                    <CommandList className="max-h-[240px] overflow-y-auto scrollbar-thin">
                        <CommandEmpty className="py-6 text-center text-xs text-muted-foreground italic">
                            {emptyMessage}
                        </CommandEmpty>
                        <CommandGroup className="p-1">
                            {options.map((item) => {
                                const isSelected = value === item.value
                                return (
                                    <CommandItem
                                        key={item.value}
                                        value={item.label}
                                        onSelect={() => {
                                            onChangeValue(item.value)
                                            setOpen(false)
                                        }}
                                        className={cn(
                                            "flex items-center gap-2 px-2 py-1.5 rounded-sm cursor-pointer text-xs",
                                            isSelected ? "bg-accent/50 text-accent-foreground" : ""
                                        )}
                                    >
                                        <div className="flex-1 truncate font-normal">
                                            {renderItem ? (
                                                renderItem(item, isSelected)
                                            ) : (
                                                item.label
                                            )}
                                        </div>
                                        {isSelected && <Check className="h-3 w-3 text-primary" />}
                                    </CommandItem>
                                )
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}

export const GenericComboBox = React.forwardRef(GenericComboBoxInner) as <T>(
    props: GenericComboBoxProps<T> & { ref?: React.ForwardedRef<HTMLButtonElement> }
) => React.ReactElement

(GenericComboBox as any).displayName = "GenericComboBox"
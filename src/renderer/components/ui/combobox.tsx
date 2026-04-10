"use client"

import * as React from "react"
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react"
import { useVirtualizer } from '@tanstack/react-virtual'
import { cn } from "@/renderer/utils"
import { Button } from "@/renderer/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/renderer/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/renderer/components/ui/popover"

interface ComboboxProps {
    classname?: string;
    placeholder?: string;
    searchPlaceholder?: string;
    value?: string;
    onChange?(value: string): void;
    options?: { value: string, label: string }[];
    disable?: boolean;
}

export const Combobox = React.forwardRef<HTMLButtonElement, ComboboxProps>(
    ({ value, onChange, placeholder, searchPlaceholder, options = [], classname, disable }, ref) => {
        const [open, setOpen] = React.useState(false)
        const [search, setSearch] = React.useState("")
        const parentRef = React.useRef<HTMLDivElement>(null)

        // 1. Filtrage manuel (indispensable pour la virtualisation)
        const filteredOptions = React.useMemo(() => {
            if (!search) return options;
            return options.filter((option) =>
                option.label.toLowerCase().includes(search.toLowerCase())
            );
        }, [options, search]);

        // 2. Configuration du virtualiseur
        const rowVirtualizer = useVirtualizer({
            count: filteredOptions.length,
            getScrollElement: () => parentRef.current,
            estimateSize: () => 35,
            overscan: 5,
        });

        const selectedLabel = React.useMemo(
            () => options.find((opt) => opt.value === value)?.label,
            [options, value]
        )

        const onSelect = React.useCallback((currentValue: string) => {
            onChange?.(currentValue)
            setOpen(false)
        }, [onChange])

        return (
            <Popover open={open} onOpenChange={setOpen} modal>
                <PopoverTrigger asChild>
                    <Button
                        ref={ref}
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between"
                        disabled={disable}
                    >
                        <span className="truncate">
                            {value ? selectedLabel : placeholder}
                        </span>
                        <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className={cn("w-[400px] p-0", classname)} align="start">
                    <Command shouldFilter={false}>
                        <CommandInput
                            placeholder={searchPlaceholder}
                            value={search}
                            onValueChange={setSearch}
                        />
                        <CommandList>
                            {filteredOptions.length === 0 && (
                                <CommandEmpty>Aucun élément trouvé.</CommandEmpty>
                            )}

                            {/* 3. Conteneur de virtualisation */}
                            <div
                                ref={parentRef}
                                className="h-[300px] overflow-y-auto overflow-x-hidden p-1"
                                style={{ contain: 'strict' }}
                            >
                                <div
                                    style={{
                                        height: `${rowVirtualizer.getTotalSize()}px`,
                                        width: '100%',
                                        position: 'relative',
                                    }}
                                >
                                    {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                                        const option = filteredOptions[virtualRow.index];
                                        return (
                                            <CommandItem
                                                key={option.value}
                                                value={option.label}
                                                onSelect={() => onSelect(option.value)}
                                                style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    width: '100%',
                                                    height: `${virtualRow.size}px`,
                                                    transform: `translateY(${virtualRow.start}px)`,
                                                }}
                                            >
                                                <CheckIcon
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        value === option.value ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                <span className="truncate">{option.label}</span>
                                            </CommandItem>
                                        );
                                    })}
                                </div>
                            </div>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        )
    }
)

Combobox.displayName = "Combobox"
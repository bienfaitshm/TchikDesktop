"use client"

import * as React from "react"
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react"

import { cn } from "@/renderer/utils"
import { Button } from "@/renderer/components/ui/button"
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


interface ComboboxProps {
    placeholder?: string;
    searchPlaceholder?: string;
    value?: string
    onChange?(value: string): void
    options?: { value: string, label: string }[]
}

export const Combobox: React.FC<ComboboxProps> = React.forwardRef<any, ComboboxProps>(({ value, onChange, placeholder, searchPlaceholder, options = [] }, ref) => {
    const [open, setOpen] = React.useState(false)
    const selectedValue = React.useMemo(() => options.find((framework) => framework.value === value)?.label, [options, value])
    const onSelect = React.useCallback((value: string) => {
        onChange?.(value)
        setOpen(false)
    }, [onChange])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    ref={ref}
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    {value
                        ? selectedValue
                        : placeholder}
                    <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0">
                <Command>
                    <CommandInput placeholder={searchPlaceholder} />
                    <CommandList>
                        <CommandEmpty>Aucun element trouvees!.</CommandEmpty>
                        <CommandGroup>
                            {options.map((framework) => (
                                <CommandItem
                                    key={framework.value}
                                    value={framework.value}
                                    onSelect={onSelect}
                                    accessKey={framework.value}
                                >
                                    <CheckIcon
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === framework.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {framework.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
})

Combobox.displayName = "Combobox"


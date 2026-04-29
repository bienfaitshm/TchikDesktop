import { useMemo, useState, ReactNode } from "react";
import { Check, ChevronDown } from "lucide-react";
import {
    Command,
    CommandEmpty,
    CommandInput,
    CommandList,
    CommandItem,
} from "@/renderer/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/renderer/components/ui/popover";
import { Button } from "@/renderer/components/ui/button";
import { cn } from "@/renderer/utils";

export type ComboBoxOption<T = any> = {
    value: string;
    label: string;
    data: T;
};



type GenericComboBoxProps<T> = {
    id?: string;
    options: ComboBoxOption<T>[];
    value: string;
    onChangeValue: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    className?: string;
    contentClassName?: string;
    renderTrigger?: (selected: ComboBoxOption<T> | undefined) => ReactNode;
    renderItem?: (item: ComboBoxOption<T>, isSelected: boolean) => ReactNode;
};

export function GenericComboBox<T>({
    options = [],
    value,
    onChangeValue,
    placeholder = "Sélectionner...",
    searchPlaceholder = "Rechercher...",
    emptyMessage = "Aucun résultat trouvé.",
    className,
    contentClassName = "w-[26rem]",
    renderTrigger,
    renderItem,
    id
}: GenericComboBoxProps<T>) {
    const [isOpen, setIsOpen] = useState(false);

    const selectedOption = useMemo(() => {
        const found = options.find((opt) => opt.value === value);
        if (found) return found;
        return undefined;
    }, [value, options]);

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    id={id}
                    variant="outline"
                    role="combobox"
                    aria-expanded={isOpen}
                    className={cn("w-full justify-between h-auto py-2 px-4 text-left", className)}
                >
                    {renderTrigger ? (
                        renderTrigger(selectedOption)
                    ) : (
                        <div className="flex flex-col items-start space-y-1">
                            <span className={cn("text-sm", !selectedOption && "text-muted-foreground")}>
                                {selectedOption ? selectedOption.label : placeholder}
                            </span>
                        </div>
                    )}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>

            <PopoverContent className={cn("p-0", contentClassName)}>
                <Command>
                    <CommandInput placeholder={searchPlaceholder} />
                    <CommandList>
                        <CommandEmpty>{emptyMessage}</CommandEmpty>
                        {options.map((item) => (

                            <CommandItem
                                key={item.value}
                                value={item.label}
                                onSelect={() => {
                                    onChangeValue(item.value);
                                    setIsOpen(false);
                                }}
                                className="gap-2"
                            >
                                <div className="flex-1">
                                    {renderItem ? (
                                        renderItem(item, value === item.value)
                                    ) : (
                                        <span className="text-sm">{item.label}</span>
                                    )}
                                </div>
                                <Check
                                    className={cn(
                                        'ml-auto h-4 w-4',
                                        value === item.value ? 'opacity-100' : 'opacity-0'
                                    )}
                                />
                            </CommandItem>
                        ))}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
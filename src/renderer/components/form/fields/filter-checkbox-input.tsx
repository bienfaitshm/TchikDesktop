import * as React from "react";
import { ChevronsUpDown, Check } from "lucide-react";
import { Button } from "@/renderer/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/renderer/components/ui/popover";
import { Checkbox } from "@/renderer/components/ui/checkbox";
import { Label } from "@/renderer/components/ui/label";
import { Input } from "@/renderer/components/ui/input";
import { cn } from "@/renderer/utils";

export type Option = {
    label: string;
    value: string;
};

export type FilterCheckboxInputProps = {
    name: string;
    placeholder?: string;
    options?: Option[];
    value?: string[];
    onChangeValue?(values: string[]): void;
    className?: string;
};

/**
 * FilterCheckboxInput
 * Un composant de filtrage robuste avec recherche intégrée et multi-sélection.
 */
export const FilterCheckboxInput: React.FC<FilterCheckboxInputProps> = ({
    options = [],
    name,
    value = [],
    placeholder = "Sélectionner...",
    onChangeValue,
    className
}) => {
    const [open, setOpen] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState("");

    const filteredOptions = React.useMemo(() => {
        const lowerTerm = searchTerm.toLowerCase();
        return options.filter((opt) => opt.label.toLowerCase().includes(lowerTerm));
    }, [options, searchTerm]);

    const areAllFilteredSelected = React.useMemo(() => {
        if (filteredOptions.length === 0) return false;
        return filteredOptions.every(opt => value.includes(opt.value));
    }, [filteredOptions, value]);

    const handleCheckedChange = React.useCallback(
        (checked: boolean, optionValue: string) => {
            const newValues = checked
                ? [...value, optionValue]
                : value.filter((val) => val !== optionValue);
            onChangeValue?.(newValues);
        },
        [value, onChangeValue]
    );

    const selectAllFiltered = (e: React.MouseEvent) => {
        e.preventDefault();
        const filteredValues = filteredOptions.map(opt => opt.value);
        const newValues = Array.from(new Set([...value, ...filteredValues]));
        onChangeValue?.(newValues);
    };

    const clearSelection = (e: React.MouseEvent) => {
        e.preventDefault();
        onChangeValue?.([]);
    };

    const getButtonText = () => {
        if (value.length === 0) return placeholder;
        if (value.length === 1) {
            const selected = options.find(opt => opt.value === value[0]);
            return selected ? selected.label : `1 ${name} sélectionné`;
        }
        return `${value.length} ${name}s sélectionnés`;
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    aria-haspopup="listbox"
                    className={cn("w-full justify-between font-normal h-9 px-3", className)}
                >
                    <span className="truncate text-xs font-medium">{getButtonText()}</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-[var(--radix-popover-trigger-width)] min-w-[280px] p-0 shadow-lg"
                align="start"
            >
                <div className="flex items-center border-b p-2">
                    <Input
                        placeholder={`Filtrer par ${name.toLowerCase()}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-8 text-xs ring-offset-transparent focus-visible:ring-1"
                        autoFocus
                    />
                </div>

                <div
                    role="listbox"
                    aria-multiselectable="true"
                    className="max-h-[240px] overflow-y-auto p-1 custom-scrollbar"
                >
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option) => {
                            const isSelected = value.includes(option.value);
                            const checkboxId = `filter-${name}-${option.value}`;
                            return (
                                <div
                                    key={option.value}
                                    className={cn(
                                        "flex items-center gap-2 px-2 py-1.5 rounded-sm transition-colors cursor-pointer",
                                        isSelected ? "bg-accent/50 text-accent-foreground" : "hover:bg-muted"
                                    )}
                                    onClick={() => handleCheckedChange(!isSelected, option.value)}
                                >
                                    <Checkbox
                                        id={checkboxId}
                                        checked={isSelected}
                                        onCheckedChange={(checked) => handleCheckedChange(!!checked, option.value)}
                                        onClick={(e) => e.stopPropagation()} // Évite le double toggle
                                    />
                                    <Label
                                        htmlFor={checkboxId}
                                        className="flex-1 font-normal cursor-pointer text-xs"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {option.label}
                                    </Label>
                                    {isSelected && <Check className="h-3 w-3 opacity-70" />}
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-6 text-center text-xs text-muted-foreground italic">
                            Aucun résultat pour "{searchTerm}"
                        </div>
                    )}
                </div>

                {(value.length > 0 || filteredOptions.length > 0) && (
                    <div className="border-t bg-muted/20 p-2 grid grid-cols-2 gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            disabled={areAllFilteredSelected || filteredOptions.length === 0}
                            className="h-7 text-[10px] uppercase tracking-wider font-bold"
                            onClick={selectAllFiltered}
                        >
                            Tout cocher
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            disabled={value.length === 0}
                            className="h-7 text-[10px] uppercase tracking-wider font-bold text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={clearSelection}
                        >
                            Effacer ({value.length})
                        </Button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
};
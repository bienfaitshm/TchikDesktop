import * as React from "react";
import { ChevronsUpDown, X } from "lucide-react";
import { Button } from "@/renderer/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/renderer/components/ui/popover";
import { Checkbox } from "@/renderer/components/ui/checkbox";
import { Label } from "@/renderer/components/ui/label";
import { Input } from "@/renderer/components/ui/input";

/**
 * @typedef {object} Option
 * @property {string} label - Le texte affiché pour l'option.
 * @property {string} value - La valeur unique associée à l'option.
 */
type Option = {
    label: string;
    value: string;
};

/**
 * @typedef {object} FilterCheckboxInputProps
 * @property {string} name - Le nom de la catégorie de filtre (ex: "statut", "type"). Utilisé pour l'affichage.
 * @property {string} [placeholder="Sélectionner..."] - Le texte affiché quand rien n'est sélectionné.
 * @property {Option[]} [options=[]] - Le tableau des options disponibles.
 * @property {string[]} [value=[]] - Le tableau des valeurs des options actuellement sélectionnées.
 * @property {(values: string[]) => void} [onChangeValue] - Fonction de rappel déclenchée lors d'un changement de sélection.
 */
type FilterCheckboxInputProps = {
    name: string;
    placeholder?: string;
    options?: Option[];
    value?: string[];
    onChangeValue?(values: string[]): void;
};

/**
 * Un composant de filtre multi-sélection réutilisable dans un popover.
 * Il permet aux utilisateurs de rechercher, sélectionner plusieurs options, tout sélectionner et tout désélectionner.
 *
 * @param {FilterCheckboxInputProps} props - Les props du composant.
 */
export const FilterCheckboxInput: React.FC<FilterCheckboxInputProps> = ({
    options = [],
    name,
    value = [],
    placeholder = "Sélectionner...",
    onChangeValue,
}) => {
    const [open, setOpen] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState("");


    const filteredOptions = React.useMemo(() => {
        if (!searchTerm) {
            return options;
        }
        return options.filter((option) =>
            option.label.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [options, searchTerm]);


    const areAllFilteredSelected = React.useMemo(() => {
        if (filteredOptions.length === 0) return false;
        return filteredOptions.every(opt => value.includes(opt.value));
    }, [filteredOptions, value]);

    /**
     * Gère le changement d'état d'une case à cocher.
     */
    const handleCheckedChange = React.useCallback(
        (checked: boolean, optionValue: string) => {
            const newValues = checked
                ? [...value, optionValue]
                : value.filter((val) => val !== optionValue);
            onChangeValue?.(newValues);
        },
        [value, onChangeValue]
    );

    /**
     * Sélectionne toutes les options actuellement visibles (filtrées).
     */
    const selectAllFiltered = (e: React.MouseEvent) => {
        e.stopPropagation();
        const filteredValues = filteredOptions.map(opt => opt.value);
        const newValues = [...new Set([...value, ...filteredValues])];
        onChangeValue?.(newValues);
    };

    /**
     * Réinitialise la sélection.
     */
    const clearSelection = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChangeValue?.([]);
    };

    /**
     * Génère le texte pour le bouton de déclenchement en fonction de la sélection.
     */
    const getButtonText = () => {
        if (value.length === 0) {
            return placeholder;
        }
        if (value.length === 1) {
            const selectedOption = options.find(opt => opt.value === value[0]);
            return selectedOption ? selectedOption.label : `1 ${name} sélectionné`;
        }
        return `${value.length} ${name}s sélectionné(e)s`;
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between font-normal"
                >
                    <span className="truncate pr-2 text-xs">{getButtonText()}</span>
                    <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full min-w-[320px] p-0">
                <div className="p-2">
                    <Input
                        placeholder="Rechercher..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-7"
                    />
                </div>

                <div className="max-h-[200px] overflow-y-auto p-1">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option) => {
                            const checkboxId = `filter-${name}-${option.value}`;
                            return (
                                <div
                                    key={option.value}
                                    className="flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    <Checkbox
                                        id={checkboxId}
                                        checked={value.includes(option.value)}
                                        onCheckedChange={(checked) => {
                                            handleCheckedChange(!!checked, option.value);
                                        }}
                                    />
                                    <Label htmlFor={checkboxId} className="w-full font-normal cursor-pointer">
                                        {option.label}
                                    </Label>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-center text-sm text-gray-500 py-4">
                            Aucun résultat trouvé.
                        </p>
                    )}
                </div>

                {/* Affiche les actions si des options sont sélectionnées OU si toutes les options filtrées ne le sont pas */}
                {(value.length > 0 || (!areAllFilteredSelected && filteredOptions.length > 0)) && (
                    <div className="border-t border-gray-200 dark:border-gray-700 p-2 flex items-center gap-2">
                        {!areAllFilteredSelected && filteredOptions.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-center h-8 text-xs"
                                onClick={selectAllFiltered}
                            >
                                Tout sélectionner
                            </Button>
                        )}
                        {value.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-center h-8 text-red-500 hover:text-red-600 text-xs"
                                onClick={clearSelection}
                            >
                                <X className="mr-1 h-4 w-4" />
                                Tout désélectionner
                            </Button>
                        )}
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
};

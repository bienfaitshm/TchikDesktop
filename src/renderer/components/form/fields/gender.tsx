import { GENDER_OPTIONS, USER_GENDER } from "@/packages/@core/data-access/db";
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/renderer/components/ui/select";
import { FormControl } from "@/renderer/components/ui/form";

/**
 * @interface GenderInputProps
 * @property {USER_GENDER} [value] - La valeur actuelle du genre.
 * @property {(gender: USER_GENDER) => void} [onChange] - Callback déclenché lors du changement.
 */
type GenderInputProps = {
    value?: USER_GENDER;
    onChange?(gender: USER_GENDER): void;
};

/**
 * Composant GenderInput
 * Utilise Radix UI Select pour une accessibilité native complète.
 */
export const GenderInput = React.forwardRef<HTMLButtonElement, GenderInputProps>(
    ({ onChange, value }, ref) => {
        return (
            <Select
                onValueChange={onChange}
                value={value}
                defaultValue={USER_GENDER.MALE}
            >
                <FormControl>
                    <SelectTrigger
                        ref={ref}
                        aria-label="Sélectionner le sexe"
                        className="w-full h-11"
                    >
                        <SelectValue placeholder="Sélectionner le sexe..." />
                    </SelectTrigger>
                </FormControl>
                <SelectContent>
                    {GENDER_OPTIONS.map((option) => (
                        <SelectItem
                            key={option.value}
                            value={option.value}
                            className="cursor-pointer"
                        >
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        );
    }
);

GenderInput.displayName = "GenderInput";
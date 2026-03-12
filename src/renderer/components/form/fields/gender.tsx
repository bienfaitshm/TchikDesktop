import { USER_GENDER, USER_GENDER_TRANSLATIONS } from "@/packages/@core/data-access/db";
import { getEnumKeyValueList } from "@/renderer/utils";
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/renderer/components/ui/select";
import { FormControl } from "@/renderer/components/ui/form";

const GENDER_OPTIONS = getEnumKeyValueList(USER_GENDER, USER_GENDER_TRANSLATIONS);


type GenderInputProps = {
    value?: USER_GENDER,
    onChange?(gender: USER_GENDER): void
}
export const GenderInput = React.forwardRef<any, GenderInputProps>(({ onChange, value = USER_GENDER.MALE }, ref) => {
    return (
        <Select onValueChange={onChange} defaultValue={value} value={value}>
            <FormControl>
                <SelectTrigger>
                    <SelectValue ref={ref} placeholder="Sélectionner le sexe ici..." />
                </SelectTrigger>
            </FormControl>
            <SelectContent>
                {GENDER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
})

GenderInput.displayName = "GenderInput"
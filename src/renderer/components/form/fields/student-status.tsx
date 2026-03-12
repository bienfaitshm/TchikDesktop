import { STUDENT_STATUS, STUDENT_STATUS_TRANSLATIONS } from "@/packages/@core/data-access/db";
import { getEnumKeyValueList } from "@/renderer/utils";
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/renderer/components/ui/select";
import { FormControl } from "@/renderer/components/ui/form";

const STATUS_OPTIONS = getEnumKeyValueList(STUDENT_STATUS, STUDENT_STATUS_TRANSLATIONS);


type StudentStatusProps = {
    value?: STUDENT_STATUS,
    onChange?(gender: STUDENT_STATUS): void
}
export const StudentStatus = React.forwardRef<any, StudentStatusProps>(({ onChange, value = STUDENT_STATUS.EN_COURS }, ref) => {
    return (
        <Select onValueChange={onChange} defaultValue={value}>
            <FormControl>
                <SelectTrigger>
                    <SelectValue ref={ref} placeholder="Sélectionner le statut ici..." />
                </SelectTrigger>
            </FormControl>
            <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
})

StudentStatus.displayName = "StudentStatus"
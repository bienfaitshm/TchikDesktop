import { STUDENT_STATUS, STUDENT_STATUS_OPTIONS } from "@/packages/@core/data-access/db";
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/renderer/components/ui/select";
import { FormControl } from "@/renderer/components/ui/form";
import { cn } from "@/renderer/utils";

const STATUS_COLORS: Record<string, string> = {
    [STUDENT_STATUS.EN_COURS]: "bg-blue-500",
    [STUDENT_STATUS.ABANDON]: "bg-amber-500",
    [STUDENT_STATUS.EXCLUT]: "bg-red-500",
    // [STUDENT_STATUS.TRANSFERE]: "bg-purple-500",
    // [STUDENT_STATUS.REUSSI]: "bg-green-500",
};

type StudentStatusProps = {
    value?: STUDENT_STATUS;
    onChange?(status: STUDENT_STATUS): void;
    disabled?: boolean;
};

export const StudentStatus = React.forwardRef<HTMLButtonElement, StudentStatusProps>(
    ({ onChange, value, disabled = false }, ref) => {
        return (
            <Select
                onValueChange={onChange}
                value={value}
                disabled={disabled}
            >
                <FormControl>
                    <SelectTrigger
                        ref={ref}
                        className="w-full h-10 transition-all hover:bg-muted/50"
                        aria-label="Changer le statut de l'élève"
                    >
                        <SelectValue placeholder="Sélectionner un statut..." />
                    </SelectTrigger>
                </FormControl>
                <SelectContent>
                    {STUDENT_STATUS_OPTIONS.map((option) => (
                        <SelectItem
                            key={option.value}
                            value={option.value}
                            className="cursor-pointer focus:bg-accent"
                        >
                            <div className="flex items-center gap-2">
                                {/* Pastille de couleur sémantique */}
                                <span
                                    className={cn(
                                        "h-2 w-2 rounded-full shrink-0",
                                        STATUS_COLORS[option.value] || "bg-slate-300"
                                    )}
                                    aria-hidden="true"
                                />
                                <span className="text-sm">{option.label}</span>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        );
    }
);

StudentStatus.displayName = "StudentStatus";
import { useCallback, useMemo } from "react";
import {
    FormControl,
    FormDescription,
    FormItem,
    FormLabel,
} from "@/renderer/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/renderer/components/ui/radio-group";
import { cn } from "@/renderer/utils";

// --- Types ---
/**
 * Props pour le composant StudentTimeStatus.
 */
interface StudentSeniorityStatusSelectProps {
    value?: boolean;
    onChangeValue?: (value: boolean) => void;
}

// --- Constants ---
const OPTIONS = [
    {
        value: true,
        label: "Nouvel élève",
        description: "L'élève n'a jamais été inscrit dans cette école.",
    },
    {
        value: false,
        label: "Ancien élève",
        description: "L'élève a déjà été inscrit dans cette école.",
    },
];

// --- Composant Principal ---
export const StudentSeniorityStatusSelect: React.FC<StudentSeniorityStatusSelectProps> = ({ onChangeValue, value }) => {
    const handleValueChange = useCallback((newValue: string) => {
        onChangeValue?.(newValue === "true");
    }, [onChangeValue]);

    const selectedValue = useMemo(() => (value ? "true" : "false"), [value]);

    return (
        <RadioGroup
            onValueChange={handleValueChange}
            value={selectedValue}
            className="grid grid-cols-2 gap-4"
        >
            {OPTIONS.map((option) => (
                <FormItem
                    key={String(option.value)}
                    className={cn(
                        "flex items-center rounded-lg border p-4 cursor-pointer hover:bg-muted/50 transition-colors",
                        selectedValue === String(option.value) && "border-primary ring-2 ring-primary/50"
                    )}
                >
                    <FormControl className="mr-3">
                        <RadioGroupItem value={String(option.value)} id={`radio-${String(option.value)}`} />
                    </FormControl>
                    <div className="space-y-1">
                        <FormLabel
                            className="font-semibold text-xs cursor-pointer"
                            htmlFor={`radio-${String(option.value)}`}
                        >
                            {option.label}
                        </FormLabel>
                        <FormDescription className="text-xs">
                            {option.description}
                        </FormDescription>
                    </div>
                </FormItem>
            ))}
        </RadioGroup>
    );
};
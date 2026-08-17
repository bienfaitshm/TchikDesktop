"use client";

import * as React from "react";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

export interface InputSuggestionProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange"
> {
  suggestions: string[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const InputSuggestion = React.forwardRef<
  HTMLInputElement,
  InputSuggestionProps
>(
  (
    {
      suggestions,
      value: externalValue,
      defaultValue = "",
      onValueChange,
      onChange,
      className,
      placeholder,
      ...props
    },
    ref,
  ) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const isControlled = externalValue !== undefined;
    const currentValue = isControlled ? externalValue : internalValue;

    // FIX TYPESCRIPT : On accepte string | null depuis le Combobox
    const handleValueChange = (newValue: string | null) => {
      const formattedValue = newValue ?? ""; // Convertit null en "" si désélectionné

      if (!isControlled) {
        setInternalValue(formattedValue);
      }
      onValueChange?.(formattedValue);
    };

    return (
      <Combobox
        items={suggestions}
        value={currentValue}
        onValueChange={handleValueChange}
      >
        <ComboboxInput
          ref={ref}
          placeholder={placeholder}
          className={className}
          onChange={onChange}
          {...props}
        />
        <ComboboxContent className="bg-background border shadow-sm ring-0">
          <ComboboxEmpty>Aucun résultat trouvé.</ComboboxEmpty>
          <ComboboxList>
            {(item: string) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    );
  },
);

InputSuggestion.displayName = "InputSuggestion";

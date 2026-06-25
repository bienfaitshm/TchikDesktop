import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/renderer/components/ui/select";
import { cn } from "@/renderer/utils";
import React from "react";

export type SelectInputProps = {
  options?: { label: string; value: string }[];
  placeholder?: string;
  className?: string;
  value?: string;
  onChange?(value: string): void;
  name?: string;
};

export const SelectInput: React.FC<SelectInputProps> = ({
  options = [],
  placeholder,
  className,
  name,
  onChange,
  value,
}) => {
  return (
    <Select name={name} value={value} onValueChange={onChange}>
      <SelectTrigger
        aria-label={placeholder}
        className={cn("w-full", className)}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

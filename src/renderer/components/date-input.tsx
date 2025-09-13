"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";
import { format } from "date-fns"; // Import format for consistent date display

import { Button } from "@/renderer/components/ui/button";
import { Calendar } from "@/renderer/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/renderer/components/ui/popover";

/**
 * @interface DatePickerInputProps
 * @description Defines the props for the `DatePickerInput` component.
 * @property {string} [placeholder="Sélectionner une date"] - The placeholder text displayed when no date is selected.
 * @property {Date} [value] - The currently selected date. This makes the component a controlled component.
 * @property {(value: Date | undefined) => void} [onChange] - Callback function invoked when a new date is selected.
 * It receives the selected `Date` object or `undefined` if the selection is cleared.
 */
export interface DatePickerInputProps {
  placeholder?: string;
  value?: Date;
  onChange?: (value: Date | undefined) => void;
}

/**
 * @component DatePickerInput
 * @description A reusable date picker component that integrates a calendar within a popover.
 * It provides a clean UI for selecting dates, with support for controlled component behavior
 * and customizable placeholder text.
 * @param {DatePickerInputProps} props - The props for the component.
 * @returns {JSX.Element} The rendered date picker input.
 *
 * @example
 * ```tsx
 * import React from "react";
 * import { DatePickerInput } from './path/to/this/file'; // Adjust path as needed
 *
 * function MyForm() {
 * const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(undefined);
 *
 * return (
 * <div className="p-4">
 * <h3 className="text-lg font-semibold mb-4">Choose a Date</h3>
 * <DatePickerInput
 * value={selectedDate}
 * onChange={setSelectedDate}
 * placeholder="Date de naissance"
 * />
 * <p className="mt-4">
 * Selected Date: {selectedDate ? selectedDate.toLocaleDateString('fr-FR') : 'None'}
 * </p>
 * </div>
 * );
 * }
 * ```
 */
export const DatePickerInput: React.FC<DatePickerInputProps> = ({
  placeholder = "Sélectionner une date", // Professional French placeholder
  onChange,
  value,
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          id="date-picker-trigger"
          className="justify-between font-normal w-full"
        >
          {/* Display formatted date or placeholder */}
          {value ? format(value, "PPP") : placeholder}
          <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          captionLayout="dropdown" // Allows month/year dropdowns
          onSelect={(date) => {
            onChange?.(date);
            setIsPopoverOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
};
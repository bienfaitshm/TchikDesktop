"use client";

import * as React from "react";
import { forwardRef } from "react";
import { cn } from "@/renderer/utils";
import { Input } from "../../ui/input";

/**
 * Interface properties for the DateInput component.
 */
export interface DateInputProps {
  /** Selected date value. */
  value?: Date;
  /** Form input name attribute. */
  name?: string;
  /** Callback invoked when the date value changes. */
  onChange?: (date?: Date) => void;
  /** Optional custom CSS class names. */
  className?: string;
  /** Input placeholder text. */
  placeholder?: string;
  /** Disables input interactions when set to true. */
  disabled?: boolean;
  /** Minimum selectable year (e.g., 1950). */
  fromYear?: number;
  /** Maximum selectable year (e.g., 2050). */
  toYear?: number;
}

/**
 * Formats a Date object to a local YYYY-MM-DD string for HTML date inputs.
 * @param date - The Date object to format.
 * @returns Formatted date string or an empty string if invalid.
 */
const formatDateToInputValue = (date?: Date): string => {
  if (!date || isNaN(date.getTime())) {
    return "";
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Parses a YYYY-MM-DD string into a local Date object.
 * @param dateString - The raw YYYY-MM-DD string from input event.
 * @returns Local Date object or undefined if string is empty or invalid.
 */
const parseInputValueToDate = (dateString: string): Date | undefined => {
  if (!dateString) {
    return undefined;
  }
  const [year, month, day] = dateString.split("-").map(Number);
  if (!year || !month || !day) {
    return undefined;
  }
  const parsedDate = new Date(year, month - 1, day);
  return isNaN(parsedDate.getTime()) ? undefined : parsedDate;
};

/**
 * Accessible, Shadcn-themed native date input component supporting Date objects.
 * @param props - Configuration properties for the date input.
 * @param ref - Forwarded reference targeting the underlying HTMLInputElement.
 * @returns Controlled HTMLInputElement wrapped in Shadcn Input.
 */
export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  (
    {
      name,
      value,
      onChange,
      className,
      placeholder = "Select a date",
      disabled = false,
      fromYear,
      toYear,
    },
    ref,
  ) => {
    const minDate = fromYear ? `${fromYear}-01-01` : undefined;
    const maxDate = toYear ? `${toYear}-12-31` : undefined;

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(parseInputValueToDate(event.target.value));
    };

    return (
      <Input
        ref={ref}
        type="date"
        name={name}
        value={formatDateToInputValue(value)}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        min={minDate}
        max={maxDate}
        className={cn(
          "dark:scheme-dark [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-70 hover:[&::-webkit-calendar-picker-indicator]:opacity-100",
          className,
        )}
        autoComplete="bday"
      />
    );
  },
);

DateInput.displayName = "DateInput";

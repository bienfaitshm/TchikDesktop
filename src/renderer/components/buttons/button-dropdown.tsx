"use client";

import React, { useState, useCallback } from "react";
import { Check, ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";

type ButtonProps = React.ComponentProps<typeof Button>;

/**
 * Represents a single item selectable within the dropdown menu.
 */
export interface DropdownOption {
  /** Display label for the option. */
  label: string;
  /** Unique value attached to the option. */
  value: string | null;
  /** Optional component for rendering an icon beside the label. */
  icon?: React.ComponentType<{ className?: string }>;
  /** Disables interaction with this specific option. */
  disabled?: boolean;
}

/**
 * Configuration properties for the ButtonDropdown component.
 */
export interface ButtonDropdownProps {
  /** Main button label or content. */
  children: React.ReactNode | ((value?: string | null) => React.ReactNode);
  /** Collection of selectable menu options. */
  options: DropdownOption[];
  /** Controlled active value. */
  value?: string | null;
  /** Default active value for uncontrolled usage. */
  defaultValue?: string | null;
  /** Callback fired when clicking the main action button. */
  onClick?: (selectedValue: string | null) => void;
  /** Callback fired when a dropdown option is selected. */
  onValueChange?: (value: string | null) => void;
  /** Visual variant styling passed down to buttons. */
  variant?: ButtonProps["variant"];
  /** Disables all button interactions when true. */
  disabled?: boolean;
}

/**
 * Split-button component delivering a primary direct action alongside a contextual selection dropdown.
 * @param props - Configuration options including options array, value handlers, and button variants.
 * @returns The rendered split button dropdown element.
 */
export function ButtonDropdown({
  children,
  options = [],
  value,
  defaultValue = null,
  onClick,
  onValueChange,
  variant = "outline",
  disabled = false,
  ...props
}: ButtonDropdownProps): React.JSX.Element {
  const [internalValue, setInternalValue] = useState<string | null>(
    defaultValue,
  );

  const isControlled = value !== undefined;
  const selectedValue = isControlled ? value : internalValue;

  const handleMainClick = useCallback(() => {
    onClick?.(selectedValue);
  }, [onClick, selectedValue]);

  const handleOptionSelect = useCallback(
    (optionValue: string | null) => {
      if (!isControlled) {
        setInternalValue(optionValue);
      }
      onValueChange?.(optionValue);
    },
    [isControlled, onValueChange],
  );

  return (
    <ButtonGroup>
      <Button
        type="button"
        onClick={handleMainClick}
        variant={variant}
        disabled={disabled}
        size="sm"
        className="text-xs"
        {...props}
      >
        {typeof children === "function" ? children(internalValue) : children}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              size="sm"
              variant={variant}
              disabled={disabled}
              className="px-2!"
              aria-label="Toggle options menu"
            >
              <ChevronDownIcon className="h-4 w-4" />
            </Button>
          }
        ></DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuGroup>
            {options.map((option, index) => {
              const Icon = option.icon;
              const optionKey = option.value ?? `option-${index}`;

              return (
                <DropdownMenuItem
                  key={optionKey}
                  disabled={option.disabled}
                  onClick={() => handleOptionSelect(option.value)}
                  className="text-xs truncate"
                >
                  {Icon && <Icon className="mr-2 size-4" />}
                  <span>{option.label}</span>
                  <DropdownMenuShortcut>
                    {option.value === internalValue && (
                      <Check className="size-4" />
                    )}
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
  );
}

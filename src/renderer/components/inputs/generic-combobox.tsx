"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/renderer/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/renderer/components/ui/popover";
import { Button } from "@/renderer/components/ui/button";
import { cn } from "@/renderer/utils";

/**
 * Represents an individual option within the combo box.
 * @template T - Custom data payload attached to the option.
 */
export type ComboBoxOption<T = unknown> = {
  value: string;
  label: string;
  data?: T;
};

/**
 * Represents a group of combo box options under a section header.
 * @template T - Custom data payload attached to options within the group.
 */
export type ComboBoxGroup<T = unknown> = {
  heading?: string;
  options: ComboBoxOption<T>[];
};

/**
 * Props for the GenericComboBox component supporting both flat and section-grouped options.
 * @template T - Custom data payload associated with options.
 */
export type GenericComboBoxProps<T = unknown> = {
  id?: string;
  options?: ComboBoxOption<T>[];
  groups?: ComboBoxGroup<T>[];
  value?: string;
  disabled?: boolean;
  onChangeValue: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  contentClassName?: string;
  renderTrigger?: (selected: ComboBoxOption<T> | undefined) => React.ReactNode;
  renderItem?: (
    item: ComboBoxOption<T>,
    isSelected: boolean,
  ) => React.ReactNode;
};

/**
 * Internal implementation of the accessible generic select/combobox component.
 * @template T - Data payload type for options.
 * @param props - Component properties.
 * @param ref - Forwarded reference to the trigger button element.
 * @returns The rendered ComboBox component.
 */
function GenericComboBoxInner<T>(
  {
    options,
    groups,
    value,
    disabled,
    onChangeValue,
    placeholder = "Sélectionner...",
    searchPlaceholder = "Rechercher...",
    emptyMessage = "Aucun résultat.",
    className,
    contentClassName,
    renderTrigger,
    renderItem,
    id,
  }: GenericComboBoxProps<T>,
  ref: React.ForwardedRef<HTMLButtonElement>,
) {
  const [open, setOpen] = React.useState(false);

  const normalizedGroups = React.useMemo<ComboBoxGroup<T>[]>(() => {
    if (groups && groups.length > 0) {
      return groups;
    }
    if (options && options.length > 0) {
      return [{ options }];
    }
    return [];
  }, [options, groups]);

  const flatOptions = React.useMemo<ComboBoxOption<T>[]>(() => {
    return normalizedGroups.flatMap((group) => group.options);
  }, [normalizedGroups]);

  const selectedOption = React.useMemo(
    () => flatOptions.find((opt) => opt.value === value),
    [value, flatOptions],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={ref}
          id={id}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal h-9 px-3",
            className,
          )}
        >
          <div className="flex-1 truncate text-left">
            {renderTrigger ? (
              renderTrigger(selectedOption)
            ) : (
              <span
                className={cn(
                  "text-xs font-medium",
                  !selectedOption && "text-muted-foreground",
                )}
              >
                {selectedOption ? selectedOption.label : placeholder}
              </span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className={cn(
          "w-(--radix-popover-trigger-width) min-w-70 p-0 shadow-md",
          contentClassName,
        )}
        align="start"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <Command className="flex flex-col space-y-2">
          <CommandInput
            placeholder={searchPlaceholder}
            className="h-8 text-xs border-none focus-visible:ring-0 shadow-none"
          />
          <CommandList
            className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-accent"
            onWheel={(e) => {
              e.stopPropagation();
            }}
          >
            <CommandEmpty className="py-6 text-center text-xs text-muted-foreground italic">
              {emptyMessage}
            </CommandEmpty>

            {normalizedGroups.map((group, groupIndex) => (
              <CommandGroup
                key={group.heading || `group-${groupIndex}`}
                heading={group.heading}
                className="p-1"
              >
                {group.options.map((item) => {
                  const isSelected = value === item.value;
                  return (
                    <CommandItem
                      key={item.value}
                      value={`${item.label} ${item.value}`}
                      onSelect={() => {
                        onChangeValue(item.value);
                        setOpen(false);
                      }}
                      className={cn(
                        "flex items-center gap-2 px-2 py-1.5 rounded-sm cursor-pointer text-xs",
                        isSelected ? "bg-accent/50 text-accent-foreground" : "",
                      )}
                    >
                      <div className="flex-1 truncate font-normal">
                        {renderItem ? renderItem(item, isSelected) : item.label}
                      </div>
                      {isSelected && (
                        <span className="ml-auto flex items-center shrink-0">
                          <Check className="h-3 w-3 text-primary" />
                        </span>
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Reusable generic ComboBox supporting searchable single-select, custom rendering, and section grouping.
 */
export const GenericComboBox = React.forwardRef(GenericComboBoxInner) as <T>(
  props: GenericComboBoxProps<T> & {
    ref?: React.ForwardedRef<HTMLButtonElement>;
  },
) => React.ReactElement;

(GenericComboBox as React.NamedExoticComponent).displayName = "GenericComboBox";

"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/renderer/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/renderer/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/renderer/components/ui/popover";
import { Button } from "@/renderer/components/ui/button";

type ObjectRecord = Record<string, unknown>;

export type ComboboxOption<T extends ObjectRecord = ObjectRecord> = T & {
  value: string;
  label: string;
  sublabel?: string;
  description?: string;
};

export interface ComboboxSearchProps<T extends ObjectRecord = ObjectRecord> {
  id?: string;
  value?: string;
  onChange?(value: string): void;
  options?: ComboboxOption<T>[];
  placeholder?: string;
  searchPlaceholder?: string;
  search?: string;
  onSearchChange?(search: string): void;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  contentClassName?: string;
  selectedItem?: ComboboxOption<T>;
  renderTrigger?: (selected: ComboboxOption<T> | undefined) => React.ReactNode;
  renderItem?: (
    item: ComboboxOption<T>,
    isSelected: boolean,
  ) => React.ReactNode;
}

function ComboboxSearchInner<T extends ObjectRecord>(
  {
    id,
    value,
    onChange,
    options = [],
    placeholder = "Sélectionner...",
    searchPlaceholder = "Rechercher...",
    search,
    onSearchChange,
    isLoading = false,
    disabled = false,
    className,
    contentClassName,
    selectedItem,
    renderTrigger,
    renderItem,
  }: ComboboxSearchProps<T>,
  ref: React.ForwardedRef<HTMLButtonElement>,
) {
  const [open, setOpen] = React.useState(false);

  const [localSelectedOption, setLocalSelectedOption] = React.useState<
    ComboboxOption<T> | undefined
  >(undefined);

  const selectedOption = React.useMemo(() => {
    if (selectedItem) return selectedItem;

    const found = options.find((opt) => opt.value === value);
    if (found) {
      return found;
    }

    if (localSelectedOption && localSelectedOption.value === value) {
      return localSelectedOption;
    }

    return undefined;
  }, [value, options, selectedItem, localSelectedOption]);

  React.useEffect(() => {
    const found = options.find((opt) => opt.value === value);
    if (found) {
      setLocalSelectedOption(found);
    }
  }, [value, options]);

  const filteredOptions = React.useMemo(() => {
    if (onSearchChange || !search) return options;
    const lowerSearch = search.toLowerCase();
    return options.filter((option) =>
      option.label.toLowerCase().includes(lowerSearch),
    );
  }, [options, search, onSearchChange]);

  const handleSelect = React.useCallback(
    (option: ComboboxOption<T>) => {
      setLocalSelectedOption(option);
      onChange?.(option.value);
      setOpen(false);
    },
    [onChange],
  );

  const isAsyncSearch = !!onSearchChange;

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
                  "text-sm",
                  !selectedOption && "text-muted-foreground",
                )}
              >
                {selectedOption ? selectedOption.label : placeholder}
              </span>
            )}
          </div>
          {isLoading ? (
            <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin opacity-50" />
          ) : (
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          )}
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
        <Command
          shouldFilter={!isAsyncSearch}
          className="flex flex-col space-y-4"
        >
          <CommandInput
            value={search}
            onValueChange={onSearchChange}
            placeholder={searchPlaceholder}
            className="h-8 text-xs border-none focus-visible:ring-0 shadow-none"
          />
          <CommandList
            className="max-h-60 overflow-y-auto scrollbar-thin"
            onWheel={(e) => {
              e.stopPropagation();
            }}
          >
            {isLoading && options.length === 0 && (
              <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Chargement...
              </div>
            )}

            {!isLoading && options.length === 0 && (
              <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                Aucun élément trouvé.
              </CommandEmpty>
            )}

            {filteredOptions.length > 0 && (
              <CommandGroup className="p-1">
                {filteredOptions.map((option) => {
                  const isSelected = value === option.value;
                  return (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      keywords={[
                        option.label,
                        option.sublabel || "",
                        option.description || "",
                      ]}
                      onSelect={() => handleSelect(option)}
                      className={cn(
                        "flex items-center gap-2 px-2 py-1.5 rounded-sm cursor-pointer text-xs",
                        isSelected ? "bg-accent/50 text-accent-foreground" : "",
                      )}
                    >
                      {renderItem ? (
                        renderItem(option, isSelected)
                      ) : (
                        <div className="flex-1 truncate">
                          <span className="font-medium">{option.label}</span>
                          {(option.description || option.sublabel) && (
                            <p className="text-xs text-muted-foreground truncate">
                              {option.description || option.sublabel}
                            </p>
                          )}
                        </div>
                      )}
                      {isSelected && (
                        <CommandShortcut>
                          <Check className="h-4 w-4 text-primary shrink-0" />
                        </CommandShortcut>
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export const ComboboxSearch = React.forwardRef(ComboboxSearchInner) as <
  T extends ObjectRecord = ObjectRecord,
>(
  props: ComboboxSearchProps<T> & {
    ref?: React.ForwardedRef<HTMLButtonElement>;
  },
) => React.JSX.Element;

(ComboboxSearch as { displayName?: string }).displayName = "ComboboxSearch";

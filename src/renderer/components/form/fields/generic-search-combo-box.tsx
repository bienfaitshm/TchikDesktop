"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

export type ObjectRecord = Record<string, unknown>;

export type ComboboxOption<T extends ObjectRecord = ObjectRecord> = T & {
  value: string;
  label: string;
  sublabel?: string;
  description?: string;
};

export interface ComboboxSearchProps<T extends ObjectRecord = ObjectRecord> {
  id?: string;
  value?: string;
  onChange?(value: string, item: T): void;
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

/**
 * Core implementation of the ComboboxSearch.
 * Handles state, hybrid filtering (local to remote threshold), and smooth animations.
 *
 * @param props - The properties applied to the combobox.
 * @param ref - Forwarded reference to the trigger button element.
 * @returns The rendered combobox component.
 */
function ComboboxSearchInner<T extends ObjectRecord>(
  {
    id,
    value,
    onChange,
    options = [],
    placeholder = "Select...",
    searchPlaceholder = "Search...",
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
    if (found) return found;

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

  // Handle local filtering and relevance sorting
  const filteredOptions = React.useMemo(() => {
    const lowerSearch = search?.toLowerCase().trim();
    if (!lowerSearch) return options;

    return [...options]
      .filter((option) => option.label.toLowerCase().includes(lowerSearch))
      .sort((a, b) => {
        // Sort items by relevance: Starts with search term > just includes it
        const aStarts = a.label.toLowerCase().startsWith(lowerSearch);
        const bStarts = b.label.toLowerCase().startsWith(lowerSearch);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return 0;
      });
  }, [options, search]);

  const handleSelect = React.useCallback(
    (option: ComboboxOption<T>) => {
      setLocalSelectedOption(option);
      onChange?.(option.value, option);
      setOpen(false);
    },
    [onChange],
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
                  "text-sm",
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
        <Command
          shouldFilter={false} // Disabled because filtering and sorting is handled locally
          className="flex flex-col space-y-4 relative"
        >
          <div className="relative flex items-center border-b mb-2 pb-2">
            <CommandInput
              value={search}
              onValueChange={onSearchChange}
              placeholder={searchPlaceholder}
              className="h-9 w-full text-xs border-none focus-visible:ring-0 shadow-none pr-8"
            />
            {isLoading && (
              <Loader2 className="absolute right-6 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>

          <CommandList
            className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-accent"
            onWheel={(e) => e.stopPropagation()}
          >
            {!isLoading && filteredOptions.length === 0 && (
              <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                No items found.
              </CommandEmpty>
            )}

            <CommandGroup className="p-1">
              <AnimatePresence initial={false}>
                {filteredOptions.map((option) => {
                  const isSelected = value === option.value;
                  return (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => handleSelect(option)}
                      className={cn(
                        "p-0 mb-1 cursor-pointer rounded-sm text-xs",
                        isSelected ? "bg-accent/50 text-accent-foreground" : "",
                      )}
                    >
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="flex w-full items-center gap-2 px-2 py-1.5"
                      >
                        {renderItem ? (
                          renderItem(option, isSelected)
                        ) : (
                          <RenderItem
                            label={option.label}
                            description={option.description}
                            subLabel={option.sublabel}
                          />
                        )}
                        {isSelected && (
                          <CommandShortcut>
                            <Check className="h-4 w-4 text-primary shrink-0" />
                          </CommandShortcut>
                        )}
                      </motion.div>
                    </CommandItem>
                  );
                })}
              </AnimatePresence>
            </CommandGroup>
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

/**
 * Reusable component to render the standard text layout for an option item.
 *
 * @param props - Display values for the item (label, subLabel, description).
 * @returns The structured label element.
 */
export const RenderItem: React.FC<{
  label: string;
  subLabel?: string;
  description?: string;
}> = ({ label, subLabel, description }) => (
  <div className="flex-1 truncate gap-0.5">
    <span className="font-medium">{label}</span>
    {(description || subLabel) && (
      <p className="text-[10px] text-muted-foreground truncate">
        {description || subLabel}
      </p>
    )}
  </div>
);

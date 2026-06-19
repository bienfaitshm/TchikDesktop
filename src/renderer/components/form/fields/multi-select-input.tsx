"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import {
  Command,
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
import { Checkbox } from "@/renderer/components/ui/checkbox";
import { Label } from "@/renderer/components/ui/label";
import { cn } from "@/renderer/utils";
import {
  useFilterCheckBoxInput,
  type FilterOption,
} from "./multi-select-input.utils";
import { ScrollArea } from "../../ui/scroll-area";

export interface MultiSelectProps extends Omit<
  React.ComponentPropsWithoutRef<typeof Button>,
  "value" | "onChange"
> {
  name: string;
  placeholder?: string;
  options?: FilterOption[];
  value?: (string | undefined)[];
  onChange?(values: string[]): void;
  labelPlural?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  contentClassName?: string;
}

const MultiSelect = React.forwardRef<HTMLButtonElement, MultiSelectProps>(
  (
    {
      options = [],
      name,
      value = [],
      placeholder = "Sélectionner...",
      searchPlaceholder = "Rechercher...",
      emptyMessage = "Aucun résultat.",
      onChange,
      className,
      contentClassName,
      labelPlural,
      ...props
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false);

    const {
      searchTerm,
      setSearchTerm,
      filteredOptions,
      getButtonText,
      clearSelection,
      toggleAllFiltered,
      handleCheckedChange,
      areAllFilteredSelected,
      selectedSet,
    } = useFilterCheckBoxInput({
      options,
      onChange,
      placeholder,
      value,
      labelPlural: labelPlural || name,
    });

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between font-normal h-9 px-3",
              className,
            )}
            {...props}
          >
            <div className="flex-1 truncate text-left text-xs font-medium">
              {getButtonText()}
            </div>
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className={cn(
            "w-[--radix-popover-trigger-width] min-w-[280px] p-0 shadow-md",
            contentClassName,
          )}
          align="start"
        >
          <Command className="flex flex-col" shouldFilter={false}>
            <div className="flex items-center px-1 pb-2 border-b  w-full">
              <CommandInput
                placeholder={searchPlaceholder}
                value={searchTerm}
                onValueChange={setSearchTerm}
                className="h-9 w-full text-xs border-none focus-visible:ring-0 shadow-none flex-1"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6 shrink-0 rounded-sm mr-2"
                  onClick={() => setSearchTerm("")}
                >
                  <X className="size-3" />
                </Button>
              )}
            </div>

            <CommandList className="max-h-[240px] overflow-y-auto scrollbar-thin p-1 flex flex-col">
              <ScrollArea className="h-full">
                <CommandGroup>
                  {filteredOptions.map((option) => {
                    const isSelected = selectedSet.has(option.value);
                    const checkboxId = `select-${name}-${option.value}`;

                    return (
                      <CommandItem
                        key={option.value}
                        value={option.label}
                        onSelect={() => {
                          // Inverse l'état de sélection au clic sur la ligne entière
                          handleCheckedChange(!isSelected, option.value);
                        }}
                        data-slot="multiselect-item"
                        data-state={isSelected ? "selected" : "unselected"}
                        className={cn(
                          "flex items-center gap-2.5 px-2 py-1.5 rounded-sm cursor-pointer text-xs transition-colors",
                          "data-[state=selected]:bg-accent/40 text-foreground",
                        )}
                      >
                        <Checkbox
                          id={checkboxId}
                          checked={isSelected}
                          onCheckedChange={(checked) =>
                            handleCheckedChange(!!checked, option.value)
                          }
                          className="shrink-0 pointer-events-none"
                        />
                        <Label
                          htmlFor={checkboxId}
                          className="flex-1 font-normal cursor-pointer text-xs truncate py-0.5 pointer-events-none"
                        >
                          {option.label}
                        </Label>
                        {isSelected && (
                          <Check className="size-3.5 text-primary shrink-0 animate-in fade-in zoom-in-75 duration-100" />
                        )}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </ScrollArea>
            </CommandList>

            {/* Actions de groupe en bas (Esprit v4 harmonisé) */}
            <div className="border-t bg-muted/40 p-2 flex items-center justify-between gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={filteredOptions.length === 0}
                className="h-7 px-2 text-xs flex-1 shadow-2xs font-medium"
                onClick={(e) => {
                  e.preventDefault();
                  toggleAllFiltered();
                }}
              >
                {areAllFilteredSelected ? "Tout décocher" : "Tout cocher"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={value.length === 0}
                className="h-7 px-2 text-xs flex-1 text-destructive hover:text-destructive hover:bg-destructive/10 font-medium"
                onClick={(e) => {
                  e.preventDefault();
                  clearSelection();
                }}
              >
                Réinitialiser ({value.length})
              </Button>
            </div>
          </Command>
        </PopoverContent>
      </Popover>
    );
  },
);

MultiSelect.displayName = "MultiSelect";

export { MultiSelect };

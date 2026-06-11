"use client";

import * as React from "react";
import { Loader2Icon } from "lucide-react";
import { cn } from "@/renderer/utils";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxList,
  ComboboxItem,
} from "@/renderer/components/ui/combobox";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/renderer/components/ui/item";

export interface ComboboxOption {
  value: string;
  label: string;
  sublabel?: string;
  description?: string;
  [key: string]: unknown;
}

export interface ComboboxSearchProps {
  placeholder?: string;
  searchPlaceholder?: string;
  search?: string;
  value?: string;
  onChange?(value: string): void;
  options?: ComboboxOption[];
  disable?: boolean;
  className?: string;
  onSearchChange?(search: string): void | Promise<void>;
  isLoading?: boolean;
}

export const ComboboxSearch = React.forwardRef<
  HTMLButtonElement,
  ComboboxSearchProps
>(
  (
    {
      value,
      search,
      onChange,
      placeholder = "Sélectionner une option...",
      searchPlaceholder = "Rechercher...",
      options = [],
      className,
      disable,
      onSearchChange,
      isLoading = false,
    },
    ref,
  ) => {
    // Gestion du filtrage local si aucune fonction de recherche externe n'est fournie
    const filteredOptions = React.useMemo(() => {
      if (onSearchChange || !search) return options;

      const lowerSearch = search.toLowerCase();
      return options.filter((option) =>
        option.label.toLowerCase().includes(lowerSearch),
      );
    }, [options, search, onSearchChange]);

    const selectedOption = React.useMemo(() => {
      return options.find((opt) => opt.value === value) || null;
    }, [options, value]);

    return (
      <Combobox
        modal={false}
        disabled={disable}
        items={filteredOptions}
        value={selectedOption}
        itemToStringValue={(item: ComboboxOption) => item.label}
        onValueChange={(item) => {
          onChange?.(item ? item.value : "");
        }}
      >
        <div className="relative flex items-center w-full">
          <ComboboxInput
            className="w-full pr-10"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
          {isLoading && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <Loader2Icon className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Ajustement clé : max-h-60 fixe la hauteur limite et overflow-y-auto active le scroll.
          Le min-w-[200px] évite que la liste ne s'écrase sur elle-même.
        */}
        <ComboboxContent
          className={cn(
            "w-full min-w-[200px] max-h-60 overflow-y-auto p-1",
            className,
          )}
          onInteractOutside={(event) => {
            event.preventDefault();
          }}
        >
          {!isLoading && filteredOptions.length === 0 && (
            <ComboboxEmpty className="py-6 text-center text-sm text-muted-foreground">
              Aucun élément trouvé.
            </ComboboxEmpty>
          )}

          <ComboboxList>
            {(option: ComboboxOption) => (
              <ComboboxItem key={option.value} value={option.value}>
                <Item size="xs" className="p-0 w-full">
                  <ItemContent className="w-full overflow-hidden">
                    {/* truncate ou line-clamp évite que les textes longs ne cassent le layout */}
                    <ItemTitle className="truncate block w-full">
                      {option.label}
                    </ItemTitle>
                    {(option.description || option.sublabel) && (
                      <ItemDescription className="truncate block w-full text-xs text-muted-foreground">
                        {option.description || option.sublabel}
                      </ItemDescription>
                    )}
                  </ItemContent>
                </Item>
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    );
  },
);

ComboboxSearch.displayName = "ComboboxSearch";

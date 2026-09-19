"use client";

import * as React from "react";
import { CheckIcon, PlusCircle } from "lucide-react";
import type { Column, RowData } from "@tanstack/react-table";
import { cn } from "@/renderer/utils";
import { Badge } from "@/renderer/components/ui/badge";
import { Button } from "@/renderer/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
  CommandSeparator,
} from "@/renderer/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/renderer/components/ui/popover";
import { Separator } from "@/renderer/components/ui/separator";
import { TableFeature } from "./hooks";

export interface TableFacetedFilterOption {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface TableFacetedFilterProps<TData extends RowData, TValue> {
  column?: Column<TableFeature, TData, TValue>;
  title?: string;
  options: TableFacetedFilterOption[];
  className?: string;
}

/**
 * Renders a multi-select faceted filter dropdown for applying search filters on a table column.
 * @param props - Filter options, column reference, and UI strings.
 * @returns The faceted filter popover component.
 */
export function TableFacetedFilter<TData extends RowData, TValue>({
  column,
  title,
  options,
  className,
}: TableFacetedFilterProps<TData, TValue>): React.ReactElement {
  const filterValue = column?.getFilterValue() as string[] | undefined;
  const selectedValuesSet = React.useMemo(
    () => new Set(filterValue),
    [filterValue],
  );

  const handleSelect = React.useCallback(
    (value: string) => {
      const current = (column?.getFilterValue() as string[]) || [];
      const newValue = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      column?.setFilterValue(newValue.length > 0 ? newValue : undefined);
    },
    [column],
  );

  const handleReset = React.useCallback(
    () => column?.setFilterValue(undefined),
    [column],
  );
  const facets = column?.getFacetedUniqueValues();
  const selectedCount = filterValue?.length ?? 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("h-8 rounded-full text-xs", className)}
        >
          <PlusCircle className="mr-2 size-3.5" />
          {title}
          {selectedCount > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal text-xs lg:hidden"
              >
                {selectedCount}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedCount > 2 ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-2 font-normal text-xs"
                  >
                    {selectedCount} sélectionnés
                  </Badge>
                ) : (
                  options
                    .filter((option) => selectedValuesSet.has(option.value))
                    .map((option) => (
                      <Badge
                        variant="secondary"
                        key={option.value}
                        className="rounded-sm px-1 font-normal text-xs"
                      >
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="min-w-52 w-fit p-0" align="start">
        <Command>
          <CommandInput placeholder={title} className="text-xs" />
          <CommandList
            className="space-y-2 max-h-80 mt-4"
            onWheel={(e) => e.stopPropagation()}
          >
            <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
            <CommandGroup className="max-h-60 overflow-y-auto scrollbar-thin">
              {options.map((option) => {
                const isSelected = selectedValuesSet.has(option.value);
                const facetValue = facets?.get(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => handleSelect(option.value)}
                  >
                    <div className="flex flex-row items-center justify-between w-full">
                      <div className="flex flex-row items-center">
                        <div
                          className={cn(
                            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary transition-colors",
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : "opacity-50 [&_svg]:invisible",
                          )}
                        >
                          <CheckIcon className="h-4 w-4" />
                        </div>
                        {option.icon && (
                          <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="truncate text-xs">{option.label}</span>
                      </div>
                    </div>
                    {facetValue !== undefined && (
                      <CommandShortcut className="ml-auto flex h-4 w-4 items-center justify-center font-mono text-[12px]">
                        {facetValue}
                      </CommandShortcut>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selectedCount > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={handleReset}
                    className="justify-center text-xs text-center font-medium text-destructive hover:text-destructive focus:text-destructive"
                  >
                    Réinitialiser les filtres
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

TableFacetedFilter.displayName = "TableFacetedFilter";

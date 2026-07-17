"use client";

import * as React from "react";
import { CheckIcon, PlusCircle } from "lucide-react";
import { type Column } from "@tanstack/react-table";

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

interface TableFacetedFilterOption {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface TableFacetedFilterProps<TData, TValue> {
  column?: Column<TData, TValue>;
  title?: string;
  options: TableFacetedFilterOption[];
  className?: string;
}

export const TableFacetedFilter = React.memo(
  <TData, TValue>({
    column,
    title,
    options,
    className,
  }: TableFacetedFilterProps<TData, TValue>) => {
    const filterValue = column?.getFilterValue() as string[] | undefined;
    const selectedValuesSet = React.useMemo(
      () => new Set(filterValue),
      [filterValue],
    );

    const handleSelect = React.useCallback(
      (value: string) => {
        const current = (column?.getFilterValue() as string[]) || [];
        const isSelected = current.includes(value);
        const newValue = isSelected
          ? current.filter((v) => v !== value)
          : [...current, value];

        column?.setFilterValue(newValue.length > 0 ? newValue : undefined);
      },
      [column],
    );

    const handleReset = React.useCallback(() => {
      column?.setFilterValue(undefined);
    }, [column]);

    const facets = column?.getFacetedUniqueValues();
    const selectedCount = filterValue?.length ?? 0;

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className={cn("h-9", className)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {title}
            {selectedCount > 0 && (
              <>
                <Separator orientation="vertical" className="mx-2 h-4" />
                <Badge
                  variant="secondary"
                  className="rounded-sm px-1 font-normal lg:hidden"
                >
                  {selectedCount}
                </Badge>
                <div className="hidden space-x-1 lg:flex">
                  {selectedCount > 2 ? (
                    <Badge
                      variant="secondary"
                      className="rounded-sm px-1 font-normal"
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
                          className="rounded-sm px-1 font-normal"
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
        <PopoverContent className="w-100 p-0" align="start">
          <Command>
            <CommandInput placeholder={title} />
            <CommandList
              className="space-y-2 max-h-80 mt-4"
              onWheel={(e) => e.stopPropagation()}
            >
              <CommandEmpty>Aucun résultat.</CommandEmpty>
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
                        <div className="flex flex-row">
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
                          <span className="truncate">{option.label}</span>
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
                      onSelect={handleReset} // Handler stable
                      className="justify-center text-center font-medium text-destructive hover:text-destructive focus:text-destructive"
                    >
                      Réinitialiser
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  },
  (prevProps, nextProps) => {
    // Si la colonne ou le titre changent, on re-rend
    if (prevProps.column !== nextProps.column) return false;
    if (prevProps.title !== nextProps.title) return false;
    if (prevProps.className !== nextProps.className) return false;

    // Comparaison profonde des options (on vérifie si les valeurs/labels ont changé)
    const prevOpts = prevProps.options;
    const nextOpts = nextProps.options;
    if (prevOpts.length !== nextOpts.length) return false;
    for (let i = 0; i < prevOpts.length; i++) {
      if (prevOpts[i].value !== nextOpts[i].value) return false;
      if (prevOpts[i].label !== nextOpts[i].label) return false;
    }

    // Si tout est identique, on empêche le re-rendu
    return true;
  },
) as <TData, TValue>(
  props: TableFacetedFilterProps<TData, TValue>,
) => React.ReactElement;

(TableFacetedFilter as any).displayName = "TableFacetedFilter";

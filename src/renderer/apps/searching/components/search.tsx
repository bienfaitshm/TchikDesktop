import {
  ReactNode,
  useRef,
  useState,
  useCallback,
  useMemo,
  useEffect,
  KeyboardEvent,
  ChangeEvent,
} from "react";
import { Search, Info } from "lucide-react";
import { cn } from "@/renderer/utils";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover";
import { Button } from "@/renderer/components/ui/button";

/**
 * Props configuration for the SearchInput component.
 * @template TData Generic type representing the suggestion data item.
 */
export type SearchInputProps<TData> = {
  name?: string;
  /** Array of suggestion items to be rendered in the popover list. */
  data?: TData[];
  /** Controlled search query string value. */
  query?: string;
  /** Callback fired when the query string changes. */
  onQueryChange?: (query: string) => void;
  /** Optional custom renderer for the detailed preview panel of an item. */
  renderDetail?: (data: TData) => ReactNode;
  /** Function to extract label and optional description from a data item. */
  getItemLabel: (data: TData) => { label: string; description?: string };
  /** Callback fired when a suggestion item is selected. */
  onSelect?: (data: TData) => void;
};

/**
 * Renders an accessible search input with stable popover suggestions and detailed preview.
 * @template TData Generic type representing search result items.
 * @param props Configuration properties for the component.
 * @returns The rendered search input component.
 */
export function SearchInput<TData>({
  name,
  data = [],
  query: externalQuery,
  onQueryChange,
  getItemLabel,
  renderDetail,
  onSelect,
}: SearchInputProps<TData>) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [internalQuery, setInternalQuery] = useState<string>("");
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const isControlled = externalQuery !== undefined;
  const currentQuery = isControlled ? externalQuery : internalQuery;
  const hasData = data.length > 0;
  const showPopover = isOpen && hasData;

  /**
   * Synchronizes popover visibility when asynchronous data arrives while input retains focus.
   */
  useEffect(() => {
    if (hasData && isFocused) {
      setIsOpen(true);
    }
  }, [hasData, isFocused]);

  /**
   * Updates internal and external query states seamlessly.
   * @param newQuery - The updated query string.
   */
  const updateQuery = useCallback(
    (newQuery: string) => {
      if (!isControlled) {
        setInternalQuery(newQuery);
      }
      onQueryChange?.(newQuery);
    },
    [isControlled, onQueryChange],
  );

  /**
   * Retrieves the display label of a suggestion item at a specific index.
   * @param index - Index of the targeted item.
   * @returns Extracted string label or empty string.
   */
  const getLabelOfIndex = useCallback(
    (index: number): string => {
      const activeItem = data[index];
      return activeItem ? getItemLabel(activeItem).label : "";
    },
    [data, getItemLabel],
  );

  const activeItem = useMemo(
    () => (activeIndex >= 0 ? data[activeIndex] : null),
    [data, activeIndex],
  );

  /**
   * Handles keyboard navigation and item selection via Enter or Escape.
   * @param e - React keyboard event.
   */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (!showPopover) return;

      const totalItems = data.length;

      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          setActiveIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0));
          break;
        }

        case "ArrowUp": {
          e.preventDefault();
          setActiveIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1));
          break;
        }

        case "Enter": {
          e.preventDefault();
          if (activeIndex >= 0 && data[activeIndex]) {
            const selectedItem = data[activeIndex];
            updateQuery(getItemLabel(selectedItem).label);
            onSelect?.(selectedItem);
          }
          setIsOpen(false);
          setActiveIndex(-1);
          break;
        }

        case "Escape": {
          e.preventDefault();
          setIsOpen(false);
          setActiveIndex(-1);
          break;
        }

        default:
          break;
      }
    },
    [showPopover, data, activeIndex, getItemLabel, updateQuery, onSelect],
  );

  /**
   * Manages open state changes and cleans up selection index when closed.
   * @param open - Target open state.
   */
  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setActiveIndex(-1);
    }
  }, []);

  /**
   * Handles input focus and activates suggestions if data exists.
   */
  const handleFocus = useCallback(() => {
    setIsFocused(true);
    if (hasData) {
      setIsOpen(true);
    }
  }, [hasData]);

  /**
   * Tracks blur state for input field.
   */
  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  /**
   * Handles text changes and ensures popover display on active results.
   * @param e - Input change event.
   */
  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      updateQuery(e.target.value);
      if (hasData) {
        setIsOpen(true);
      }
    },
    [updateQuery, hasData],
  );

  /**
   * Prevents premature closure when clicking internal input container elements.
   * @param e - DOM event.
   */
  const handleInteractOutside = useCallback((e: Event) => {
    if (containerRef.current?.contains(e.target as Node)) {
      e.preventDefault();
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full max-w-4xl mx-auto flex flex-col items-center"
    >
      <Popover open={showPopover} onOpenChange={handleOpenChange}>
        <PopoverAnchor asChild>
          <div
            className={cn(
              "flex items-center w-full h-12 px-4 bg-background border transition-all duration-200 ease-in-out shadow-none",
              "focus-within:shadow-sm",
              showPopover ? "rounded-t-3xl bg-background" : "rounded-full",
            )}
          >
            <Search className="text-muted-foreground h-5 w-5 mr-3 shrink-0" />

            <input
              type="text"
              value={currentQuery}
              name={name}
              onChange={handleInputChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              role="combobox"
              aria-expanded={showPopover}
              aria-autocomplete="list"
              aria-activedescendant={
                activeIndex >= 0 ? `suggestion-item-${activeIndex}` : undefined
              }
              placeholder="Rechercher..."
              className="flex-1 bg-transparent outline-none border-none text-base min-w-0"
            />

            <div className="flex items-center gap-2 ml-2 shrink-0">
              <Button
                type="submit"
                title="Rechercher"
                className="text-muted-foreground hover:text-foreground transition-colors rounded-full"
                size="icon"
                variant="ghost"
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </PopoverAnchor>

        <PopoverContent
          align="start"
          sideOffset={0}
          style={{ width: "var(--radix-popover-trigger-width)" }}
          className="p-0 ring-0 border border-accent border-t-0 shadow-xl bg-background rounded-b-3xl rounded-t-none overflow-hidden transition-all duration-200"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={handleInteractOutside}
        >
          <div className="mx-4 border-t border-border/40" />

          <div className="flex w-full py-2 px-1 max-h-[60vh] overflow-hidden">
            <div
              role="listbox"
              aria-label="Suggestions de recherche"
              className={cn(
                "flex flex-col min-w-0 transition-all duration-300 ease-in-out shrink-0 overflow-y-auto scrollbar-thin scrollbar-thumb-accent",
                activeIndex >= 0 && renderDetail ? "w-full md:w-1/2" : "w-full",
              )}
            >
              {data.map((item, index) => {
                const { label, description } = getItemLabel(item);
                const isSelected = activeIndex === index;

                return (
                  <div
                    key={`${label}-${index}`}
                    id={`suggestion-item-${index}`}
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => {
                      updateQuery(label);
                      setIsOpen(false);
                      setActiveIndex(-1);
                      onSelect?.(item);
                    }}
                    className={cn(
                      "flex items-center px-4 py-2.5 cursor-pointer transition-colors duration-150 rounded-r-full mr-2 min-w-0 select-none",
                      isSelected
                        ? "bg-accent-foreground/10 text-accent-foreground"
                        : "hover:bg-accent-foreground/5 text-muted-foreground",
                    )}
                  >
                    <Search className="h-4 w-4 mr-3 shrink-0 opacity-70" />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-medium truncate">
                        {label}
                      </span>
                      {description && (
                        <span className="text-xs opacity-70 truncate mt-0.5">
                          {description}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {renderDetail && (
              <div
                className={cn(
                  "transition-all duration-300 ease-in-out flex flex-col overflow-hidden shrink-0 border-l border-border/30",
                  activeIndex >= 0
                    ? "w-full md:w-1/2 opacity-100 translate-x-0 pl-2"
                    : "w-0 opacity-0 translate-x-4 pl-0 pointer-events-none",
                )}
              >
                <div className="w-full h-full flex flex-col px-4 pt-3 pb-2">
                  {activeItem && (
                    <div className="flex flex-col h-full animate-in fade-in duration-200">
                      <div className="flex items-center gap-2 mb-3 text-muted-foreground">
                        <Info className="h-4 w-4" />
                        <span className="text-xs font-semibold uppercase tracking-wider">
                          Aperçu de la recherche
                        </span>
                      </div>

                      <div className="flex-1 overflow-y-auto">
                        {renderDetail(activeItem)}
                      </div>

                      <p className="text-xs text-right text-muted-foreground mt-auto pt-3">
                        Appuyez sur{" "}
                        <kbd className="bg-accent-foreground/15 px-1.5 py-0.5 rounded font-mono text-[10px]">
                          Entrée
                        </kbd>{" "}
                        pour sélectionner
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

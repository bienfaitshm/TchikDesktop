import React, {
  ReactNode,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { Search, Mic, Camera, Info } from "lucide-react";
import { cn } from "@/renderer/utils";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover";
import { Button } from "@/renderer/components/ui/button";

export type GoogleSearchInputProps<TData> = {
  data?: TData[];
  query?: string;
  onQueryChange?: (query: string) => void;
  renderDetail?: (data: TData) => ReactNode;
  getItemLabel: (data: TData) => { label: string; description?: string };
};

/**
 * Renders an accessible search bar with an integrated popover dropdown supporting keyboard navigation,
 * real-time item preview, and flexible external query state management.
 */
export function GoogleSearchInput<TData>({
  data = [],
  query: externalQuery,
  onQueryChange,
  getItemLabel,
  renderDetail,
}: GoogleSearchInputProps<TData>) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [internalQuery, setInternalQuery] = useState<string>("");
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);

  const isControlled = externalQuery !== undefined;
  const query = isControlled ? externalQuery : internalQuery;

  const updateQuery = useCallback(
    (newQuery: string) => {
      if (!isControlled) {
        setInternalQuery(newQuery);
      }
      onQueryChange?.(newQuery);
    },
    [isControlled, onQueryChange],
  );

  const getLabelOfIndex = useCallback(
    (index: number) => {
      const activeItem = data[index];
      if (activeItem) {
        const { label } = getItemLabel(activeItem);
        return label;
      }
      return "";
    },
    [data, getItemLabel],
  );

  const indexItem = useMemo(() => data[activeIndex], [data, activeIndex]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen || data.length === 0) return;

      const totalItems = data.length;

      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          const nextIndex =
            activeIndex === totalItems - 1 ? -1 : activeIndex + 1;

          setActiveIndex(nextIndex);
          updateQuery(nextIndex === -1 ? "" : getLabelOfIndex(nextIndex));
          break;
        }

        case "ArrowUp": {
          e.preventDefault();
          const nextIndex =
            activeIndex === -1 ? totalItems - 1 : activeIndex - 1;

          setActiveIndex(nextIndex);
          updateQuery(nextIndex === -1 ? "" : getLabelOfIndex(nextIndex));
          break;
        }

        case "Enter": {
          e.preventDefault();
          if (activeIndex >= 0) {
            updateQuery(getLabelOfIndex(activeIndex));
          }
          setIsOpen(false);
          break;
        }

        case "Escape": {
          setIsOpen(false);
          break;
        }

        default:
          break;
      }
    },
    [isOpen, data, activeIndex, getLabelOfIndex, updateQuery],
  );

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setActiveIndex(-1);
    }
  }, []);

  const handleFocus = useCallback(() => setIsOpen(true), []);

  const onInteractOutside = useCallback(
    (e: Event) => {
      if (containerRef.current?.contains(e.target as Node)) {
        e.preventDefault();
      }
    },
    [containerRef],
  );

  const onOpenAutoFocus = useCallback((e: Event) => e.preventDefault(), []);

  const onChangeValue = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateQuery(e.target.value);
    },
    [updateQuery],
  );

  return (
    <div
      ref={containerRef}
      className="w-full max-w-4xl mx-auto flex flex-col items-center"
    >
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverAnchor asChild>
          <div
            className={cn(
              "flex items-center w-full h-12 px-4 bg-accent/90 border border-transparent transition-all duration-0",
              "hover:bg-accent focus-within:bg-accent focus-within:shadow-xl",
              isOpen ? "rounded-t-3xl bg-accent" : "rounded-full",
            )}
            onClick={handleFocus}
          >
            <Search className="text-muted-foreground h-5 w-5 mr-3 shrink-0" />

            <input
              type="text"
              value={query}
              onChange={onChangeValue}
              onFocus={handleFocus}
              onKeyDown={handleKeyDown}
              placeholder=""
              className="flex-1 bg-transparent outline-none border-none text-base min-w-0"
            />

            <div className="flex items-center gap-4 ml-2 shrink-0">
              <button
                title="Voice search"
                className="text-muted-foreground hover:text-muted-foreground transition"
              >
                <Mic className="h-5 w-5" />
              </button>
              <button
                title="Image search"
                className="text-muted-foreground hover:text-muted-foreground transition"
              >
                <Camera className="h-5 w-5" />
              </button>
              <Button
                title="Search"
                className="text-muted-foreground hover:text-muted-foreground transition rounded-full"
                size="icon-lg"
                variant="secondary"
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
          className="p-0 ring-0 border border-accent border-t-0 shadow-none bg-accent rounded-b-3xl rounded-t-none border-none overflow-hidden duration-150"
          onOpenAutoFocus={onOpenAutoFocus}
          onInteractOutside={onInteractOutside}
        >
          <div className="mx-4 border-t bg-border" />

          <div className="flex w-full py-3 px-1 max-h-[60vh] overflow-x-hidden overflow-y-auto">
            <div
              className={cn(
                "flex flex-col min-w-0 transition-all duration-300 ease-in-out shrink-0",
                activeIndex >= 0 ? "w-full md:w-1/2" : "w-full",
              )}
            >
              {data.map((item, index) => {
                const { label, description } = getItemLabel(item);
                return (
                  <div
                    key={index}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={cn(
                      "flex items-start px-4 py-2 cursor-pointer transition-colors rounded-r-full mr-2 min-w-0",
                      activeIndex === index
                        ? "bg-accent-foreground/10"
                        : "hover:bg-accent-foreground/5",
                    )}
                    onClick={() => {
                      updateQuery(label);
                      setIsOpen(false);
                    }}
                  >
                    <Search className="text-muted-foreground h-4 w-4 mr-4 mt-1 shrink-0" />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-normal truncate">
                        {label}
                      </span>
                      {description && (
                        <span className="text-muted-foreground text-[11px] mt-0.5">
                          {description}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              className={cn(
                "transition-all duration-300 ease-in-out flex flex-col overflow-hidden shrink-0",
                activeIndex >= 0
                  ? "w-full md:w-1/2 opacity-100 border-l border-zinc-700/40 md:pl-2"
                  : "w-0 opacity-0 border-transparent pl-0",
              )}
            >
              <div className="w-[calc(var(--radix-popover-trigger-width)*0.5-20px)] h-full">
                {activeIndex >= 0 && renderDetail && (
                  <div className="flex flex-col px-4 pt-4 pb-1 h-full animate-in fade-in slide-in-from-right-8 duration-300">
                    <div className="flex items-center gap-2 mb-4 text-muted-foreground">
                      <Info className="h-4 w-4" />
                      <span className="text-xs font-medium uppercase tracking-wider">
                        Search preview
                      </span>
                    </div>

                    {renderDetail(indexItem)}

                    <p className="text-xs text-right text-muted-foreground mt-auto pt-4">
                      Press{" "}
                      <kbd className="bg-accent-foreground/20 px-1.5 py-0.5 rounded-md font-mono text-[10px]">
                        Enter
                      </kbd>{" "}
                      to search
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

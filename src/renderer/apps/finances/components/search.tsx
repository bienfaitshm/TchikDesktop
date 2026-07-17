import React, { ReactNode, useRef, useState } from "react";
import { Search, Mic, Camera, Clock, Info } from "lucide-react";
import { cn } from "@/renderer/utils";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover";
import { Button } from "@/renderer/components/ui/button";

type GoogleSearchInputProps<TData> = {
  data?: TData[];
  renderDetail?(data: TData): ReactNode;
  getItemLabel(data: TData): { label: string; description?: string };
};
export function GoogleSearchInput<TData>({
  data = [],
  getItemLabel,
  renderDetail,
}: GoogleSearchInputProps<TData>) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [query, setQuery] = useState<string>("");
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);

  const getLabelOfIndex = React.useCallback(
    (index: number) => {
      const activeItem = data[index];
      if (activeItem) {
        const { label } = getItemLabel(activeItem);
        return label;
      }
      return "";
    },
    [data],
  );

  const indexItem = React.useMemo(() => data[activeIndex], [activeIndex]);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen || data.length === 0) return;

      const totalItems = data.length;

      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          // Logique de boucle : si on dépasse le dernier index, on revient à -1 (champ vide)
          const nextIndex =
            activeIndex === totalItems - 1 ? -1 : activeIndex + 1;

          setActiveIndex(nextIndex);
          setQuery(nextIndex === -1 ? "" : getLabelOfIndex(nextIndex));
          break;
        }

        case "ArrowUp": {
          e.preventDefault();
          // Logique de boucle : si on recule au-delà de -1, on boucle vers le dernier élément
          const nextIndex =
            activeIndex === -1 ? totalItems - 1 : activeIndex - 1;

          setActiveIndex(nextIndex);
          setQuery(nextIndex === -1 ? "" : getLabelOfIndex(nextIndex));
          break;
        }

        case "Enter": {
          e.preventDefault();
          if (activeIndex >= 0) {
            setQuery(getLabelOfIndex(activeIndex));
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
    [isOpen, activeIndex, setQuery, setActiveIndex, setIsOpen],
  );

  const handleOpenChange = React.useCallback((open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setActiveIndex(-1);
    }
  }, []);

  const handlerFocus = React.useCallback(() => setIsOpen(true), []);

  const onInteractOutside = React.useCallback(
    (e: Event) => {
      if (containerRef.current?.contains(e.target as Node)) {
        e.preventDefault();
      }
    },
    [containerRef],
  );

  const onOpenAutoFocus = React.useCallback(
    (e: Event) => e.preventDefault(),
    [],
  );

  const onChangeValue = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>) => {
      setQuery(e.target.value);
    },
    [],
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
            onClick={handlerFocus}
          >
            <Search className="text-muted-foreground h-5 w-5 mr-3 shrink-0" />

            <input
              type="text"
              value={query}
              onChange={onChangeValue}
              onFocus={handlerFocus}
              onKeyDown={handleKeyDown}
              placeholder=""
              className="flex-1 bg-transparent outline-none border-none text-base min-w-0"
            />

            <div className="flex items-center gap-4 ml-2 shrink-0">
              <button
                title="Recherche vocale"
                className="text-muted-foreground hover:text-muted-foreground transition"
              >
                <Mic className="h-5 w-5" />
              </button>
              <button
                title="Recherche d'image"
                className="text-muted-foreground hover:text-muted-foreground transition"
              >
                <Camera className="h-5 w-5" />
              </button>
              <Button
                title="Recherche"
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
          {/* Ligne de séparation supérieure */}
          <div className="mx-4 border-t bg-border" />

          {/* Conteneur principal Flex au lieu de Grid */}
          <div className="flex w-full py-3 px-1 max-h-[60vh] overflow-x-hidden overflow-y-auto">
            {/* Colonne Gauche : Historique */}
            {/* S'anime de w-full à w-1/2 quand un élément est sélectionné */}
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
                      setQuery(label);
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

            {/* Colonne Droite : Détails */}
            {/* S'anime de w-0 à w-1/2, cache son contenu quand elle est fermée */}
            <div
              className={cn(
                "transition-all duration-300 ease-in-out flex flex-col overflow-hidden shrink-0",
                activeIndex >= 0
                  ? "w-full md:w-1/2 opacity-100 border-l border-zinc-700/40 md:pl-2"
                  : "w-0 opacity-0 border-transparent pl-0",
              )}
            >
              {/* 
                L'astuce anti-écrasement : on donne une largeur fixe au contenu interne basée sur la popover.
                Ainsi le conteneur parent révèle le contenu comme un masque pendant son animation.
              */}
              <div className="w-[calc(var(--radix-popover-trigger-width)*0.5-20px)] h-full">
                {activeIndex >= 0 && renderDetail && (
                  <div className="flex flex-col px-4 pt-4 pb-1 h-full animate-in fade-in slide-in-from-right-8 duration-300">
                    <div className="flex items-center gap-2 mb-4 text-muted-foreground">
                      <Info className="h-4 w-4" />
                      <span className="text-xs font-medium uppercase tracking-wider">
                        Aperçu de la recherche
                      </span>
                    </div>

                    {renderDetail(indexItem)}

                    <p className="text-xs text-right text-muted-foreground mt-auto pt-4">
                      Appuyez sur{" "}
                      <kbd className="bg-accent-foreground/20 px-1.5 py-0.5 rounded-md font-mono text-[10px]">
                        Entrée
                      </kbd>{" "}
                      pour rechercher
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

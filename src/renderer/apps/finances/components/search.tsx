import React, { useRef, useState } from "react";
import { Search, Mic, Camera, Clock, Info } from "lucide-react";
import { cn } from "@/renderer/utils";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover";
import { Button } from "@/renderer/components/ui/button";

const RECENT_SEARCHES = [
  { text: "drizzle sqlite config", modeIA: false },
  { text: "electron-vite", modeIA: false },
  { text: "drizzle sqlite condif", modeIA: true },
  { text: "pos printer simulator", modeIA: true },
  {
    text: "lunix mint lorsque j'aissie de restorere les donnes supprimee cela orend beaucoup de temp",
    modeIA: true,
  },
  { text: "zodjs", modeIA: false },
  { text: "gem expert en code ui shadcn", modeIA: false },
  { text: "github download folder", modeIA: false },
  { text: "k", modeIA: false },
  { text: "yarn clear cache", modeIA: true },
];

export const GoogleSearchInput = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [query, setQuery] = useState<string>("");
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev < RECENT_SEARCHES.length - 1 ? prev + 1 : prev,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > -1 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0) {
        setQuery(RECENT_SEARCHES[activeIndex].text);
      }
      setIsOpen(false);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setActiveIndex(-1);
    }
  };

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
            onClick={() => setIsOpen(true)}
          >
            <Search className="text-muted-foreground h-5 w-5 mr-3 shrink-0" />

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsOpen(true)}
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
          onOpenAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={(e) => {
            if (containerRef.current?.contains(e.target as Node)) {
              e.preventDefault();
            }
          }}
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
              {RECENT_SEARCHES.map((item, index) => (
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
                    setQuery(item.text);
                    setIsOpen(false);
                  }}
                >
                  <Clock className="text-muted-foreground h-4 w-4 mr-4 mt-1 shrink-0" />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-muted-foreground text-sm font-normal truncate">
                      {item.text}
                    </span>
                    {item.modeIA && (
                      <span className="text-muted-foreground text-[11px] mt-0.5">
                        Mode IA
                      </span>
                    )}
                  </div>
                </div>
              ))}
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
                {activeIndex >= 0 && (
                  <div className="flex flex-col p-4 h-full animate-in fade-in slide-in-from-right-8 duration-300">
                    <div className="flex items-center gap-2 mb-4 text-muted-foreground">
                      <Info className="h-4 w-4" />
                      <span className="text-xs font-medium uppercase tracking-wider">
                        Aperçu de la recherche
                      </span>
                    </div>

                    <h3 className="text-lg font-medium leading-tight mb-3 break-words text-foreground">
                      {RECENT_SEARCHES[activeIndex].text}
                    </h3>

                    {RECENT_SEARCHES[activeIndex].modeIA && (
                      <span className="inline-flex items-center rounded-md bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-400 ring-1 ring-inset ring-blue-500/20 w-fit mb-4">
                        Généré par l'IA
                      </span>
                    )}

                    <p className="text-sm text-muted-foreground mt-auto pt-4">
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
};

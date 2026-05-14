"use client";

import { Search, X, ChevronDown, Layers } from "lucide-react";
import { SECTION_OPTIONS } from "@/packages/@core/data-access/db/options";
import { Button } from "@/renderer/components/ui/button";
import { Input } from "@/renderer/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/renderer/components/ui/dropdown-menu";

interface ClassroomSidebarHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  selectedSection: string;
  onSectionChange: (section: string) => void;
  currentSectionLabel: string;
}

export const ClassroomSidebarHeader = ({
  searchTerm,
  onSearchChange,
  onClearSearch,
  selectedSection,
  onSectionChange,
  currentSectionLabel,
}: ClassroomSidebarHeaderProps) => {
  return (
    <div className="space-y-2 p-1">
      <div className="relative group">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/50 group-focus-within:text-primary/60 transition-colors" />
        <Input
          placeholder="Rechercher une classe..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8 h-8 text-xs bg-muted/40 border-none focus-visible:ring-1 focus-visible:ring-primary/30 transition-all placeholder:text-muted-foreground/50"
        />
        {searchTerm && (
          <button
            onClick={onClearSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground p-1 transition-colors"
            aria-label="Effacer la recherche"
          >
            <X className="size-3" />
          </button>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-8 justify-between px-2 text-[11px] font-medium border border-border/40 bg-background/50 hover:bg-muted/50 transition-all shadow-sm"
          >
            <span className="flex items-center gap-2 truncate">
              <Layers className="size-3 text-muted-foreground/70" />
              {currentSectionLabel}
            </span>
            <ChevronDown className="size-3 opacity-40 shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[200px]"
          align="start"
        >
          <DropdownMenuLabel className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/70">
            Filtrer par Section
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            value={selectedSection}
            onValueChange={onSectionChange}
          >
            <DropdownMenuRadioItem
              value="all"
              className="text-xs cursor-pointer"
            >
              Toutes les sections
            </DropdownMenuRadioItem>
            {SECTION_OPTIONS.map((opt) => (
              <DropdownMenuRadioItem
                key={opt.value}
                value={opt.value}
                className="text-xs cursor-pointer"
              >
                {opt.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

"use client";

import { SearchIcon, XIcon, ChevronDownIcon, LayersIcon } from "lucide-react";
import { SECTION_OPTIONS } from "@/packages/@core/data-access/db/options";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";

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
    <div className="flex flex-col gap-2 p-1">
      {/* Zone de recherche unifiée via InputGroup */}
      <InputGroup>
        <InputGroupAddon>
          <SearchIcon className="text-muted-foreground" />
        </InputGroupAddon>
        <InputGroupInput
          placeholder="Rechercher une classe..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchTerm && (
          <InputGroupAddon align="end">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClearSearch}
              aria-label="Effacer la recherche"
            >
              <XIcon />
            </Button>
          </InputGroupAddon>
        )}
      </InputGroup>

      {/* Selecteur de section par DropdownMenu */}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-between"
            >
              <span className="flex items-center gap-2 truncate">
                <LayersIcon data-icon="inline-start" />
                <span className="truncate">{currentSectionLabel}</span>
              </span>
              <ChevronDownIcon data-icon="inline-end" />
            </Button>
          }
        ></DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-(--radix-dropdown-menu-trigger-width) min-w-48"
          align="start"
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">
              Filtrer par Section
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuRadioGroup
              value={selectedSection}
              onValueChange={onSectionChange}
            >
              <DropdownMenuRadioItem value="all" className="cursor-pointer">
                Toutes les sections
              </DropdownMenuRadioItem>
              {SECTION_OPTIONS.map((opt) => (
                <DropdownMenuRadioItem
                  key={opt.value}
                  value={opt.value}
                  className="cursor-pointer"
                >
                  {opt.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

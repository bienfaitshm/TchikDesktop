"use client";

import { SubNavItem } from "@/components/sidebars";
import { useNavigate } from "react-router";
import { ChevronLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Localroom } from "@/packages/@core/data-access/db";

interface LocalroomSidebarProps {
  localrooms: Localroom[];
  to: (classId: string) => string;
}

export const LocalroomNavItems = ({
  localrooms,
  to,
}: LocalroomSidebarProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <div className="flex flex-col gap-4 border-b bg-sidebar/50 p-4 shrink-0">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            aria-label="Retourner à la page précédente"
          >
            <ChevronLeftIcon className="size-4" />
          </Button>
          <h2 className="truncate text-sm font-semibold leading-none tracking-tight">
            Locaux
          </h2>
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="flex flex-col gap-6 py-4">
          <div className="flex flex-col gap-0.5 px-2">
            {localrooms.map((localroom) => (
              <SubNavItem
                to={to(localroom.localroomId)}
                key={localroom.localroomId}
              >
                {localroom.name ?? localroom?.roomName}
              </SubNavItem>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

LocalroomNavItems.displayName = "LocalroomNavItems";

"use client";

import { SubNavItem } from "@/components/sidebars";
import { useNavigate } from "react-router";
import { ChevronLeftIcon, SearchXIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useClassroomNavItem } from "./classroom-side.hooks";
import { ClassroomSidebarHeader } from "./classroom-side.header";
import type { Classroom } from "@/packages/@core/data-access/db/schemas";
import {
  getSectionLabel,
  SECTION_ENUM,
} from "@/packages/@core/data-access/db/options";

interface ClassroomSidebarProps {
  classrooms: Classroom[];
  to: (classId: string) => string;
}

export const ClassroomNavItems = ({
  classrooms,
  to,
}: ClassroomSidebarProps) => {
  const navigate = useNavigate();

  const {
    currentSectionLabel,
    filteredGroups,
    handleClearSearch,
    searchTerm,
    selectedSection,
    setSearchTerm,
    setSelectedSection,
  } = useClassroomNavItem(classrooms);

  const hasResults = filteredGroups.some((group) => group.data.length > 0);

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
            Classes
          </h2>
        </div>

        <ClassroomSidebarHeader
          searchTerm={searchTerm}
          selectedSection={selectedSection}
          currentSectionLabel={currentSectionLabel}
          onSearchChange={setSearchTerm}
          onClearSearch={handleClearSearch}
          onSectionChange={setSelectedSection}
        />
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="flex flex-col gap-6 py-4">
          {hasResults ? (
            filteredGroups.map(({ title, data }) => {
              if (data.length === 0) return null;

              return (
                <div key={title} className="flex flex-col gap-1.5">
                  {title && (
                    <div className="sticky top-0 -mx-1 bg-sidebar/40 px-6 py-1.5 backdrop-blur-sm">
                      <p className="text-xs font-semibold tracking-wider text-muted-foreground">
                        {getSectionLabel(title as SECTION_ENUM)}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col gap-0.5 px-2">
                    {data.map((classroom) => (
                      <SubNavItem
                        to={to(classroom.classId)}
                        key={classroom.classId}
                        className="text-xs"
                      >
                        {classroom.identifier}
                      </SubNavItem>
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            /* État vide propre (Pattern shadcn standard si <Empty /> n'est pas un composant custom) */
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                <SearchXIcon className="size-5 text-muted-foreground" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-semibold">Aucune classe trouvée</h3>
                <p className="text-xs text-muted-foreground">
                  {searchTerm
                    ? `Aucun résultat ne correspond à "${searchTerm}".`
                    : "Aucune classe n'est disponible pour le moment."}
                </p>
              </div>
              {searchTerm && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearSearch}
                  className="mt-2 text-xs rounded-full px-4"
                >
                  Réinitialiser la recherche
                </Button>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

ClassroomNavItems.displayName = "ClassroomNavItems";

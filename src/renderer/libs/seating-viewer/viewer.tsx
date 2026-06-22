import React from "react";
import { Tabs as TabsPrimitive } from "radix-ui";
import type { Row } from "@tanstack/react-table";
import { LayoutGrid } from "lucide-react"; // Ajout d'icônes pour l'UI
import {
  enhanceColumnsExpandable,
  seatingStudentColumns,
} from "@/renderer/components/tables/columns";
import {
  DataContentBody,
  DataContentHead,
  DataTable,
  DataTableContent,
  DataTablePagination,
  DataTableToolbar,
  SearchTableToolbar,
  FilteredTableToolbarContainer,
  TableFacetedFilterItem,
  DataTableColumnToggle,
} from "@/renderer/components/tables/data-table";
import { ExpandableRow } from "@/renderer/components/tables/data-table.expandable";
import { Tabs, TabsContent, TabsList } from "@/renderer/components/ui/tabs";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/renderer/components/ui/item";

import { getStudentPlacementDetails, RoomState } from "./utils";
import { Separator } from "@/renderer/components/ui/separator";
import { cn } from "@/renderer/utils";
import { GENDER_OPTIONS } from "@/packages/@core/data-access/db/options";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/renderer/components/ui/tooltip";

type SeatingViewerProps = {
  rooms: RoomState[];
  classroomOptions?: { label: string; value: string }[];
};

export const SeatingViewer: React.FC<SeatingViewerProps> = ({
  rooms,
  classroomOptions = [],
}) => {
  if (!rooms || rooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-100 border-2 border-dashed rounded-lg">
        <LayoutGrid className="h-10 w-10 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">
          Aucun local disponible pour cette session.
        </p>
      </div>
    );
  }

  return (
    <Tabs
      defaultValue={rooms[0]?.roomId}
      orientation="vertical"
      className="flex flex-col md:flex-row w-full min-h-150 gap-6"
    >
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-72 flex flex-col gap-4">
        <div className="px-2 py-1">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">
            Locaux de l'examen
          </h3>
          <TabsList className="flex flex-col h-auto w-full justify-start bg-transparent p-0 gap-2">
            {rooms.map((room) => {
              const occupancy = room.occupancyRate ?? 0;
              const isWarning = occupancy > 0.8 && !room.isOverloaded;
              const isCritical = room.isOverloaded;

              const statusInfo = {
                color: "bg-emerald-500 raw-shadow-emerald",
                label: "Capacité optimale",
              };

              if (isCritical) {
                statusInfo.color = "bg-destructive animate-pulse";
                statusInfo.label = "Capacité saturée (Surcharge)";
              } else if (isWarning) {
                statusInfo.color = "bg-amber-500";
                statusInfo.label = `Taux d'occupation élevé (${Math.round(occupancy * 100)}%)`;
              }

              return (
                <TabsPrimitive.TabsTrigger
                  key={room.roomId}
                  value={room.roomId}
                  asChild
                  className="w-full data-[state=active]:border-border hover:bg-accent transition-colors"
                >
                  <Item className="flex items-center justify-between p-2 cursor-pointer group">
                    <ItemContent className="space-y-1 text-left">
                      <ItemTitle className="text-sm font-medium tracking-tight text-foreground">
                        {room.roomName}
                      </ItemTitle>
                      <ItemDescription className="text-xs text-muted-foreground tabular-nums">
                        {room.studentCount} / {room.maxCapacity} étudiants
                      </ItemDescription>
                    </ItemContent>

                    <ItemActions>
                      <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            aria-label={statusInfo.label}
                            className="flex items-center justify-center p-1 rounded-full hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <span
                              className={cn(
                                "h-2 w-2 rounded-full transition-all",
                                statusInfo.color,
                              )}
                            />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent
                          side="left"
                          className="text-xs font-medium"
                        >
                          {statusInfo.label}
                        </TooltipContent>
                      </Tooltip>
                    </ItemActions>
                  </Item>
                </TabsPrimitive.TabsTrigger>
              );
            })}
          </TabsList>
        </div>
      </aside>

      <Separator orientation="vertical" className="hidden md:block h-auto" />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col gap-6">
        {rooms.map((room) => (
          <TabsContent
            key={room.roomId}
            value={room.roomId}
            className="mt-0 focus-visible:ring-0 outline-hidden space-y-4"
          >
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                {room.roomName}
              </h2>
              <p className="text-muted-foreground">
                Visualisation de la liste des éleves assignés.
              </p>
            </div>

            <SeatingViewTable room={room} classroomOptions={classroomOptions} />
          </TabsContent>
        ))}
      </main>
    </Tabs>
  );
};

type SeatingViewTableProps = {
  room?: RoomState;
  classroomOptions?: { label: string; value: string }[];
};

export const SeatingViewTable: React.FC<SeatingViewTableProps> = ({
  room,
  classroomOptions = [],
}) => {
  return (
    <DataTable<any>
      data={getStudentPlacementDetails(room?.seatingPlan ?? [])}
      columns={enhanceColumnsExpandable(seatingStudentColumns)}
      keyExtractor={(item) => item.schoolId}
    >
      <DataTableToolbar>
        <FilteredTableToolbarContainer>
          <SearchTableToolbar
            searchColumn="fullName"
            placeholder="Recherche Ex. KALUMBA"
          />
          <TableFacetedFilterItem
            title="Genre"
            columnId="gender"
            options={GENDER_OPTIONS}
          />
          <TableFacetedFilterItem
            title="Classe"
            columnId="identifier"
            options={classroomOptions}
          />
        </FilteredTableToolbarContainer>
        <div className="flex items-center gap-4">
          <DataTableColumnToggle />
        </div>
      </DataTableToolbar>

      <DataTableContent>
        <DataContentHead />
        <DataContentBody<any>>
          {({ row }) => (
            <ExpandableRow
              row={row as Row<unknown>}
              renderDetail={
                <div className="p-4 bg-muted/20 rounded-md w-full text-center">
                  Aucun détails supplémentaires de l'étudiant pour l'instant...
                </div>
              }
            />
          )}
        </DataContentBody>
      </DataTableContent>

      <div className="mt-4">
        <DataTablePagination />
      </div>
    </DataTable>
  );
};

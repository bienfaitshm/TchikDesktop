import React from "react";
import type { Row } from "@tanstack/react-table";
import { DoorOpen, Users, LayoutGrid } from "lucide-react"; // Ajout d'icônes pour l'UI
import {
  enhanceColumnsExpandable,
  SeatingStudentColumns,
} from "@/renderer/components/tables/columns";
import {
  DataContentBody,
  DataContentHead,
  DataTable,
  DataTableContent,
  DataTablePagination,
  DataTableToolbar,
} from "@/renderer/components/tables/data-table";
import { ExpandableRow } from "@/renderer/components/tables/data-table.expandable";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/renderer/components/ui/tabs";
import { getStudentPlacementDetails, RoomState } from "./utils";
import { Badge } from "@/renderer/components/ui/badge";
import { Card } from "@/renderer/components/ui/card";
import { Separator } from "@/renderer/components/ui/separator";

type SeatingViewerProps = {
  rooms: RoomState[];
};

export const SeatingViewer: React.FC<SeatingViewerProps> = ({ rooms }) => {
  if (!rooms || rooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] border-2 border-dashed rounded-lg">
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
      className="flex flex-col md:flex-row w-full min-h-[600px] gap-6"
    >
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 flex flex-col gap-4">
        <div className="px-2 py-1">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">
            Locaux de l'examen
          </h3>
          <TabsList className="flex flex-col h-auto w-full justify-start bg-transparent p-0 gap-1">
            {rooms.map((room) => (
              <TabsTrigger
                key={room.roomId}
                value={room.roomId}
                className="w-full justify-between items-center px-4 py-3 rounded-lg border border-transparent
                           data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-primary/20
                           hover:bg-muted/80 transition-all text-left shadow-none"
              >
                <div className="flex items-center gap-3">
                  <DoorOpen className="h-4 w-4" />
                  <span className="text-sm font-medium truncate max-w-[120px]">
                    {room.roomName}
                  </span>
                </div>
                <Badge
                  variant={room.studentCount > 0 ? "default" : "outline"}
                  className="ml-2 font-mono text-xs"
                >
                  {room.studentCount}
                </Badge>
              </TabsTrigger>
            ))}
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
            className="mt-0 focus-visible:ring-0 outline-none"
          >
            {/* Header de la salle sélectionnée - Amélioration UX */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  {room.roomName}
                </h2>
                <p className="text-muted-foreground">
                  Gestion du plan de salle et liste des étudiants assignés.
                </p>
              </div>

              <div className="flex gap-4">
                <Card className="px-4 py-2 flex items-center gap-3 bg-muted/30">
                  <Users className="h-4 w-4 text-primary" />
                  <div className="flex flex-col justify-center items-center">
                    <p className="text-[10px] uppercase text-muted-foreground font-bold">
                      Assignés
                    </p>
                    <p className="text-lg font-semibold leading-none">
                      {room.studentCount}
                    </p>
                  </div>
                </Card>
              </div>
            </div>

            <Card className="border-none shadow-none bg-background">
              <SeatingViewTable room={room} />
            </Card>
          </TabsContent>
        ))}
      </main>
    </Tabs>
  );
};

type SeatingViewTableProps = {
  room?: RoomState;
};

export const SeatingViewTable: React.FC<SeatingViewTableProps> = ({ room }) => {
  return (
    <DataTable<any>
      data={getStudentPlacementDetails(room?.seatingPlan ?? [])}
      columns={enhanceColumnsExpandable(SeatingStudentColumns)}
      keyExtractor={(item) => item.schoolId}
    >
      <div className="flex items-center justify-between mb-4">
        <DataTableToolbar searchColumn="fullName" />
        {/* On pourrait ajouter ici un bouton d'export ou d'impression */}
      </div>

      <DataTableContent>
        <DataContentHead />
        <DataContentBody<any>>
          {({ row }) => (
            <ExpandableRow
              row={row as Row<unknown>}
              renderDetail={
                <div className="p-4 bg-muted/20 rounded-md">
                  Détails supplémentaires de l'étudiant...
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

"use client";

import * as React from "react";
import { Plus, Pencil, Copy, Trash2 } from "lucide-react";
import { useGetLocalRooms } from "@/renderer/libs/queries/seatings";
import type { Localroom } from "@/packages/@core/data-access/db/schemas";
import { Button } from "@/renderer/components/ui/button";
import { Suspense } from "@/renderer/libs/queries/suspense";
import {
  DataTable,
  DataContentBody,
  DataContentHead,
  DataTableContent,
  DataTablePagination,
  DataTableToolbar,
  SearchTableToolbar,
  DataTableColumnToggle,
} from "@/renderer/components/tables/data-table";
import {
  localRoomColumns,
  enhanceColumnsExpandable,
} from "@/renderer/components/tables/columns";
import { ExpandableRow } from "@/renderer/components/tables/data-table.expandable";
import {
  CreateLocalRoomDialog,
  DeleteLocalRoomDialog,
  UpdateLocalRoomDialog,
  type LocalRoomDialogProps,
} from "@/renderer/dialog-actions/localroom.dialog-action";
import { useSchoolContext } from "@/renderer/hooks/app-config-router";
import { PageShell } from "@/renderer/screens/layouts/page-shell.layout";
import {
  createActionMenus,
  type ActionMenuConfig,
} from "@/components/menus/action-menus";
import type { Row } from "@tanstack/react-table";

export interface LocalRoomRowActionsProps extends Pick<
  LocalRoomDialogProps,
  "mutationKey"
> {
  room: Localroom;
}

const MENUS: ActionMenuConfig<LocalRoomRowActionsProps>[] = [
  {
    id: "edit",
    label: "Modifier les infos du local",
    icon: Pencil,
    dialog({ room, mutationKey }) {
      return (
        <UpdateLocalRoomDialog
          mutationKey={mutationKey}
          localroomId={room.localroomId}
          defaultValues={room}
        />
      );
    },
  },
  {
    id: "duplicate",
    label: "Dupliquer",
    icon: Copy,
    dialog({ room, mutationKey }) {
      return (
        <CreateLocalRoomDialog mutationKey={mutationKey} defaultValues={room} />
      );
    },
  },
  {
    id: "delete",
    label: "Supprimer",
    icon: Trash2,
    separator: true,
    variant: "destructive",
    dialog({ room, mutationKey }) {
      return (
        <DeleteLocalRoomDialog
          mutationKey={mutationKey}
          localRoomId={room.localroomId}
          roomName={room.name}
        />
      );
    },
  },
];

/**
 * Renders contextual action menus for a given local room row.
 * @param props - Component properties containing the room entity and mutation key.
 * @returns The rendered action menu component.
 */
export const LocalRoomRowAction: React.FC<LocalRoomRowActionsProps> =
  createActionMenus(MENUS);

/**
 * Main application screen component for viewing and managing physical rooms and facilities.
 * @returns Rendered local room management page layout with data table and toolbars.
 */
export const LocalRoomPage: React.FC = () => {
  const { schoolId } = useSchoolContext();
  const { data: rawLocalRooms, queryKey: mutationKey } = useGetLocalRooms({
    where: { schoolId },
  });
  const localRooms = React.useMemo(() => rawLocalRooms ?? [], [rawLocalRooms]);
  const columns = React.useMemo(
    () => enhanceColumnsExpandable(localRoomColumns),
    [],
  );

  return (
    <div className="h-[calc(100vh-64px)] w-full overflow-hidden">
      <PageShell
        maxWidth="xl"
        header={
          <section className="container flex items-center justify-between w-full max-w-(--breakpoint-2xl) my-4">
            <header className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight">
                  Gestion des locaux
                </h1>
              </div>
              <p className="text-sm text-muted-foreground">
                Administrez les salles physiques, laboratoires et amphithéâtres.
              </p>
            </header>
          </section>
        }
      >
        <DataTable<Localroom>
          data={localRooms}
          columns={columns}
          keyExtractor={(item) => item.localroomId}
        >
          <DataTableToolbar>
            <SearchTableToolbar
              searchColumn="name"
              placeholder="Recherche Ex. Local 1"
            />
            <div className="flex items-center gap-4">
              <DataTableColumnToggle />
              <CreateLocalRoomDialog
                defaultValues={{ schoolId }}
                mutationKey={mutationKey}
              >
                <Button size="sm" className="rounded-full shadow-xs">
                  <Plus className="size-4 mr-2" />
                  <span>Ajouter un local</span>
                </Button>
              </CreateLocalRoomDialog>
            </div>
          </DataTableToolbar>

          <Suspense
            fallback={
              <div className="h-64 w-full animate-pulse bg-muted/10 rounded-xl border border-dashed" />
            }
          >
            <DataTableContent>
              <DataContentHead />
              <DataContentBody<Localroom>>
                {({ row }) => (
                  <ExpandableRow
                    row={row as Row<unknown>}
                    renderDetail={
                      <LocalRoomRowAction
                        mutationKey={mutationKey}
                        room={row.original}
                      />
                    }
                  />
                )}
              </DataContentBody>
            </DataTableContent>
            <DataTablePagination />
          </Suspense>
        </DataTable>
      </PageShell>
    </div>
  );
};

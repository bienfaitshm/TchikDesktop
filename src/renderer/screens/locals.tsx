"use client";

import React, { useMemo } from "react";
import { Plus } from "lucide-react";
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
} from "@/renderer/components/tables/data-table";
import {
  localRoomColumns,
  enhanceColumnsExpandable,
} from "@/renderer/components/tables/columns";
import { ExpandableRow } from "@/renderer/components/tables/data-table.expandable";
import {
  ActionContainer,
  ActionTileCopy,
  ActionTileDelete,
  ActionTileEdit,
} from "@/renderer/components/tables/data-table.action-tiles";

import {
  CreateLocalRoomDialog,
  DeleteLocalRoomDialog,
  UpdateLocalRoomDialog,
  type LocalRoomDialogProps,
} from "@/renderer/dialog-actions/localroom.dialog-action";
import { useSchoolContext } from "@/renderer/hooks/app-config-router";
import { PageShell } from "@/renderer/screens/layouts/page-shell.layout";

const columns = enhanceColumnsExpandable(localRoomColumns);

interface LocalRoomRowActionsProps extends Pick<
  LocalRoomDialogProps,
  "mutationKey"
> {
  room: Localroom;
}

/**
 * @description Actions disponibles pour chaque ligne de local (salle).
 * Mémoïsé pour empêcher les recalculs lors du filtrage ou du scroll de la DataTable.
 */
const LocalRoomRowActions: React.FC<LocalRoomRowActionsProps> = React.memo(
  ({ room, mutationKey }) => {
    return (
      <ActionContainer className="md:grid-cols-3">
        {/* Modification : Alignement des props de initialData vers defaultValues */}
        <UpdateLocalRoomDialog
          localRoomId={room.localroomId}
          defaultValues={room}
          mutationKey={mutationKey}
        >
          <ActionTileEdit />
        </UpdateLocalRoomDialog>

        {/* Duplication pour créer rapidement une salle similaire */}
        <CreateLocalRoomDialog defaultValues={room} mutationKey={mutationKey}>
          <ActionTileCopy />
        </CreateLocalRoomDialog>

        {/* Suppression du local : Remplacement du Render Props par un clone direct */}
        <DeleteLocalRoomDialog
          localRoomId={room.localroomId}
          roomName={room.name}
          mutationKey={mutationKey}
        >
          <ActionTileDelete />
        </DeleteLocalRoomDialog>
      </ActionContainer>
    );
  },
);

LocalRoomRowActions.displayName = "LocalRoomRowActions";

export const LocalRoomPage = () => {
  const { schoolId } = useSchoolContext();

  const { data: rawLocalRooms, queryKey: mutationKey } = useGetLocalRooms({
    where: { schoolId },
  });
  const localRooms = useMemo(() => rawLocalRooms ?? [], [rawLocalRooms]);

  return (
    <div className="h-[calc(100vh-64px)] w-full overflow-hidden">
      <PageShell
        maxWidth="2xl"
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

            <CreateLocalRoomDialog
              defaultValues={{ schoolId }}
              mutationKey={mutationKey}
            >
              <Button size="sm" className="rounded-full shadow-xs">
                <Plus className="size-4 mr-2" />
                <span>Ajouter un local</span>
              </Button>
            </CreateLocalRoomDialog>
          </section>
        }
      >
        <DataTable<Localroom>
          data={localRooms}
          columns={columns}
          keyExtractor={(item) => item.localroomId}
        >
          <DataTableToolbar searchColumn="name" />

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
                    row={row as any}
                    renderDetail={
                      <LocalRoomRowActions
                        room={row.original}
                        mutationKey={mutationKey}
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

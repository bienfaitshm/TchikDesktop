"use client";

import React, { useMemo } from "react";
import { Plus } from "lucide-react";

import type { TLocalRoomAttributes as TLocalRoom } from "@/packages/@core/data-access/schema-validations";
import { useGetLocalRooms } from "@/renderer/libs/queries/seating";

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
  "queryKeysToInvalidate"
> {
  room: TLocalRoom;
}

/**
 * @description Actions disponibles pour chaque ligne de local (salle).
 * Mémoïsé pour empêcher les recalculs lors du filtrage ou du scroll de la DataTable.
 */
const LocalRoomRowActions: React.FC<LocalRoomRowActionsProps> = React.memo(
  ({ room, queryKeysToInvalidate }) => {
    return (
      <ActionContainer className="md:grid-cols-3">
        {/* Modification : Alignement des props de initialData vers defaultValues */}
        <UpdateLocalRoomDialog
          localRoomId={room.localRoomId}
          defaultValues={room}
          queryKeysToInvalidate={queryKeysToInvalidate}
        >
          <ActionTileEdit />
        </UpdateLocalRoomDialog>

        {/* Duplication pour créer rapidement une salle similaire */}
        <CreateLocalRoomDialog
          defaultValues={room}
          queryKeysToInvalidate={queryKeysToInvalidate}
        >
          <ActionTileCopy />
        </CreateLocalRoomDialog>

        {/* Suppression du local : Remplacement du Render Props par un clone direct */}
        <DeleteLocalRoomDialog
          localRoomId={room.localRoomId}
          roomName={room.name}
          queryKeysToInvalidate={queryKeysToInvalidate}
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

  const { data: rawLocalRooms, queryKey: queryKeysToInvalidate } =
    useGetLocalRooms({ where: { schoolId } });
  const localRooms = useMemo(() => rawLocalRooms ?? [], [rawLocalRooms]);

  return (
    <div className="h-[calc(100vh-64px)] w-full overflow-hidden">
      <PageShell
        maxWidth="2xl"
        header={
          <section className="container flex items-center justify-between w-full max-w-screen-2xl my-4">
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
              queryKeysToInvalidate={queryKeysToInvalidate}
            >
              <Button size="sm" className="rounded-full shadow-sm">
                <Plus className="size-4 mr-2" />
                <span>Ajouter un local</span>
              </Button>
            </CreateLocalRoomDialog>
          </section>
        }
      >
        <DataTable<TLocalRoom>
          data={localRooms}
          columns={columns}
          keyExtractor={(item) => item.localRoomId}
        >
          <DataTableToolbar searchColumn="name" />

          <Suspense
            fallback={
              <div className="h-64 w-full animate-pulse bg-muted/10 rounded-xl border border-dashed" />
            }
          >
            <DataTableContent>
              <DataContentHead />
              <DataContentBody<TLocalRoom>>
                {({ row }) => (
                  <ExpandableRow
                    row={row as any}
                    renderDetail={
                      <LocalRoomRowActions
                        room={row.original}
                        queryKeysToInvalidate={queryKeysToInvalidate}
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

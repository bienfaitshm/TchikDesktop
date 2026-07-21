"use client";

import * as React from "react";
import { Plus, Pencil, Copy, Trash2 } from "lucide-react";
import { useGetLocalRooms } from "@/renderer/libs/queries/seatings";
import type { Localroom } from "@/packages/@core/data-access/db/schemas";
import { Button } from "@/renderer/components/ui/button";
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
  enhanceColumns,
  localRoomColumns,
} from "@/renderer/components/tables/columns";
import {
  CreateLocalRoomDialog,
  DeleteLocalRoomDialog,
  UpdateLocalRoomDialog,
  type LocalRoomDialogProps,
} from "@/renderer/dialog-actions/localroom.dialog-action";
import { useSchoolContext } from "@/renderer/hooks/app-config-router";
import {
  createActionMenus,
  type ActionMenuConfig,
} from "@/components/menus/action-menus";
import {
  PageContainer,
  PageHeader,
  PageHeaderTextContent,
  PageHeadTitle,
  PageHeadDescription,
  PageContent,
} from "@/renderer/containers/page-container";

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
          id={room.localroomId}
          name={room.name}
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
    where: { localrooms: { schoolId: { $eq: schoolId } } },
  });
  const localRooms = React.useMemo(() => rawLocalRooms ?? [], [rawLocalRooms]);
  const columns = React.useMemo(
    () =>
      enhanceColumns(localRoomColumns, {
        variant: "actions",
        renderRowAction: (room) => (
          <LocalRoomRowAction room={room} mutationKey={mutationKey} />
        ),
      }),
    [mutationKey],
  );

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderTextContent>
          <PageHeadTitle> Gestion des locaux</PageHeadTitle>
          <PageHeadDescription>
            Administrez les salles physiques, laboratoires et amphithéâtres.
          </PageHeadDescription>
        </PageHeaderTextContent>
      </PageHeader>
      <PageContent>
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
          <DataTableContent>
            <DataContentHead />
            <DataContentBody />
          </DataTableContent>
          <DataTablePagination />
        </DataTable>
      </PageContent>
    </PageContainer>
  );
};

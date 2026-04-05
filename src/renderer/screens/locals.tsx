import React, { useMemo } from "react";
import { Plus, School } from "lucide-react";

import type { TLocalRoomAttributes as TLocalRoom } from "@/packages/@core/data-access/schema-validations";
import { useGetLocalRooms } from "@/renderer/libs/queries/seating";

import { Button } from "@/renderer/components/ui/button";
import { Suspense } from "@/renderer/libs/queries/suspense";
import { withSchoolConfig } from "@/renderer/hooks/with-application-config";

import {
    DataTable,
    DataContentBody,
    DataContentHead,
    DataTableContent,
    DataTablePagination,
    DataTableToolbar,
} from "@/renderer/components/tables/data-table";
// Pense à renommer ou adapter ton fichier de colonnes pour les locaux
import { LocalRoomColumns } from "@/renderer/components/tables/columns.local-rooms";
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
    UpdateLocalRoomDialog
} from "@/renderer/dialog-actions/localroom.dialog-action";

type TWithSchool = Pick<TLocalRoom, "schoolId">;

/**
 * Actions disponibles pour chaque ligne de local (salle).
 */
const LocalRoomRowActions: React.FC<{
    room: TLocalRoom;
}> = ({ room }) => {
    const initialData = useMemo(() => ({ ...room }), [room]);

    return (
        <ActionContainer className="md:grid-cols-3">
            {/* Modification des dimensions ou du nom */}
            <UpdateLocalRoomDialog localRoomId={room.localRoomId} initialData={initialData}>
                <ActionTileEdit />
            </UpdateLocalRoomDialog>

            {/* Duplication pour créer rapidement une salle similaire */}
            <CreateLocalRoomDialog defaultValues={initialData}>
                <ActionTileCopy />
            </CreateLocalRoomDialog>

            {/* Suppression du local */}
            <DeleteLocalRoomDialog
                localRoomId={room.localRoomId}
                roomName={room.name}
            >
                {({ onOpen, isLoading }) => (
                    <ActionTileDelete onClick={onOpen} disabled={isLoading} />
                )}
            </DeleteLocalRoomDialog>
        </ActionContainer>
    );
};

const LocalRoomManagementPage: React.FC<TWithSchool> = ({ schoolId }) => {
    const { data: localRooms = [] } = useGetLocalRooms({ where: { schoolId } });

    return (
        <main className="my-10 mx-auto h-full container max-w-screen-2xl">
            <DataTable<TLocalRoom>
                data={localRooms}
                columns={LocalRoomColumns}
                keyExtractor={(item) => item.localRoomId}
            >
                <DataTableToolbar className="justify-between">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <School className="size-5 text-primary" />
                            <h1 className="text-xl font-semibold tracking-tight">Gestion des locaux</h1>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Administrez les salles physiques, laboratoires et amphithéâtres.
                        </p>
                    </div>

                    <CreateLocalRoomDialog defaultValues={{ schoolId }}>
                        <Button size="sm" className="rounded-full shadow-sm">
                            <Plus className="size-4 mr-2" />
                            <span>Ajouter un local</span>
                        </Button>
                    </CreateLocalRoomDialog>
                </DataTableToolbar>

                <Suspense fallback={<div className="h-64 w-full animate-pulse bg-muted/10 rounded-xl border border-dashed" />}>
                    <DataTableContent>
                        <DataContentHead />
                        <DataContentBody<TLocalRoom>>
                            {(props) => (
                                <ExpandableRow
                                    row={props.row as any}
                                    renderDetail={
                                        <LocalRoomRowActions
                                            room={props.row.original}
                                        />
                                    }
                                />
                            )}
                        </DataContentBody>
                    </DataTableContent>
                    <DataTablePagination />
                </Suspense>
            </DataTable>
        </main>
    );
};

/**
 * Point d'entrée avec protection Suspense globale pour la page.
 */
const LocalRoomEntry: React.FC<TWithSchool> = (props) => {
    return (
        <Suspense>
            <LocalRoomManagementPage {...props} />
        </Suspense>
    );
};

export const LocalRoomSreen = withSchoolConfig(LocalRoomEntry);
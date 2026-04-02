import React, { useMemo } from "react";
import { Plus } from "lucide-react";

import type { TOptionAttributes as TOption } from "@/packages/@core/data-access/schema-validations";
import { useGetOptions } from "@/renderer/libs/queries/option";

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
import { OptionColumns } from "@/renderer/components/tables/columns.options";
import { ExpandableRow } from "@/renderer/components/tables/data-table.components";
import {
    ActionContainer,
    ActionTileCopy,
    ActionTileDelete,
    ActionTileEdit,
} from "@/renderer/components/tables/data-table.action-tiles";

import {
    CreateOptionDialog,
    DeleteOptionDialog,
    UpdateOptionDialog
} from "@/renderer/dialog-actions/option.dialog-actions";

type TWithSchool = Pick<TOption, "schoolId">;

/**
 * Actions disponibles pour chaque ligne de la table.
 */
const OptionRowActions: React.FC<{
    option: TOption;
}> = ({ option }) => {
    const initialData = useMemo(() => ({ ...option }), [option]);

    return (
        <ActionContainer className="md:grid-cols-3">
            {/* Modification */}
            <UpdateOptionDialog optionId={option.optionId} initialData={initialData}>
                <ActionTileEdit />
            </UpdateOptionDialog>

            {/* Duplication / Création basée sur existant */}
            <CreateOptionDialog defaultValues={initialData}>
                <ActionTileCopy />
            </CreateOptionDialog>

            {/* Suppression */}
            <DeleteOptionDialog
                optionId={option.optionId}
                optionName={option.optionName}
                renderTrigger={({ open }) => <ActionTileDelete onClick={open} />}
            />
        </ActionContainer>
    );
};

const OptionManagementPage: React.FC<TWithSchool> = ({ schoolId }) => {
    const { data: options = [] } = useGetOptions({ where: { schoolId } });

    return (
        <main className="my-10 mx-auto h-full container max-w-screen-2xl">
            <DataTable<TOption>
                data={options}
                columns={OptionColumns}
                keyExtractor={(item) => item.optionId}
            >
                <DataTableToolbar className="justify-between">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-xl font-semibold tracking-tight">Gestion des filières</h1>
                        <p className="text-sm text-muted-foreground">
                            Administrez les options.
                        </p>
                    </div>

                    <CreateOptionDialog defaultValues={{ schoolId }}>
                        <Button size="sm" className="rounded-full">
                            <Plus className="size-4 mr-2" />
                            <span>Ajouter une filière</span>
                        </Button>
                    </CreateOptionDialog>
                </DataTableToolbar>

                <Suspense fallback={<div className="h-64 w-full animate-pulse bg-muted/20 rounded-lg" />}>
                    <DataTableContent>
                        <DataContentHead isCollapsible />
                        <DataContentBody<TOption>>
                            {(props) => (
                                <ExpandableRow
                                    {...props}
                                    detailContent={
                                        <OptionRowActions
                                            option={props.row.original}
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
 * Point d'entrée de la page avec protection Suspense.
 */
const OptionEntry: React.FC<TWithSchool> = (props) => {
    return (
        <Suspense>
            <OptionManagementPage {...props} />
        </Suspense>
    );
};

export const OptionPage = withSchoolConfig(OptionEntry);
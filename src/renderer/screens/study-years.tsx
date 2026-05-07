
import React from "react";
import { Button } from "@/renderer/components/ui/button";
import { Plus } from "lucide-react";
import { useGetStudyYears } from "@/renderer/libs/queries/school";
import type { TStudyYear } from "@/packages/@core/data-access/db/schemas/types";
import { Suspense } from "@/renderer/libs/queries/suspense"
import { LoadingSpinner } from "@/renderer/components/loaders/loading-spinner"
import {
    DataTable,
    DataContentBody,
    DataContentHead,
    DataTableContent,
    DataTablePagination,
    DataTableToolbar,
} from "@/renderer/components/tables/data-table"
import { enhanceColumnsExpandable, StudyYearColumns } from "@/renderer/components/tables/columns"
import { ExpandableRow } from "@/renderer/components/tables/data-table.expandable"
import {
    ActionContainer,
    ActionTileCopy,
    ActionTileDelete,
    ActionTileEdit,
} from "@/renderer/components/tables/data-table.action-tiles"

import {
    CreateOptionDialog,
    DeleteOptionDialog,
    UpdateOptionDialog
} from "@/renderer/dialog-actions/option.dialog-actions"

import type { Row } from "@tanstack/react-table"
import { useSchoolContext } from "../hooks/app-config-router"
import { PageShell } from "../components/layouts/page-shell.layout";


/**
 * Actions de ligne mémoïsées pour la performance.
 * Empêche le re-render massif lors du scroll ou du filtrage.
 */
const StudyYearRowActions = React.memo(({ studyYear }: { studyYear: TStudyYear }) => {
    // On stabilise les données initiales pour les formulaires d'édition
    const initialData = React.useMemo(() => ({ ...studyYear }), [studyYear.yearId])

    return (
        <ActionContainer className="lg:grid-cols-3">
            <UpdateOptionDialog optionId={studyYear.yearId} initialData={initialData}>
                <ActionTileEdit />
            </UpdateOptionDialog>

            <CreateOptionDialog defaultValues={initialData}>
                <ActionTileCopy />
            </CreateOptionDialog>

            <DeleteOptionDialog
                optionId={studyYear.yearId}
                optionName={studyYear.yearName}
            >
                {({ isLoading, onOpen }) => (
                    <ActionTileDelete onClick={onOpen} disabled={isLoading} />
                )}
            </DeleteOptionDialog>
        </ActionContainer>
    )
})
StudyYearRowActions.displayName = "StudyYearRowActions"

export const StudyYearPage = () => {
    const { schoolId } = useSchoolContext();
        const { data: studyYears = [] } = useGetStudyYears({ where: { schoolId } });


    return (
        <div className="h-[calc(100vh-64px)] w-full overflow-hidden">
        <PageShell maxWidth="2xl" header={
             <section className="container flex items-center justify-between w-full max-w-screen-2xl my-4 ">
                <header className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight">Gestion des années scolaire</h1>
                    <p className="text-sm text-muted-foreground">
                        Visualisez et administrez les ecoles.
                    </p>
                </header>

                <CreateOptionDialog defaultValues={{ schoolId }}>
                    <Button size="sm" className="rounded-full shadow-sm">
                        <Plus className="size-4" />
                        <span>Ajouter une année scolaire</span>
                    </Button>
                </CreateOptionDialog>
            </section>
        }>
            {/* Table de données avec architecture Compound Components */}
            <DataTable<TStudyYear>
                data={studyYears}
                columns={enhanceColumnsExpandable(StudyYearColumns)}
                keyExtractor={(item) => item.schoolId}
            >
                <DataTableToolbar searchColumn="yearName">
                </DataTableToolbar>

                <Suspense
                    fallback={
                        <div className="flex h-64 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/10">
                            <LoadingSpinner className="text-primary" />
                            <p className="text-sm text-muted-foreground animate-pulse">Chargement des années scolaires...</p>
                        </div>
                    }
                >
                    <DataTableContent>
                        <DataContentHead />
                        <DataContentBody<TStudyYear>>
                            {({ row }) => (
                                <ExpandableRow
                                    row={row as Row<unknown>}
                                    renderDetail={<StudyYearRowActions studyYear={row.original} />}
                                />
                            )}
                        </DataContentBody>
                    </DataTableContent>

                    <DataTablePagination />
                </Suspense>
            </DataTable>
        </PageShell>
        </div>
    )

    
}
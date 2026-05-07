import React, { useMemo } from "react";
import { Button } from "@/renderer/components/ui/button";
import { Plus } from "lucide-react";
import { useGetStudyYears } from "@/renderer/libs/queries/school"; // Ou ton dossier spécifique study-year
import type { TStudyYear } from "@/packages/@core/data-access/db/schemas/types";
import { Suspense } from "@/renderer/libs/queries/suspense";
import { LoadingSpinner } from "@/renderer/components/loaders/loading-spinner";

import {
    DataTable,
    DataContentBody,
    DataContentHead,
    DataTableContent,
    DataTablePagination,
    DataTableToolbar,
} from "@/renderer/components/tables/data-table";
import { enhanceColumnsExpandable, StudyYearColumns } from "@/renderer/components/tables/columns";
import { ExpandableRow } from "@/renderer/components/tables/data-table.expandable";
import {
    ActionContainer,
    ActionTileCopy,
    ActionTileDelete,
    ActionTileEdit,
} from "@/renderer/components/tables/data-table.action-tiles";

import {
    CreateStudyYearDialog,
    DeleteStudyYearDialog,
    UpdateStudyYearDialog
} from "@/renderer/dialog-actions/study-year.dialog-actions";

import type { Row } from "@tanstack/react-table";
import { PageShell } from "../components/layouts/page-shell.layout";

/**
 * Actions de ligne mémoïsées pour la performance.
 */
const StudyYearRowActions = React.memo(({ year }: { year: TStudyYear }) => {
    const initialData = useMemo(() => ({ ...year }), [year.yearId]);

    return (
        <ActionContainer className="lg:grid-cols-3">
            <UpdateStudyYearDialog studyYearId={year.yearId} initialData={initialData}>
                <ActionTileEdit />
            </UpdateStudyYearDialog>

            <CreateStudyYearDialog defaultValues={initialData}>
                <ActionTileCopy />
            </CreateStudyYearDialog>

            <DeleteStudyYearDialog
                studyYearId={year.yearId}
                yearName={year.yearName}
            >
                {({ isLoading, onOpen }) => (
                    <ActionTileDelete onClick={onOpen} disabled={isLoading} />
                )}
            </DeleteStudyYearDialog>
        </ActionContainer>
    );
});
StudyYearRowActions.displayName = "StudyYearRowActions";

export const StudyYearsPage = () => {
    const { data: studyYears = [] } = useGetStudyYears();

    return (
        <div className="h-[calc(100vh-64px)] w-full overflow-hidden">
            <PageShell 
                maxWidth="2xl" 
                header={
                    <section className="container flex items-center justify-between w-full max-w-screen-2xl my-4">
                        <header className="space-y-1">
                            <h1 className="text-2xl font-bold tracking-tight">Années Scolaires</h1>
                            <p className="text-sm text-muted-foreground">
                                Gérez les périodes académiques de votre établissement.
                            </p>
                        </header>

                        <CreateStudyYearDialog>
                            <Button size="sm" className="rounded-full shadow-sm">
                                <Plus className="size-4" />
                                <span>Nouvelle année</span>
                            </Button>
                        </CreateStudyYearDialog>
                    </section>
                }
            >
                <DataTable<TStudyYear>
                    data={studyYears}
                    columns={enhanceColumnsExpandable(StudyYearColumns)}
                    keyExtractor={(item) => item.yearId}
                >
                    <DataTableToolbar searchColumn="yearName" />

                    <Suspense
                        fallback={
                            <div className="flex h-64 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/10">
                                <LoadingSpinner className="text-primary" />
                                <p className="text-sm text-muted-foreground animate-pulse">Chargement des années...</p>
                            </div>
                        }
                    >
                        <DataTableContent>
                            <DataContentHead />
                            <DataContentBody<TStudyYear>>
                                {({ row }) => (
                                    <ExpandableRow
                                        row={row as Row<unknown>}
                                        renderDetail={<StudyYearRowActions year={row.original} />}
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
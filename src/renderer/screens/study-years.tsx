import React, { useMemo } from "react";
import { Button } from "@/renderer/components/ui/button";
import { Plus } from "lucide-react";
import { useGetStudyYears } from "@/renderer/libs/queries/study-years";
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
  FilteredTableToolbarContainer,
  SearchTableToolbar,
  DataTableColumnToggle,
} from "@/renderer/components/tables/data-table";
import {
  enhanceColumnsExpandable,
  studyYearColumns,
} from "@/renderer/components/tables/columns";
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
  UpdateStudyYearDialog,
  type CreateStudyYearDialogProps,
} from "@/renderer/dialog-actions/study-year.dialog-actions";

import type { Row } from "@tanstack/react-table";
import { PageShell } from "@/renderer/screens/layouts/page-shell.layout";
import { useSchoolContext } from "@/renderer/hooks/app-config-router";

interface RowActionsProps extends Pick<
  CreateStudyYearDialogProps,
  "mutationKey"
> {
  year: TStudyYear;
}
/**
 * Actions de ligne mémoïsées pour la performance.
 */
const StudyYearRowActions = React.memo(
  ({ year, mutationKey }: RowActionsProps) => {
    const defaultValues = useMemo(() => ({ ...year }), [year.yearId]);

    return (
      <ActionContainer className="lg:grid-cols-3">
        <UpdateStudyYearDialog
          mutationKey={mutationKey}
          studyYearId={year.yearId}
          defaultValues={defaultValues}
        >
          <ActionTileEdit />
        </UpdateStudyYearDialog>

        <CreateStudyYearDialog
          mutationKey={mutationKey}
          defaultValues={defaultValues}
        >
          <ActionTileCopy />
        </CreateStudyYearDialog>

        <DeleteStudyYearDialog
          studyYearId={year.yearId}
          yearName={year.yearName}
          mutationKey={mutationKey}
        >
          <ActionTileDelete />
        </DeleteStudyYearDialog>
      </ActionContainer>
    );
  },
);
StudyYearRowActions.displayName = "StudyYearRowActions";

export const StudyYearsPage = () => {
  const { schoolId } = useSchoolContext();
  const { data: studyYears = [], queryKey: mutationKey } = useGetStudyYears({
    where: { schoolId },
  });

  return (
    <div className="h-[calc(100vh-64px)] w-full overflow-hidden">
      <PageShell
        maxWidth="xl"
        header={
          <section className="container flex items-center justify-between w-full max-w-(--breakpoint-2xl) my-4">
            <header className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">
                Années Scolaires
              </h1>
              <p className="text-sm text-muted-foreground">
                Gérez les périodes académiques de votre établissement.
              </p>
            </header>
          </section>
        }
      >
        <DataTable<TStudyYear>
          data={studyYears}
          columns={enhanceColumnsExpandable(studyYearColumns)}
          keyExtractor={(item) => item.yearId}
        >
          <DataTableToolbar>
            <FilteredTableToolbarContainer>
              <SearchTableToolbar
                searchColumn="yearName"
                placeholder="Recherche..."
              />
            </FilteredTableToolbarContainer>
            <div className="flex items-center gap-4">
              <DataTableColumnToggle />
              <CreateStudyYearDialog
                mutationKey={mutationKey}
                defaultValues={{ schoolId }}
              >
                <Button size="sm" className="rounded-full shadow-xs">
                  <Plus className="size-4" />
                  <span>Nouvelle année</span>
                </Button>
              </CreateStudyYearDialog>
            </div>
          </DataTableToolbar>

          <Suspense
            fallback={
              <div className="flex h-64 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/10">
                <LoadingSpinner className="text-primary" />
                <p className="text-sm text-muted-foreground animate-pulse">
                  Chargement des années...
                </p>
              </div>
            }
          >
            <DataTableContent>
              <DataContentHead />
              <DataContentBody<TStudyYear>>
                {({ row }) => (
                  <ExpandableRow
                    row={row as Row<unknown>}
                    renderDetail={
                      <StudyYearRowActions
                        mutationKey={mutationKey}
                        year={row.original}
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

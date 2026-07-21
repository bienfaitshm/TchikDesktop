"use client";

import * as React from "react";
import { Plus, Pencil, Copy, Trash2 } from "lucide-react";
import { useGetStudyYears } from "@/renderer/libs/queries/study-years";
import type { TStudyYear } from "@/packages/@core/data-access/db/schemas/types";
import { Suspense } from "@/renderer/libs/queries/suspense";
import { LoadingSpinner } from "@/renderer/components/loaders/loading-spinner";
import { Button } from "@/renderer/components/ui/button";
import {
  DataTable,
  DataContentBody,
  DataContentHead,
  DataTableContent,
  DataTablePagination,
  DataTableToolbar,
  SearchTableToolbar,
  FilteredTableToolbarContainer,
  DataTableColumnToggle,
} from "@/renderer/components/tables/data-table";
import {
  enhanceColumnsExpandable,
  studyYearColumns,
} from "@/renderer/components/tables/columns";
import { ExpandableRow } from "@/renderer/components/tables/data-table.expandable";
import { useSchoolContext } from "@/renderer/hooks/app-config-router";
import { PageShell } from "@/renderer/screens/layouts/page-shell.layout";
import {
  createActionMenus,
  type ActionMenuConfig,
} from "@/components/menus/action-menus";
import {
  CreateStudyYearDialog,
  DeleteStudyYearDialog,
  UpdateStudyYearDialog,
  type CreateStudyYearDialogProps,
} from "@/renderer/dialog-actions/study-year.dialog-actions";
import type { Row } from "@tanstack/react-table";

export interface RowActionsProps extends Pick<
  CreateStudyYearDialogProps,
  "mutationKey"
> {
  year: TStudyYear;
}

const MENUS: ActionMenuConfig<RowActionsProps>[] = [
  {
    id: "edit",
    label: "Edit study year",
    icon: Pencil,
    dialog({ year, mutationKey }) {
      return (
        <UpdateStudyYearDialog
          mutationKey={mutationKey}
          studyYearId={year.yearId}
          defaultValues={year}
        />
      );
    },
  },
  {
    id: "duplicate",
    label: "Duplicate study year",
    icon: Copy,
    dialog({ year, mutationKey }) {
      return (
        <CreateStudyYearDialog mutationKey={mutationKey} defaultValues={year} />
      );
    },
  },
  {
    id: "delete",
    label: "Delete study year",
    icon: Trash2,
    separator: true,
    variant: "destructive",
    dialog({ year, mutationKey }) {
      return (
        <DeleteStudyYearDialog
          studyYearId={year.yearId}
          yearName={year.yearName}
          mutationKey={mutationKey}
        />
      );
    },
  },
];

/**
 * Renders contextual action menus for a given study year row.
 * @param props - Component properties containing the study year entity and mutation key.
 * @returns The rendered action menu component.
 */
export const StudyYearRowAction: React.FC<RowActionsProps> =
  createActionMenus(MENUS);

/**
 * Main application screen component for viewing and managing academic years.
 * @returns Rendered study years management page layout with data table and toolbars.
 */
export const StudyYearsPage: React.FC = () => {
  const { schoolId } = useSchoolContext();
  const { data: studyYears = [], queryKey: mutationKey } = useGetStudyYears({
    where: { studyYears: { schoolId: { $eq: schoolId } } },
  });

  return (
    <div className="h-[calc(100vh-64px)] w-full overflow-hidden">
      <PageShell
        maxWidth="xl"
        header={
          <section className="container flex items-center justify-between w-full max-w-(--breakpoint-2xl) my-4">
            <header className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">
                Academic Years
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage the academic periods of your institution.
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
                placeholder="Search Ex. 2025-2026"
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
                  <span>New Academic Year</span>
                </Button>
              </CreateStudyYearDialog>
            </div>
          </DataTableToolbar>

          <Suspense
            fallback={
              <div className="flex h-64 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/10">
                <LoadingSpinner className="text-primary" />
                <p className="text-sm text-muted-foreground animate-pulse">
                  Loading academic years...
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
                      <StudyYearRowAction
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

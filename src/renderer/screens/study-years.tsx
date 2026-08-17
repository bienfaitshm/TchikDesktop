"use client";

import * as React from "react";
import { Plus, Pencil, Copy, Trash2 } from "lucide-react";
import { useGetStudyYears } from "@/renderer/libs/queries/study-years";
import type { StudyYear } from "@/packages/@core/data-access/db";
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
  enhanceColumns,
  studyYearColumns,
} from "@/renderer/components/tables/columns";
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
import {
  PageContainer,
  PageHeader,
  PageHeaderTextContent,
  PageHeadTitle,
  PageHeadDescription,
  PageContent,
} from "@/renderer/containers/page-container";

export interface RowActionsProps extends Pick<
  CreateStudyYearDialogProps,
  "mutationKey"
> {
  year: StudyYear;
}

const MENUS: ActionMenuConfig<RowActionsProps>[] = [
  {
    id: "edit",
    label: "Modifier l'année d'étude",
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
    label: "Dupliquer l'année d'étude",
    icon: Copy,
    dialog({ year, mutationKey }) {
      return (
        <CreateStudyYearDialog mutationKey={mutationKey} defaultValues={year} />
      );
    },
  },
  {
    id: "delete",
    label: "Supprimer l'année d'étude",
    icon: Trash2,
    separator: true,
    variant: "destructive",
    dialog({ year, mutationKey }) {
      return (
        <DeleteStudyYearDialog
          id={year.yearId}
          name={year.yearName}
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
export const RowAction: React.FC<RowActionsProps> =
  createActionMenus<RowActionsProps>(MENUS);

/**
 * Main application screen component for viewing and managing academic years.
 * @returns Rendered study years management page layout with data table and toolbars.
 */
export const StudyYearsPage: React.FC = () => {
  const { data: studyYears = [], queryKey: mutationKey } = useGetStudyYears();

  const columns = React.useMemo(
    () =>
      enhanceColumns(studyYearColumns, {
        variant: "actions",
        renderRowAction: (year) => (
          <RowAction year={year} mutationKey={mutationKey} />
        ),
      }),
    [mutationKey],
  );

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderTextContent>
          <PageHeadTitle>Années académiques</PageHeadTitle>
          <PageHeadDescription>
            Gérez les périodes académiques de votre établissement.
          </PageHeadDescription>
        </PageHeaderTextContent>
      </PageHeader>
      <PageContent>
        <DataTable<StudyYear>
          data={studyYears}
          columns={columns}
          keyExtractor={(item) => item.yearId}
        >
          <DataTableToolbar>
            <FilteredTableToolbarContainer>
              <SearchTableToolbar
                searchColumn="yearName"
                placeholder="Rechercher ex. 2025-2026"
              />
            </FilteredTableToolbarContainer>
            <div className="flex items-center gap-4">
              <DataTableColumnToggle />
              <CreateStudyYearDialog mutationKey={mutationKey}>
                <Button size="sm" className="rounded-full shadow-xs">
                  <Plus className="size-4" />
                  <span>Nouvelle année académique</span>
                </Button>
              </CreateStudyYearDialog>
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

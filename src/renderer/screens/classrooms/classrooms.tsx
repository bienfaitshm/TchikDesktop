"use client";

import type { ClassroomDTO } from "@/packages/@core/data-access/db/queries";
import { useGetClassrooms } from "@/renderer/libs/queries/classrooms";
import React, { useMemo } from "react";
import {
  DataTable,
  DataContentBody,
  DataContentHead,
  DataTableContent,
  DataTablePagination,
  DataTableToolbar,
  TableFacetedFilterItem,
  FilteredTableToolbarContainer,
  SearchTableToolbar,
  DataTableColumnToggle,
} from "@/renderer/components/tables/data-table";
import { Button } from "@/renderer/components/ui/button";
import {
  classroomColumns,
  enhanceColumnsExpandable,
} from "@/renderer/components/tables/columns";
import { Plus } from "lucide-react";
import { Suspense } from "@/renderer/libs/queries/suspense";
import {
  ClassroomDialogCreateForm,
  ClassroomDialogDeleteForm,
  ClassroomDialogUpdateForm,
  type ClassroomDialogProps,
} from "@/renderer/dialog-actions/classroom.dialog-actions";

import { ExpandableRow } from "@/renderer/components/tables/data-table.expandable";
import {
  ActionContainer,
  ActionTileCopy,
  ActionTileDelete,
  ActionTileEdit,
  ActionTileDetail,
} from "@/renderer/components/tables/data-table.action-tiles";
import { Link } from "react-router";
import { SECTION_OPTIONS } from "@/packages/@core/data-access/db/options";
import { useGetOptionAsOptions } from "@/renderer/hooks/data-as-options";
import { useSchoolContext } from "@/renderer/hooks/app-config-router";
import { PageShell } from "@/renderer/screens/layouts/page-shell.layout";
import { APP_ROUTES } from "@/renderer/constants";
const columns = enhanceColumnsExpandable(classroomColumns);

interface ClassroomRowActionsProps extends Pick<
  ClassroomDialogProps,
  "mutationKey"
> {
  classroom: ClassroomDTO;
  schoolId: string;
  yearId: string;
}

/**
 * @description Actions de ligne
 */
const ClassroomRowActions: React.FC<ClassroomRowActionsProps> = React.memo(
  ({ classroom, schoolId, yearId, mutationKey }) => {
    const defaultValues = useMemo(
      () => ({ ...classroom, yearId }),
      [classroom, yearId],
    );

    return (
      <ActionContainer className="justify-end">
        {/* Navigation vers le détail des étudiants */}
        <Link
          to={APP_ROUTES.CLASSROOMS.STUDENTS(classroom.classId)}
          className="contents"
        >
          <ActionTileDetail />
        </Link>

        {/* Modification */}
        <ClassroomDialogUpdateForm
          classId={classroom.classId}
          schoolId={schoolId}
          defaultValues={defaultValues}
          mutationKey={mutationKey}
        >
          <ActionTileEdit />
        </ClassroomDialogUpdateForm>

        {/* Duplication */}
        <ClassroomDialogCreateForm
          schoolId={schoolId}
          defaultValues={{ schoolId, yearId }}
          mutationKey={mutationKey}
        >
          <ActionTileCopy />
        </ClassroomDialogCreateForm>

        {/* Suppression avec confirmation (Plus de Render Props obsolète) */}
        <ClassroomDialogDeleteForm
          classId={classroom.classId}
          identifier={classroom.identifier}
          mutationKey={mutationKey}
        >
          <ActionTileDelete />
        </ClassroomDialogDeleteForm>
      </ActionContainer>
    );
  },
);

ClassroomRowActions.displayName = "ClassroomRowActions";

export const ClassroomPage = () => {
  const { schoolId, yearId } = useSchoolContext();
  const { options } = useGetOptionAsOptions(schoolId);

  const { data: classrooms = [], queryKey: mutationKey } = useGetClassrooms({
    where: { schoolId, yearId },
  });

  return (
    <div className="h-[calc(100vh-64px)] w-full overflow-hidden">
      <PageShell
        maxWidth="xl"
        header={
          <section className="container flex items-center justify-between w-full max-w-(--breakpoint-2xl) my-4">
            <header className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">
                Gestion des classes
              </h1>
              <p className="text-sm text-muted-foreground">
                Administrez les salles.
              </p>
            </header>
          </section>
        }
      >
        <DataTable<ClassroomDTO>
          data={classrooms}
          columns={columns}
          keyExtractor={(item) => item.classId}
        >
          <DataTableToolbar>
            <FilteredTableToolbarContainer>
              <SearchTableToolbar
                searchColumn="identifier"
                placeholder="Recherche Ex. 1er MA"
              />
              <TableFacetedFilterItem
                title="Section"
                columnId="section"
                options={SECTION_OPTIONS}
              />
              <TableFacetedFilterItem
                title="Option"
                columnId="option_optionName"
                options={options}
              />
            </FilteredTableToolbarContainer>
            <div className="flex items-center gap-4">
              <DataTableColumnToggle />
              <ClassroomDialogCreateForm
                schoolId={schoolId}
                defaultValues={{ yearId, schoolId }}
                mutationKey={mutationKey}
              >
                <Button size="sm" className="rounded-full shadow-xs">
                  <Plus className="size-4 mr-2" />
                  <span>Ajouter une classe</span>
                </Button>
              </ClassroomDialogCreateForm>
            </div>
          </DataTableToolbar>

          <Suspense
            fallback={
              <div className="h-64 w-full animate-pulse bg-muted/20 rounded-lg" />
            }
          >
            <DataTableContent>
              <DataContentHead />
              <DataContentBody<ClassroomDTO>>
                {({ row }) => (
                  <ExpandableRow
                    row={row as any}
                    renderDetail={
                      <ClassroomRowActions
                        classroom={row.original}
                        schoolId={schoolId}
                        yearId={yearId}
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

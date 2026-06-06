"use client";

import type { TClassroomAttributes as TClassroom } from "@/packages/@core/data-access/schema-validations";
import { useGetClassrooms } from "@/renderer/libs/queries/classroom";
import React, { useMemo } from "react";
import {
  DataTable,
  DataContentBody,
  DataContentHead,
  DataTableContent,
  DataTablePagination,
  DataTableToolbar,
  TableFacetedFilterItem,
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

const columns = enhanceColumnsExpandable(classroomColumns);

interface ClassroomRowActionsProps extends Pick<
  ClassroomDialogProps,
  "queryKeysToInvalidate"
> {
  classroom: TClassroom;
  schoolId: string;
  yearId: string;
}

/**
 * @description Actions de ligne
 */
const ClassroomRowActions: React.FC<ClassroomRowActionsProps> = React.memo(
  ({ classroom, schoolId, yearId, queryKeysToInvalidate }) => {
    const defaultValues = useMemo(
      () => ({ ...classroom, yearId }),
      [classroom, yearId],
    );

    return (
      <ActionContainer>
        {/* Navigation vers le détail des étudiants */}
        <Link
          to={`/classrooms/${classroom.classId}/students`}
          className="contents"
        >
          <ActionTileDetail />
        </Link>

        {/* Modification */}
        <ClassroomDialogUpdateForm
          classId={classroom.classId}
          schoolId={schoolId}
          defaultValues={defaultValues}
          queryKeysToInvalidate={queryKeysToInvalidate}
        >
          <ActionTileEdit />
        </ClassroomDialogUpdateForm>

        {/* Duplication */}
        <ClassroomDialogCreateForm
          schoolId={schoolId}
          defaultValues={defaultValues}
          queryKeysToInvalidate={queryKeysToInvalidate}
        >
          <ActionTileCopy />
        </ClassroomDialogCreateForm>

        {/* Suppression avec confirmation (Plus de Render Props obsolète) */}
        <ClassroomDialogDeleteForm
          classId={classroom.classId}
          identifier={classroom.identifier}
          queryKeysToInvalidate={queryKeysToInvalidate}
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

  const { data: classrooms = [], queryKey: queryKeysToInvalidate } =
    useGetClassrooms({
      where: { schoolId, yearId },
    });

  return (
    <div className="h-[calc(100vh-64px)] w-full overflow-hidden">
      <PageShell
        maxWidth="2xl"
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

            <ClassroomDialogCreateForm
              schoolId={schoolId}
              defaultValues={{ yearId, schoolId }}
              queryKeysToInvalidate={queryKeysToInvalidate}
            >
              <Button size="sm" className="rounded-full shadow-xs">
                <Plus className="size-4 mr-2" />
                <span>Ajouter une classe</span>
              </Button>
            </ClassroomDialogCreateForm>
          </section>
        }
      >
        <DataTable<TClassroom>
          data={classrooms}
          columns={columns}
          keyExtractor={(item) => item.classId}
        >
          <DataTableToolbar searchColumn="identifier">
            <TableFacetedFilterItem
              title="Section"
              columnId="section"
              options={SECTION_OPTIONS}
            />
            <TableFacetedFilterItem
              title="Option"
              columnId="optionId"
              options={options}
            />
          </DataTableToolbar>

          <Suspense
            fallback={
              <div className="h-64 w-full animate-pulse bg-muted/20 rounded-lg" />
            }
          >
            <DataTableContent>
              <DataContentHead />
              <DataContentBody<TClassroom>>
                {({ row }) => (
                  <ExpandableRow
                    row={row as any}
                    renderDetail={
                      <ClassroomRowActions
                        classroom={row.original}
                        schoolId={schoolId}
                        yearId={yearId}
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

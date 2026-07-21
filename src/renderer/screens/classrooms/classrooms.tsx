"use client";

import * as React from "react";
import { Plus, Eye, Pencil, Copy, Trash2 } from "lucide-react";
import { useGetClassrooms } from "@/renderer/libs/queries/classrooms";
import type { ClassroomDTO } from "@/packages/@core/data-access/db/queries";
import { Button } from "@/renderer/components/ui/button";
import { Suspense } from "@/renderer/libs/queries/suspense";
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
import {
  classroomColumns,
  enhanceColumnsExpandable,
} from "@/renderer/components/tables/columns";
import { ExpandableRow } from "@/renderer/components/tables/data-table.expandable";
import {
  ClassroomDialogCreateForm,
  ClassroomDialogDeleteForm,
  ClassroomDialogUpdateForm,
  type ClassroomDialogProps,
} from "@/renderer/dialog-actions/classroom.dialog-actions";
import { useSchoolContext } from "@/renderer/hooks/app-config-router";
import { useGetOptionAsOptions } from "@/renderer/hooks/data-as-options";
import { PageShell } from "@/renderer/screens/layouts/page-shell.layout";
import { APP_ROUTES } from "@/renderer/constants";
import {
  createActionMenus,
  type ActionMenuConfig,
} from "@/components/menus/action-menus";
import { Link } from "react-router";
import type { Row } from "@tanstack/react-table";

export interface ClassroomRowActionsProps extends Pick<
  ClassroomDialogProps,
  "mutationKey"
> {
  classroom: ClassroomDTO;
  schoolId: string;
}

const MENUS: ActionMenuConfig<ClassroomRowActionsProps>[] = [
  {
    id: "details",
    label: "View students",
    icon: Eye,
    dialog({ classroom }) {
      return (
        <Link
          to={APP_ROUTES.CLASSROOMS.STUDENTS(classroom.classId)}
          className="contents"
        >
          View students
        </Link>
      );
    },
  },
  {
    id: "edit",
    label: "Edit classroom",
    icon: Pencil,
    dialog({ classroom, schoolId, mutationKey }) {
      return (
        <ClassroomDialogUpdateForm
          classId={classroom.classId}
          schoolId={schoolId}
          defaultValues={classroom}
          mutationKey={mutationKey}
        />
      );
    },
  },
  {
    id: "duplicate",
    label: "Duplicate classroom",
    icon: Copy,
    dialog({ classroom, schoolId, mutationKey }) {
      return (
        <ClassroomDialogCreateForm
          schoolId={schoolId}
          defaultValues={{ ...classroom, schoolId }}
          mutationKey={mutationKey}
        />
      );
    },
  },
  {
    id: "delete",
    label: "Delete classroom",
    icon: Trash2,
    separator: true,
    variant: "destructive",
    dialog({ classroom, mutationKey }) {
      return (
        <ClassroomDialogDeleteForm
          classId={classroom.classId}
          identifier={classroom.identifier}
          mutationKey={mutationKey}
        />
      );
    },
  },
];

/**
 * Renders contextual action menus for a given classroom row.
 * @param props - Component properties containing the classroom entity, school ID, and mutation key.
 * @returns The rendered action menu component.
 */
export const ClassroomRowAction = createActionMenus(MENUS);

/**
 * Main application screen component for viewing and managing classrooms.
 * @returns Rendered classroom management page layout with data table and toolbars.
 */
export const ClassroomPage: React.FC = () => {
  const { schoolId } = useSchoolContext();
  const { options } = useGetOptionAsOptions(schoolId);

  const { data: classrooms = [], queryKey: mutationKey } = useGetClassrooms({
    where: {
      classrooms: {
        schoolId: {
          $eq: schoolId,
        },
      },
    },
  });

  const columns = React.useMemo(
    () => enhanceColumnsExpandable(classroomColumns),
    [],
  );

  return (
    <div className="h-[calc(100vh-64px)] w-full overflow-hidden">
      <PageShell
        maxWidth="xl"
        header={
          <section className="container flex items-center justify-between w-full max-w-(--breakpoint-2xl) my-4">
            <header className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">
                Classroom Management
              </h1>
              <p className="text-sm text-muted-foreground">
                Administer rooms and classes.
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
                placeholder="Search Ex. 1st MA"
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
                defaultValues={{ schoolId }}
                mutationKey={mutationKey}
              >
                <Button size="sm" className="rounded-full shadow-xs">
                  <Plus className="size-4 mr-2" />
                  <span>Add Classroom</span>
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
                    row={row as Row<unknown>}
                    renderDetail={
                      <ClassroomRowAction
                        classroom={row.original}
                        schoolId={schoolId}
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

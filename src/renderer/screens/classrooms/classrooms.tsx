"use client";

import * as React from "react";
import { Plus, Eye, Pencil, Copy, Trash2 } from "lucide-react";
import { useGetClassrooms } from "@/renderer/libs/queries/classrooms";
import type { ClassroomDTO } from "@/packages/@core/data-access/db/queries";
import { Button } from "@/renderer/components/ui/button";
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
  enhanceColumns,
} from "@/renderer/components/tables/columns";
import {
  CreateClassroomDialog,
  DeleteClassroomDialog,
  UpdateClassroomDialog,
  type ClassroomDialogProps,
} from "@/renderer/dialog-actions/classroom.dialog-actions";
import { useSchoolContext } from "@/renderer/hooks/app-config-router";
import { useGetOptionAsOptions } from "@/renderer/hooks/data-as-options";
import { APP_ROUTES } from "@/renderer/constants";
import {
  createActionMenus,
  type ActionMenuConfig,
} from "@/components/menus/action-menus";
import { SECTION_OPTIONS } from "@/packages/@core/data-access/db/options";
import {
  PageContainer,
  PageHeader,
  PageHeaderTextContent,
  PageHeadTitle,
  PageHeadDescription,
  PageContent,
} from "@/renderer/containers/page-container";

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
    label: "Voir les élèves",
    icon: Eye,
    link: ({ classroom }) => APP_ROUTES.CLASSROOMS.STUDENTS(classroom.classId),
  },
  {
    id: "edit",
    label: "Modifier la classe",
    icon: Pencil,
    dialog({ classroom, schoolId, mutationKey }) {
      return (
        <UpdateClassroomDialog
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
    label: "Dupliquer la classe",
    icon: Copy,
    dialog({ classroom, schoolId, mutationKey }) {
      return (
        <CreateClassroomDialog
          schoolId={schoolId}
          defaultValues={{ ...classroom, schoolId }}
          mutationKey={mutationKey}
        />
      );
    },
  },
  {
    id: "delete",
    label: "Supprimer la classe",
    icon: Trash2,
    separator: true,
    variant: "destructive",
    dialog({ classroom, mutationKey }) {
      return (
        <DeleteClassroomDialog
          id={classroom.classId}
          name={classroom.identifier}
          mutationKey={mutationKey}
        />
      );
    },
  },
];

export const ClassroomRowAction: React.FC<ClassroomRowActionsProps> =
  createActionMenus<ClassroomRowActionsProps>(MENUS);

export const ClassroomPage: React.FC = () => {
  const { schoolId } = useSchoolContext();
  const { options } = useGetOptionAsOptions(schoolId);

  const { data: classrooms = [], queryKey: mutationKey } = useGetClassrooms({
    where: {
      classrooms: {
        schoolId,
      },
    },
  });

  const columns = React.useMemo(
    () =>
      enhanceColumns(classroomColumns, {
        variant: "actions",
        renderRowAction: (classroom) => (
          <ClassroomRowAction
            mutationKey={mutationKey}
            classroom={classroom}
            schoolId={schoolId}
          />
        ),
      }),
    [mutationKey, schoolId],
  );

  return (
    <PageContainer className="w-full min-w-0">
      <PageHeader>
        <PageHeaderTextContent>
          <PageHeadTitle>Gestion des classes</PageHeadTitle>
          <PageHeadDescription>
            Administrez les classes de votre établissement.
          </PageHeadDescription>
        </PageHeaderTextContent>
      </PageHeader>

      <PageContent className="w-full min-w-0 space-y-4">
        <DataTable<ClassroomDTO>
          data={classrooms}
          columns={columns}
          keyExtractor={(item) => item.classId}
        >
          <DataTableToolbar className="flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <FilteredTableToolbarContainer className="flex-wrap gap-2">
              <SearchTableToolbar
                searchColumn="identifier"
                placeholder="Rechercher ex. 1ère MA"
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

            <div className="flex items-center justify-end gap-2 shrink-0">
              <DataTableColumnToggle />
              <CreateClassroomDialog
                schoolId={schoolId}
                defaultValues={{ schoolId }}
                mutationKey={mutationKey}
              >
                <Button size="sm" className="gap-2 rounded-full shadow-xs">
                  <Plus className="size-4" />
                  <span>Ajouter une classe</span>
                </Button>
              </CreateClassroomDialog>
            </div>
          </DataTableToolbar>

          <DataTableContent>
            <DataContentHead />
            <DataContentBody />
          </DataTableContent>

          <DataTablePagination className="mt-4" />
        </DataTable>
      </PageContent>
    </PageContainer>
  );
};

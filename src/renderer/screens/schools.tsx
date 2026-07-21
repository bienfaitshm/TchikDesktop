"use client";

import React from "react";
import { Button } from "@/renderer/components/ui/button";
import { Plus, Pencil, Copy, Trash2 } from "lucide-react";
import { useGetSchools } from "@/renderer/libs/queries/schools";
import type { School } from "@/packages/@core/data-access/db/schemas";
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
  enhanceColumns,
  schoolColumns,
} from "@/renderer/components/tables/columns";
import {
  CreateSchoolDialog,
  DeleteSchoolDialog,
  UpdateSchoolDialog,
  type SchoolDialogProps,
} from "@/renderer/dialog-actions/school.dialog-actions";
import { PageShell } from "@/renderer/screens/layouts/page-shell.layout";
import {
  createActionMenus,
  type ActionMenuConfig,
} from "@/components/menus/action-menus";

export interface RowActionsProps extends Pick<
  SchoolDialogProps,
  "mutationKey"
> {
  school: School;
}

const MENUS: ActionMenuConfig<RowActionsProps>[] = [
  {
    id: "edit",
    label: "Modifier les infos de l'école",
    icon: Pencil,
    dialog({ school, mutationKey }) {
      return (
        <UpdateSchoolDialog
          mutationKey={mutationKey}
          schoolId={school.schoolId}
          defaultValues={school}
        />
      );
    },
  },
  {
    id: "duplicate",
    label: "Dupliquer",
    icon: Copy,
    dialog({ school, mutationKey }) {
      return (
        <CreateSchoolDialog mutationKey={mutationKey} defaultValues={school} />
      );
    },
  },
  {
    id: "delete",
    label: "Supprimer",
    icon: Trash2,
    separator: true,
    variant: "destructive",
    dialog({ school, mutationKey }) {
      return (
        <DeleteSchoolDialog
          mutationKey={mutationKey}
          id={school.schoolId}
          name={school.name}
        />
      );
    },
  },
];

/**
 * Renders contextual action menus for a given school row.
 * @param props - Component properties containing the school entity and mutation key.
 * @returns The rendered action menu component.
 */
export const RowAction = createActionMenus(MENUS);

/**
 * Main application screen component for viewing and managing registered schools.
 * @returns Rendered school management page layout with data table and toolbars.
 */
export const SchoolsPage: React.FC = () => {
  const { data: schools = [], queryKey: mutationKey } = useGetSchools();
  const columns = React.useMemo(
    () =>
      enhanceColumns(schoolColumns, {
        variant: "actions",
        renderRowAction: (school) => (
          <RowAction school={school} mutationKey={mutationKey} />
        ),
      }),
    [mutationKey],
  );

  return (
    <div className="flex-1 w-full overflow-hidden">
      <PageShell
        maxWidth="xl"
        header={
          <section>
            <header className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">
                Gestion des établissements
              </h1>
              <p className="text-sm text-muted-foreground">
                Visualisez et administrez la liste des écoles enregistrées.
              </p>
            </header>
          </section>
        }
      >
        <DataTable<School>
          data={schools}
          columns={columns}
          keyExtractor={(item) => item.schoolId}
        >
          <DataTableToolbar>
            <FilteredTableToolbarContainer>
              <SearchTableToolbar
                searchColumn="name"
                placeholder="Recherche..."
              />
            </FilteredTableToolbarContainer>
            <div className="flex items-center gap-4">
              <DataTableColumnToggle />
              <CreateSchoolDialog mutationKey={mutationKey}>
                <Button size="sm" className="rounded-full shadow-xs">
                  <Plus className="size-4" />
                  <span>Ajouter une école</span>
                </Button>
              </CreateSchoolDialog>
            </div>
          </DataTableToolbar>

          <DataTableContent>
            <DataContentHead />
            <DataContentBody<School> />
          </DataTableContent>
          <DataTablePagination />
        </DataTable>
      </PageShell>
    </div>
  );
};

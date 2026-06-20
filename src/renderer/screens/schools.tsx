import React, { useMemo } from "react";
import { Button } from "@/renderer/components/ui/button";
import { Plus } from "lucide-react";
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
  enhanceColumnsExpandable,
  schoolColumns,
} from "@/renderer/components/tables/columns";
import { ExpandableRow } from "@/renderer/components/tables/data-table.expandable";
import {
  ActionContainer,
  ActionTileCopy,
  ActionTileDelete,
  ActionTileEdit,
} from "@/renderer/components/tables/data-table.action-tiles";

import {
  CreateSchoolDialog,
  DeleteSchoolDialog,
  UpdateSchoolDialog,
  type CreateSchoolDialogProps,
} from "@/renderer/dialog-actions/school.dialog-actions";

import type { Row } from "@tanstack/react-table";
import { PageShell } from "@/renderer/screens/layouts/page-shell.layout";

interface RowActionsProps extends Pick<CreateSchoolDialogProps, "mutationKey"> {
  school: School;
}

/**
 * Actions de ligne mémoïsées.
 * On utilise les props cohérentes : schoolId et schoolName.
 */
const SchoolRowActions = React.memo(
  ({ school, mutationKey }: RowActionsProps) => {
    const initialData = useMemo(() => ({ ...school }), [school.schoolId]);

    return (
      <ActionContainer className="lg:grid-cols-3">
        <UpdateSchoolDialog
          mutationKey={mutationKey}
          schoolId={school.schoolId}
          defaultValues={initialData}
        >
          <ActionTileEdit />
        </UpdateSchoolDialog>

        <CreateSchoolDialog
          mutationKey={mutationKey}
          defaultValues={initialData}
        >
          <ActionTileCopy />
        </CreateSchoolDialog>

        <DeleteSchoolDialog
          mutationKey={mutationKey}
          schoolId={school.schoolId}
          schoolName={school.name}
        >
          <ActionTileDelete />
        </DeleteSchoolDialog>
      </ActionContainer>
    );
  },
);
SchoolRowActions.displayName = "SchoolRowActions";

export const SchoolsPage = () => {
  const { data: schools = [], queryKey: mutationKey } = useGetSchools();

  return (
    <div className="h-[calc(100vh-64px)] w-full overflow-hidden">
      <PageShell
        maxWidth="xl"
        header={
          <section className="container flex items-center justify-between w-full max-w-(--breakpoint-2xl) my-4 ">
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
          columns={enhanceColumnsExpandable(schoolColumns)}
          keyExtractor={(item) => item.schoolId}
        >
          <DataTableToolbar>
            <FilteredTableToolbarContainer>
              <SearchTableToolbar searchColumn="name" placeholder="Recherche" />
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
            <DataContentBody<School>>
              {({ row }) => (
                <ExpandableRow
                  row={row as Row<unknown>}
                  renderDetail={
                    <SchoolRowActions
                      mutationKey={mutationKey}
                      school={row.original}
                    />
                  }
                />
              )}
            </DataContentBody>
          </DataTableContent>
          <DataTablePagination />
        </DataTable>
      </PageShell>
    </div>
  );
};

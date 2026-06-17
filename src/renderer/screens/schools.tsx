import React, { useMemo } from "react";
import { Button } from "@/renderer/components/ui/button";
import { Plus } from "lucide-react";
import { useGetSchools } from "@/renderer/libs/queries/schools";
import type { School } from "@/packages/@core/data-access/db/schemas";
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
} from "@/renderer/dialog-actions/school.dialog-actions";

import type { Row } from "@tanstack/react-table";
import { PageShell } from "@/renderer/screens/layouts/page-shell.layout";

/**
 * Actions de ligne mémoïsées.
 * On utilise les props cohérentes : schoolId et schoolName.
 */
const SchoolRowActions = React.memo(({ school }: { school: School }) => {
  const initialData = useMemo(() => ({ ...school }), [school.schoolId]);

  return (
    <ActionContainer className="lg:grid-cols-3">
      <UpdateSchoolDialog schoolId={school.schoolId} initialData={initialData}>
        <ActionTileEdit />
      </UpdateSchoolDialog>

      <CreateSchoolDialog defaultValues={initialData}>
        <ActionTileCopy />
      </CreateSchoolDialog>

      <DeleteSchoolDialog schoolId={school.schoolId} schoolName={school.name}>
        {({ isLoading, onOpen }) => (
          <ActionTileDelete onClick={onOpen} disabled={isLoading} />
        )}
      </DeleteSchoolDialog>
    </ActionContainer>
  );
});
SchoolRowActions.displayName = "SchoolRowActions";

export const SchoolsPage = () => {
  const { data: schools = [] } = useGetSchools();

  return (
    <div className="h-[calc(100vh-64px)] w-full overflow-hidden">
      <PageShell
        maxWidth="2xl"
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

            {/* Changé CreateOptionDialog en CreateSchoolDialog */}
            <CreateSchoolDialog>
              <Button size="sm" className="rounded-full shadow-xs">
                <Plus className="size-4" />
                <span>Ajouter une école</span>
              </Button>
            </CreateSchoolDialog>
          </section>
        }
      >
        <DataTable<School>
          data={schools}
          columns={enhanceColumnsExpandable(schoolColumns)}
          keyExtractor={(item) => item.schoolId}
        >
          <DataTableToolbar searchColumn="name" />

          <Suspense
            fallback={
              <div className="flex h-64 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/10">
                <LoadingSpinner className="text-primary" />
                <p className="text-sm text-muted-foreground animate-pulse">
                  Chargement des établissements...
                </p>
              </div>
            }
          >
            <DataTableContent>
              <DataContentHead />
              <DataContentBody<School>>
                {({ row }) => (
                  <ExpandableRow
                    row={row as Row<unknown>}
                    renderDetail={<SchoolRowActions school={row.original} />}
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

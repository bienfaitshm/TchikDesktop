"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { useGetSeatingSessions } from "@/renderer/libs/queries/seating";
import { Button } from "@/renderer/components/ui/button";
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
  SeatingSessionColumns,
  enhanceColumnsExpandable,
} from "@/renderer/components/tables/columns";
import { ExpandableRow } from "@/renderer/components/tables/data-table.expandable";
import {
  ActionContainer,
  ActionTileCopy,
  ActionTileDelete,
  ActionTileDetail,
  ActionTileEdit,
} from "@/renderer/components/tables/data-table.action-tiles";
import {
  CreateSeatingSessionDialog,
  DeleteSeatingSessionDialog,
  UpdateSeatingSessionDialog,
} from "@/renderer/dialog-actions/seating-session.dialog-actions";
import type { Row } from "@tanstack/react-table";
import { useSchoolContext } from "@/renderer/hooks/app-config-router";
import { PageShell } from "@/renderer/components/layouts/page-shell.layout";
import { Link } from "react-router";
import type { TSeatingSessionAttributes as TSeatingSession } from "@/packages/@core/data-access/schema-validations/types";

/**
 * Actions de ligne mémoïsées pour la performance.
 */
const SessionRowActions = React.memo(
  ({ session }: { session: TSeatingSession }) => {
    const initialData = React.useMemo(
      () => ({ ...session }),
      [session.sessionId],
    );

    return (
      <ActionContainer className="lg:grid-cols-4">
        <Link to={`/seating/${session.sessionId}`} className="contents">
          <ActionTileDetail />
        </Link>
        <UpdateSeatingSessionDialog
          seatingSessionId={session.sessionId}
          initialData={initialData}
        >
          <ActionTileEdit />
        </UpdateSeatingSessionDialog>
        <CreateSeatingSessionDialog defaultValues={initialData}>
          <ActionTileCopy />
        </CreateSeatingSessionDialog>

        <DeleteSeatingSessionDialog
          seatingSessionId={session.sessionId}
          seatingSessionName={session.sessionName}
        >
          {({ isLoading, onOpen }) => (
            <ActionTileDelete onClick={onOpen} disabled={isLoading} />
          )}
        </DeleteSeatingSessionDialog>
      </ActionContainer>
    );
  },
);
SessionRowActions.displayName = "SessionRowActions";

export const SeatingPage = () => {
  const { schoolId, yearId } = useSchoolContext();
  const { data: sessions = [] } = useGetSeatingSessions({
    where: { schoolId, yearId },
  });

  return (
    <div className="h-[calc(100vh-64px)] w-full overflow-hidden">
      <PageShell
        maxWidth="2xl"
        header={
          <section className="container flex items-center justify-between w-full max-w-screen-2xl my-4">
            <header className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">
                Sessions de mise en place
              </h1>
              <p className="text-sm text-muted-foreground">
                Organisez les plans de salle et la répartition des candidats.
              </p>
            </header>

            <CreateSeatingSessionDialog defaultValues={{ schoolId, yearId }}>
              <Button
                size="sm"
                className="rounded-full shadow-sm bg-primary hover:bg-primary/90"
              >
                <Plus className="mr-2 size-4" />
                Nouvelle session
              </Button>
            </CreateSeatingSessionDialog>
          </section>
        }
      >
        <DataTable<TSeatingSession>
          data={sessions}
          columns={enhanceColumnsExpandable(SeatingSessionColumns)}
          keyExtractor={(item) => item.sessionId}
        >
          <DataTableToolbar searchColumn="sessionName">
            {/* Tu peux ajouter des filtres ici, par exemple par statut (Brouillon, Publiée) */}
          </DataTableToolbar>

          <Suspense
            fallback={
              <div className="flex h-64 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/5">
                <LoadingSpinner className="text-primary" />
                <p className="text-sm text-muted-foreground animate-pulse">
                  Chargement des sessions...
                </p>
              </div>
            }
          >
            <DataTableContent>
              <DataContentHead />
              <DataContentBody<TSeatingSession>>
                {({ row }) => (
                  <ExpandableRow
                    row={row as Row<unknown>}
                    renderDetail={<SessionRowActions session={row.original} />}
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

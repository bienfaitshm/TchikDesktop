"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Link } from "react-router";

import type { TSeatingSessionAttributes as TSeatingSession } from "@/packages/@core/data-access/schema-validations/types";
import { useGetSeatingSessions } from "@/renderer/libs/queries/seating";

import { Button } from "@/renderer/components/ui/button";
import { Suspense } from "@/renderer/libs/queries/suspense";
import { LoadingSpinner } from "@/renderer/components/loaders/loading-spinner";
import { PageShell } from "@/renderer/screens/layouts/page-shell.layout";
import { ButtonDialogDocumentExport } from "@/renderer/dialog-actions/dialog-document-expoter-actions";
import { useSchoolContext } from "@/renderer/hooks/app-config-router";

import {
  DataTable,
  DataContentBody,
  DataContentHead,
  DataTableContent,
  DataTablePagination,
  DataTableToolbar,
} from "@/renderer/components/tables/data-table";
import {
  seatingSessionColumns,
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
  type SeatingSessionDialogProps,
} from "@/renderer/dialog-actions/seating-session.dialog-actions";

const columns = enhanceColumnsExpandable(seatingSessionColumns);

interface SessionRowActionsProps extends Pick<
  SeatingSessionDialogProps,
  "queryKeysToInvalidate"
> {
  session: TSeatingSession;
}

/**
 * @description Actions de ligne.
 */
const SessionRowActions = React.memo(
  ({ session, queryKeysToInvalidate }: SessionRowActionsProps) => {
    return (
      <ActionContainer className="lg:grid-cols-4">
        {/* Redirection vers le détail de la session */}
        <Link to={`/seating/${session.sessionId}`} className="contents">
          <ActionTileDetail />
        </Link>

        {/* Édition : Correction de la prop initialData -> defaultValues */}
        <UpdateSeatingSessionDialog
          seatingSessionId={session.sessionId}
          defaultValues={session}
          queryKeysToInvalidate={queryKeysToInvalidate}
        >
          <ActionTileEdit />
        </UpdateSeatingSessionDialog>

        {/* Duplication */}
        <CreateSeatingSessionDialog
          defaultValues={session}
          queryKeysToInvalidate={queryKeysToInvalidate}
        >
          <ActionTileCopy />
        </CreateSeatingSessionDialog>

        {/* Suppression : Alignée avec notre API standardisée (Plus de Render Props) */}
        <DeleteSeatingSessionDialog
          seatingSessionId={session.sessionId}
          seatingSessionName={session.sessionName}
          queryKeysToInvalidate={queryKeysToInvalidate}
        >
          <ActionTileDelete />
        </DeleteSeatingSessionDialog>
      </ActionContainer>
    );
  },
);

SessionRowActions.displayName = "SessionRowActions";

export const SeatingPage = () => {
  const { schoolId, yearId } = useSchoolContext();

  const { data: rawSessions, queryKey: queryKeysToInvalidate } =
    useGetSeatingSessions({
      where: { schoolId, yearId },
    });
  const sessions = React.useMemo(() => rawSessions ?? [], [rawSessions]);
  const sessionIds = React.useMemo(
    () => (rawSessions ?? []).map((session) => session.sessionId),
    [rawSessions],
  );

  return (
    <div className="h-[calc(100vh-64px)] w-full overflow-hidden">
      <PageShell
        maxWidth="2xl"
        header={
          <section className="container flex items-center justify-between w-full max-w-(--breakpoint-2xl) my-4">
            <header className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">
                Sessions de mise en place
              </h1>
              <p className="text-sm text-muted-foreground">
                Organisez les plans de salle et la répartition des candidats.
              </p>
            </header>
            <CreateSeatingSessionDialog
              defaultValues={{ schoolId, yearId }}
              queryKeysToInvalidate={queryKeysToInvalidate}
            >
              <Button
                size="sm"
                className="rounded-full shadow-xs bg-primary hover:bg-primary/90"
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
          columns={columns}
          keyExtractor={(item) => item.sessionId}
        >
          <DataTableToolbar searchColumn="sessionName">
            <ButtonDialogDocumentExport
              schoolId={schoolId}
              yearId={yearId}
              defaultValues={{ sessionId: sessionIds }}
            />
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
                    row={row as any}
                    renderDetail={
                      <SessionRowActions
                        session={row.original}
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

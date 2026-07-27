"use client";

import * as React from "react";
import { Plus, Eye, Pencil, Copy, Trash2 } from "lucide-react";
import type { SeatingSession } from "@/packages/@core/data-access/db/schemas";
import { useGetSeatingSessions } from "@/renderer/libs/queries/seatings";
import { Button } from "@/renderer/components/ui/button";
import { Suspense } from "@/renderer/libs/queries/suspense";
import { LoadingSpinner } from "@/renderer/components/loaders/loading-spinner";
import { useSchoolContext } from "@/renderer/hooks/app-config-router";
import {
  DataTable,
  DataContentBody,
  DataContentHead,
  DataTableContent,
  DataTablePagination,
  DataTableToolbar,
  DataTableColumnToggle,
  FilteredTableToolbarContainer,
  SearchTableToolbar,
} from "@/renderer/components/tables/data-table";
import {
  seatingSessionColumns,
  enhanceColumns,
} from "@/renderer/components/tables/columns";
import {
  CreateSeatingSessionDialog,
  DeleteSeatingSessionDialog,
  UpdateSeatingSessionDialog,
  type SeatingSessionDialogProps,
} from "@/renderer/dialog-actions/seating-session.dialog-actions";
import { APP_ROUTES } from "@/renderer/constants";
import {
  createActionMenus,
  type ActionMenuConfig,
} from "@/components/menus/action-menus";
import {
  PageContainer,
  PageContent,
  PageHeadDescription,
  PageHeadTitle,
  PageHeader,
  PageHeaderTextContent,
} from "@/renderer/containers/page-container";

export interface SessionRowActionsProps extends Pick<
  SeatingSessionDialogProps,
  "mutationKey"
> {
  session: SeatingSession;
}

const MENUS: ActionMenuConfig<SessionRowActionsProps>[] = [
  {
    id: "details",
    label: "View session details",
    icon: Eye,
    link: ({ session }) => APP_ROUTES.SEATING.SESSION(session.sessionId),
  },
  {
    id: "edit",
    label: "Edit session",
    icon: Pencil,
    dialog({ session, mutationKey }) {
      return (
        <UpdateSeatingSessionDialog
          sessionId={session.sessionId}
          sessionName={session.sessionName}
          defaultValues={session}
          mutationKey={mutationKey}
        />
      );
    },
  },
  {
    id: "duplicate",
    label: "Duplicate session",
    icon: Copy,
    dialog({ session, mutationKey }) {
      return (
        <CreateSeatingSessionDialog
          defaultValues={session}
          mutationKey={mutationKey}
        />
      );
    },
  },
  {
    id: "delete",
    label: "Delete session",
    icon: Trash2,
    separator: true,
    variant: "destructive",
    dialog({ session, mutationKey }) {
      return (
        <DeleteSeatingSessionDialog
          id={session.sessionId}
          name={session.sessionName}
          mutationKey={mutationKey}
        />
      );
    },
  },
];

/**
 * Renders contextual action menus for a given seating session row.
 * @param props - Component properties containing the seating session entity and mutation key.
 * @returns The rendered action menu component.
 */
export const SessionRowAction = createActionMenus(MENUS);

/**
 * Main application screen component for viewing and managing seating sessions.
 * @returns Rendered seating sessions management page layout with data table and toolbars.
 */
export const SeatingPage: React.FC = () => {
  const { schoolId, yearId } = useSchoolContext();
  const { data: sessions = [], queryKey: mutationKey } = useGetSeatingSessions({
    where: { seatingSessions: { schoolId, yearId } },
  });
  const columns = React.useMemo(
    () =>
      enhanceColumns(seatingSessionColumns, {
        variant: "actions",
        renderRowAction(session) {
          return (
            <SessionRowAction session={session} mutationKey={mutationKey} />
          );
        },
      }),
    [mutationKey],
  );

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderTextContent>
          <PageHeadTitle> Seating Sessions</PageHeadTitle>
          <PageHeadDescription>
            {" "}
            Organize seating plans and candidate distribution.
          </PageHeadDescription>
        </PageHeaderTextContent>
      </PageHeader>
      <PageContent>
        <DataTable<SeatingSession>
          data={sessions}
          columns={columns}
          keyExtractor={(item) => item.sessionId}
        >
          <DataTableToolbar>
            <FilteredTableToolbarContainer>
              <SearchTableToolbar
                searchColumn="sessionName"
                placeholder="Search Ex. Session A"
              />
            </FilteredTableToolbarContainer>
            <div className="flex items-center gap-4">
              <DataTableColumnToggle />
              <CreateSeatingSessionDialog
                defaultValues={{ schoolId, yearId }}
                mutationKey={mutationKey}
              >
                <Button
                  size="sm"
                  className="rounded-full shadow-xs bg-primary hover:bg-primary/90"
                >
                  <Plus className="mr-2 size-4" />
                  New Session
                </Button>
              </CreateSeatingSessionDialog>
            </div>
          </DataTableToolbar>

          <Suspense
            fallback={
              <div className="flex h-64 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/5">
                <LoadingSpinner className="text-primary" />
                <p className="text-sm text-muted-foreground animate-pulse">
                  Loading sessions...
                </p>
              </div>
            }
          >
            <DataTableContent>
              <DataContentHead />
              <DataContentBody />
            </DataTableContent>
            <DataTablePagination />
          </Suspense>
        </DataTable>
      </PageContent>
    </PageContainer>
  );
};

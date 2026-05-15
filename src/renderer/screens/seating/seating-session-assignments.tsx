import { useCallback, useMemo } from "react";
import { useParams } from "react-router";
import { Row } from "@tanstack/react-table";
import { useGetRoomLayout } from "@/renderer/libs/queries/seating";
import {
  DataTable,
  DataContentBody,
  DataContentHead,
  DataTableContent,
  DataTablePagination,
  DataTableToolbar,
  TableFacetedFilterItem,
} from "@/renderer/components/tables/data-table";
import {
  seatingStudentColumns,
  enhanceColumnsExpandable,
} from "@/renderer/components/tables/columns";
import { ExpandableRow } from "@/renderer/components/tables/data-table.expandable";
import { PageShell } from "@/renderer/components/layouts/page-shell.layout";
import { Suspense } from "@/renderer/libs/queries/suspense";
import { LoadingSpinner } from "@/renderer/components/loaders/loading-spinner";
import type { StudentSeating } from "@/renderer/components/tables/columns.seating-student";
import type { Assignment } from "@/packages/@core/apis/clients/seatings";
import { GENDER_OPTIONS } from "@/packages/@core/data-access/db/options";

const columns = enhanceColumnsExpandable(seatingStudentColumns);

export const SeatingSessionAssignmentPage = () => {
  const { localroomId, sessionId } = useParams<{
    localroomId: string;
    sessionId: string;
  }>();
  const { data: layoutAssignments = [] } = useGetRoomLayout(
    sessionId!,
    localroomId!,
  );

  console.log("layoutAssignments", layoutAssignments);
  const formattedData = useMemo(() => {
    return layoutAssignments.map(
      (layout: Assignment): StudentSeating => ({
        classroomId: layout.classroom.classId,
        identifier: layout.classroom.identifier,
        fullName:
          `${layout.student.lastName} ${layout.student.middleName} ${layout.student.firstName}`.trim(),
        gender: layout.student.gender,
        column: layout.column,
        row: layout.row,
      }),
    );
  }, [layoutAssignments]);

  const keyExtractor = useCallback(
    (item: StudentSeating) =>
      `${item.classroomId}-${item.fullName}-${item.row}-${item.column}`,
    [],
  );

  return (
    <PageShell
      maxWidth="2xl"
      header={
        <section className="container flex items-center justify-between w-full max-w-screen-2xl my-4">
          <header className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">
              Plan d'Occupation
            </h1>
            <p className="text-sm text-muted-foreground">
              Visualisez la répartition des étudiants dans la salle.
            </p>
          </header>
        </section>
      }
    >
      <DataTable<StudentSeating>
        data={formattedData}
        columns={columns}
        keyExtractor={keyExtractor}
      >
        <DataTableToolbar searchColumn="fullName" className="flex-wrap gap-4">
          <TableFacetedFilterItem
            columnId="gender"
            title="Sexe"
            options={GENDER_OPTIONS}
          />
        </DataTableToolbar>

        <Suspense fallback={<TableSkeleton />}>
          <DataTableContent>
            <DataContentHead />
            <DataContentBody<StudentSeating>>
              {({ row }) => <ExpandableRow row={row as Row<any>} />}
            </DataContentBody>
          </DataTableContent>

          <DataTablePagination />
        </Suspense>
      </DataTable>
    </PageShell>
  );
};

const TableSkeleton = () => (
  <div className="flex h-64 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/5">
    <LoadingSpinner className="text-primary" />
    <p className="text-sm text-muted-foreground animate-pulse">
      Génération du plan de salle...
    </p>
  </div>
);

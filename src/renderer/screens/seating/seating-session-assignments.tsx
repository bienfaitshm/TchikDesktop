import { useCallback, useMemo } from "react";
import { useParams } from "react-router";
import { Row } from "@tanstack/react-table";
import {
  useGetLocalRoomById,
  useGetRoomLayout,
} from "@/renderer/libs/queries/seatings";
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
import { PageShell } from "@/renderer/screens/layouts/page-shell.layout";
import { Suspense } from "@/renderer/libs/queries/suspense";
import { LoadingSpinner } from "@/renderer/components/loaders/loading-spinner";
import type { StudentSeating } from "@/renderer/components/tables/columns.seating-student";
import type { Assignment } from "@/packages/@core/apis/clients/seatings";
import { GENDER_OPTIONS } from "@/packages/@core/data-access/db/options";
import { Separator } from "@/renderer/components/ui/separator";
import { DoorOpen, Layout, Users } from "lucide-react";
import { Badge } from "@/renderer/components/ui/badge";

const columns = enhanceColumnsExpandable(seatingStudentColumns);

export const SeatingSessionAssignmentPage = () => {
  const { localroomId, sessionId } = useParams<{
    localroomId: string;
    sessionId: string;
  }>();
  const { data: localroom } = useGetLocalRoomById(localroomId as string);
  const { data: layoutAssignments = [] } = useGetRoomLayout(
    sessionId!,
    localroomId!,
  );

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
        <RoomHeaderInfo
          localroom={localroom}
          layoutAssignments={layoutAssignments}
        />
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

export const RoomHeaderInfo = ({ localroom, layoutAssignments }) => {
  const occupancyRate =
    (layoutAssignments.length / localroom.maxCapacity) * 100;

  return (
    <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full max-w-(--breakpoint-2xl) mt-2 gap-4">
      <header className="space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-primary/10 text-primary">
            <DoorOpen className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">{localroom.name}</h2>
          <Badge variant="outline" className="ml-2 font-mono">
            {localroom.maxCapacity} places
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <Layout className="h-3.5 w-3.5" />
          Visualisez la répartition des éleves dans la salle.
        </p>
      </header>

      <div className="flex items-center gap-6 bg-muted/30 px-4 py-2 rounded-xl border border-border/50">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">
            Assignés
          </span>
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-lg font-semibold tabular-nums">
              {layoutAssignments.length}
            </span>
          </div>
        </div>

        <Separator orientation="vertical" className="h-8" />

        <div className="flex flex-col">
          <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">
            Remplissage
          </span>
          <span
            className={`text-lg font-semibold tabular-nums ${occupancyRate > 90 ? "text-destructive" : "text-foreground"}`}
          >
            {Math.round(occupancyRate)}%
          </span>
        </div>
      </div>
    </section>
  );
};

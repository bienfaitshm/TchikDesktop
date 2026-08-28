"use client";

import { useCallback, useMemo, type FC } from "react";
import { useParams } from "react-router";
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
  enhanceColumns,
} from "@/renderer/components/tables/columns";
import { Suspense } from "@/renderer/libs/queries/suspense";
import { LoadingSpinner } from "@/renderer/components/loaders/loading-spinner";
import type { StudentSeating } from "@/renderer/components/tables/columns.seating-student";
import type { Assignment } from "@/packages/@core/apis/clients/seatings";
import type { Localroom } from "@/packages/@core/data-access/db/schemas";
import { GENDER_OPTIONS } from "@/packages/@core/data-access/db/options";
import { Separator } from "@/renderer/components/ui/separator";
import { Users } from "lucide-react";
import {
  PageContainer,
  PageContent,
  PageHeadAction,
  PageHeadDescription,
  PageHeadTitle,
  PageHeader,
  PageHeaderTextContent,
} from "@/renderer/containers/page-container";

const columns = enhanceColumns(seatingStudentColumns);

/**
 * Main application screen component for viewing and managing student seating assignments.
 * @returns Rendered seating session assignment page layout with data table and headers.
 */
export const SeatingSessionAssignmentPage: FC = () => {
  const { localroomId = "", sessionId = "" } = useParams<{
    localroomId: string;
    sessionId: string;
  }>();
  const { data: localroom } = useGetLocalRoomById(localroomId);
  const { data: layoutAssignments = [] } = useGetRoomLayout(
    sessionId,
    localroomId,
  );

  const formattedData = useMemo(() => {
    return layoutAssignments.map((layout: Assignment): StudentSeating => ({
      classroomId: layout.classroom.classId,
      identifier: layout.classroom.identifier,
      fullName:
        `${layout.student.lastName} ${layout.student.middleName} ${layout.student.firstName ?? ""}`.trim(),
      gender: layout.student.gender,
      column: layout.column,
      row: layout.row,
    }));
  }, [layoutAssignments]);

  const keyExtractor = useCallback(
    (item: StudentSeating) =>
      `${item.classroomId}-${item.fullName}-${item.row}-${item.column}`,
    [],
  );

  return (
    <PageContainer>
      <RoomHeaderInfo
        layoutAssignments={layoutAssignments}
        localroom={localroom}
      />
      <PageContent>
        <DataTable<StudentSeating>
          data={formattedData}
          columns={columns}
          keyExtractor={keyExtractor}
        >
          <DataTableToolbar className="flex-wrap gap-4">
            <TableFacetedFilterItem
              columnId="gender"
              title="Genre"
              options={GENDER_OPTIONS}
            />
          </DataTableToolbar>
          <Suspense fallback={<TableSkeleton />}>
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

/**
 * Renders a loading skeleton placeholder container while seating layout data is loading.
 * @returns The rendered loading skeleton component.
 */
export const TableSkeleton: FC = () => (
  <div className="flex h-64 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/5">
    <LoadingSpinner className="text-primary" />
    <p className="text-sm text-muted-foreground animate-pulse">
      Génération du plan de placement...
    </p>
  </div>
);

/**
 * Props for the RoomHeaderInfo component.
 */
export interface RoomHeaderInfoProps {
  localroom?: Localroom;
  layoutAssignments: Assignment[];
}

/**
 * Renders the header section for the seating session layout page with occupancy metrics.
 * @param props - Component properties containing local room info and assignments.
 * @returns The rendered room header info component.
 */
export const RoomHeaderInfo: FC<RoomHeaderInfoProps> = ({
  localroom,
  layoutAssignments,
}) => {
  const maxCapacity = localroom?.maxCapacity ?? 0;
  const occupancyRate =
    maxCapacity > 0 ? (layoutAssignments.length / maxCapacity) * 100 : 0;

  return (
    <PageHeader>
      <PageHeaderTextContent>
        <PageHeadTitle>{localroom?.name ?? "Salle"}</PageHeadTitle>
        <PageHeadDescription>
          Consultez la répartition des élèves dans la salle.
        </PageHeadDescription>
      </PageHeaderTextContent>
      <PageHeadAction>
        <div className="flex items-center gap-6 bg-muted/30 px-4 py-2 rounded-xl border border-border/50">
          <div className="flex flex-col justify-center items-center">
            <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">
              Assignés
            </span>
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-lg font-semibold tabular-nums">
                {layoutAssignments.length} / {maxCapacity}
              </span>
            </div>
          </div>
          <Separator orientation="vertical" className="h-8" />
          <div className="flex flex-col justify-center items-center">
            <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">
              Occupation
            </span>
            <span
              className={`text-lg font-semibold tabular-nums ${occupancyRate > 90 ? "text-destructive" : "text-foreground"}`}
            >
              {Math.round(occupancyRate)}%
            </span>
          </div>
        </div>
      </PageHeadAction>
    </PageHeader>
  );
};

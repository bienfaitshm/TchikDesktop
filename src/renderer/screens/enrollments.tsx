import { UserPlus, History } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/renderer/components/ui/empty";
import { Button } from "@/renderer/components/ui/button";
import {
  DataTable,
  DataContentHead,
  DataTableContent,
  DataContentBody,
  DataTablePagination,
} from "@/renderer/components/tables";
import { enrollmentHistoryColumns } from "@/renderer/components/tables/columns";
import { CreateEnrollmentDialog } from "@/renderer/dialog-actions/enrollment.dialog-actions";
import { useGetEnrollments } from "@/renderer/libs/queries/enrollments";
import { useSchoolContext } from "@/renderer/hooks/app-config-router";
import type { EnrollementData } from "@/packages/@core/apis/clients";

interface SchoolYearProps {
  schoolId: string;
  yearId: string;
}

interface EnrollmentHistoryProps extends SchoolYearProps {
  enrollments?: EnrollementData[];
}

export const EnrollmentHistory = ({
  schoolId,
  yearId,
  enrollments = [],
}: EnrollmentHistoryProps) => {
  return (
    <div className="w-full">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 mt-10">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Historique des Inscriptions
          </h1>
          <p className="text-sm text-muted-foreground">
            Consultez et gérez l'historique des inscriptions pour l'année
            scolaire en cours.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <CreateEnrollmentDialog
            schoolId={schoolId}
            yearId={yearId}
            defaultValues={{ schoolId, yearId }}
          >
            <Button className="gap-2 shadow-xs">
              <UserPlus className="h-4 w-4" />
              <span>Inscription Complète</span>
            </Button>
          </CreateEnrollmentDialog>
        </div>
      </header>

      <main>
        <DataTable
          columns={enrollmentHistoryColumns}
          data={enrollments}
          keyExtractor={(row) => `${row.enrollmentId}-${row.student.userId}`}
        >
          <DataTableContent>
            <DataContentHead />
            <DataContentBody />
          </DataTableContent>
          <DataTablePagination />
        </DataTable>
      </main>
    </div>
  );
};

export const EmptyEnrollmentHistory = ({
  schoolId,
  yearId,
}: SchoolYearProps) => {
  return (
    <div className="h-[50vh] flex justify-center items-centerw-full">
      <Empty>
        <EmptyContent>
          <EmptyHeader>
            <EmptyMedia>
              <History className="h-12 w-12 text-muted-foreground/50 mb-4" />
            </EmptyMedia>
          </EmptyHeader>
          <EmptyTitle className="mb-4 text-center">
            Aucun historique d'inscription trouvé pour cette période.
          </EmptyTitle>
          <CreateEnrollmentDialog
            schoolId={schoolId}
            yearId={yearId}
            defaultValues={{ schoolId, yearId }}
          >
            <Button className="gap-2 shadow-xs mx-auto">
              <UserPlus className="h-4 w-4" />
              <span>Inscrivez votre premier élève de l'année</span>
            </Button>
          </CreateEnrollmentDialog>
        </EmptyContent>
      </Empty>
    </div>
  );
};

export const EnrollmentPage = () => {
  const { schoolId, yearId } = useSchoolContext();

  const { data: enrollments = [] } = useGetEnrollments({
    where: { schoolId, yearId },
    limit: 20,
    orderBy: [{ column: "createdAt", order: "desc" }],
  });

  return (
    <div className="container mx-auto max-w-7xl py-10 px-4">
      {enrollments.length > 0 ? (
        <EnrollmentHistory
          yearId={yearId}
          schoolId={schoolId}
          enrollments={enrollments}
        />
      ) : (
        <EmptyEnrollmentHistory yearId={yearId} schoolId={schoolId} />
      )}
    </div>
  );
};

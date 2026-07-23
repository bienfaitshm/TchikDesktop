import { useParams } from "react-router";
import {
  PageContainer,
  PageContent,
  PageHeadTitle,
  PageHeader,
  PageHeaderTextContent,
  PageHeadDescription,
} from "@/renderer/containers/page-container";
import { useGetClassroomById } from "@/renderer/libs/queries/classrooms";
import { Suspense } from "@/renderer/libs/queries/suspense";
import { useCurrentConfig } from "@/renderer/libs/stores/app-store";
import { ClassroomProgressFallback } from "../contents/classroom-progress-fallback";
import { StudentSchedulePaymentTabs } from "../contents/student-schedule-payment-tab";

/**
 * Renders the detail page for classroom payment schedules and transactions.
 * Fetches classroom metadata and renders tabbed payment contents for students.
 * @returns The rendered classroom payment detail page component.
 */
export const ClassroomPaymentDetailPage = () => {
  const { schoolId, yearId } = useCurrentConfig();
  const { classroomId = "" } = useParams<{ classroomId: string }>();
  const { data: classroom, isLoading } = useGetClassroomById(classroomId);

  if (isLoading || !classroom || !schoolId || !yearId) {
    return <ClassroomProgressFallback />;
  }

  return (
    <PageContainer>
      <PageHeader className="mt-10">
        <PageHeaderTextContent>
          <PageHeadTitle>
            Tableau de paiement de{" "}
            <b className="text-primary">{classroom.shortIdentifier}</b>
          </PageHeadTitle>
          <PageHeadDescription>
            Consultez et gérez l'état des paiements et l'échéancier des élèves
            de cette classe.
          </PageHeadDescription>
        </PageHeaderTextContent>
      </PageHeader>
      <PageContent>
        <Suspense fallback={<ClassroomProgressFallback />}>
          <StudentSchedulePaymentTabs
            classId={classroomId}
            schoolId={schoolId}
            yearId={yearId}
          />
        </Suspense>
      </PageContent>
    </PageContainer>
  );
};

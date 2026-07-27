"use client";
import { useParams } from "react-router";
import { SeatingGeneratorDialog } from "@/renderer/dialog-actions/seating-generator";
import { useGetSeatingSessionById } from "@/renderer/libs/queries/seatings";
import { Skeleton } from "@/renderer/components/ui/skeleton";
import { useInvalidateSeatingCache } from "@/renderer/dialog-actions/seating-generator/hooks";
import { APP_ROUTES } from "@/renderer/constants";
import { LocalRoomsLayout as LCLayout } from "@/renderer/layouts/localroom-layout";
import { useCurrentConfig } from "@/renderer/libs/stores/app-store";
import {
  PageContainer,
  PageContent,
} from "@/renderer/containers/page-container";
import { EmptySeatingMessage } from "../containers/empty-seating";

export const LocalRoomsLayout = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { schoolId, yearId } = useCurrentConfig();
  const invalidate = useInvalidateSeatingCache();

  const { data: seatingSession, isLoading } = useGetSeatingSessionById(
    sessionId!,
  );

  if (isLoading) {
    return (
      <PageContainer>
        <PageContent>
          <div className="p-6">
            <Skeleton className="h-125 w-full rounded-3xl" />
          </div>
        </PageContent>
      </PageContainer>
    );
  }

  if (!seatingSession) return null;

  const { hasAssignments, sessionName } = seatingSession;

  if (!hasAssignments) {
    return (
      <EmptySeatingMessage sessionName={sessionName}>
        <SeatingGeneratorDialog
          schoolId={schoolId!}
          sessionId={sessionId!}
          yearId={yearId!}
          hasAssignments={hasAssignments}
          onSuccess={invalidate}
          sessionName={sessionName}
        />
      </EmptySeatingMessage>
    );
  }
  return (
    <LCLayout
      schoolId={schoolId!}
      sessionId={sessionId!}
      navigateTo={(localroomId) =>
        APP_ROUTES.SEATING.ASSIGNMENT(sessionId!, localroomId)
      }
    />
  );
};

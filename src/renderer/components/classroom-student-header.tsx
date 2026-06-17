"use client";

import { useMemo } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/renderer/components/ui/button";
import { useGetClassroomById } from "@/renderer/libs/queries/classrooms";
import { Skeleton } from "@/renderer/components/ui/skeleton";
import { CreateEnrollmentDialog } from "@/renderer/dialog-actions/enrollment.dialog-actions";
export const ClassroomHeader = ({
  classId,
  schoolId,
  yearId,
}: {
  classId: string;
  schoolId: string;
  yearId: string;
}) => {
  const { data: classroom, isLoading } = useGetClassroomById(classId);
  const defaultValues = useMemo(
    () => ({ schoolId, yearId, classroomId: classId }),
    [schoolId, yearId, classId],
  );

  if (isLoading) return <HeaderSkeleton />;

  return (
    <div className="space-y-4 w-full mt-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight">
              {classroom?.identifier}
            </h1>
          </div>
          <p className="text-muted-foreground text-xs mt-1 uppercase tracking-wider font-medium">
            Liste des élèves inscrits dans cette classe.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <CreateEnrollmentDialog
            schoolId={schoolId}
            yearId={yearId}
            defaultValues={defaultValues}
          >
            <Button size="sm" className="gap-2 shadow-xs">
              <UserPlus className="h-4 w-4" />
              <span>Nouvelle Inscription</span>
            </Button>
          </CreateEnrollmentDialog>
        </div>
      </div>
    </div>
  );
};

const HeaderSkeleton = () => (
  <div className="space-y-4 py-4">
    <div className="flex items-center gap-4">
      <Skeleton className="h-12 w-12 rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-40" />
      </div>
    </div>
  </div>
);

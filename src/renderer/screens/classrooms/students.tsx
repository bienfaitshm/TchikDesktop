"use client";

import React from "react";
import { useParams } from "react-router";
import { Edit2, UserPen, UserPlus, Banknote, Trash2 } from "lucide-react";

import {
  GENDER_OPTIONS,
  STUDENT_STATUS_OPTIONS,
} from "@/packages/@core/data-access/db/options";
import {
  DataTable,
  TableFacetedFilterItem,
  DataTableContent,
  DataContentHead,
  DataContentBody,
  DataTablePagination,
  DataTableToolbar,
  FilteredTableToolbarContainer,
  SearchTableToolbar,
  DataTableColumnToggle,
} from "@/renderer/components/tables";
import { studentColumns } from "@/renderer/components/tables/columns.students";
import { useGetEnrollments } from "@/renderer/libs/queries/enrollements/enrollments";
import {
  CreateEnrollmentDialog,
  DeleteEnrollmentDialog,
  UpdateEnrollmentDialog,
  type CreateEnrollmentDialogProps,
} from "@/renderer/dialog-actions/enrollment.dialog-actions";
import { UpdateStudentDialog } from "@/renderer/dialog-actions/student.dialog-action";
import { enhanceColumns } from "@/renderer/components/tables/columns";
import { useSchoolContext } from "@/renderer/hooks/app-config-router";
import { Button } from "@/renderer/components/ui/button";
import { SchedulePaymentDialog } from "@/renderer/apps/finances/dialog/student-payement-schedule.dialog";
import type { Classroom, EnrollmentDTO } from "@/packages/@core/data-access/db";
import {
  createActionMenus,
  type ActionMenuConfig,
} from "@/components/menus/action-menus";

export interface EnrollmentRowActionsProps extends CreateEnrollmentDialogProps {
  enrollment: EnrollmentDTO;
}

const MENUS: ActionMenuConfig<EnrollmentRowActionsProps>[] = [
  {
    id: "edit-student",
    label: "Modifier le profil de l'élève",
    icon: UserPen,
    dialog({ enrollment, mutationKey }) {
      const { student } = enrollment;
      return (
        <UpdateStudentDialog
          userId={student.userId}
          mutationKey={mutationKey}
          defaultValues={student}
        />
      );
    },
  },
  {
    id: "edit-enrollment",
    label: "Gérer l'inscription",
    icon: Edit2,
    dialog({
      enrollment: { student, classroom, ...enrollment },
      schoolId,
      yearId,
      mutationKey,
    }) {
      return (
        <UpdateEnrollmentDialog
          defaultValues={enrollment}
          fullName={student.fullName}
          enrollmentId={enrollment.enrollmentId}
          schoolId={schoolId}
          yearId={yearId}
          mutationKey={mutationKey}
        />
      );
    },
  },
  {
    id: "delete",
    label: "Supprimer l'inscription",
    icon: Trash2,
    separator: true,
    variant: "destructive",
    dialog({ enrollment: { student, classroom, ...enrollment }, mutationKey }) {
      return (
        <DeleteEnrollmentDialog
          name={student.fullName ?? student.lastName}
          id={enrollment.enrollmentId}
          mutationKey={mutationKey}
        />
      );
    },
  },
];

/**
 * Renders contextual action menus for a given enrollment row.
 * @param props - Component properties containing the enrollment entity, school ID, year ID, and mutation key.
 * @returns The rendered action menu component.
 */
export const EnrollmentRowAction: React.FC<EnrollmentRowActionsProps> =
  createActionMenus<EnrollmentRowActionsProps>(MENUS);

/**
 * Main application screen component for viewing and managing student enrollments.
 * @returns Rendered student management page layout with data table and toolbars.
 */
export const StudentPage: React.FC = () => {
  const { schoolId, yearId, classroom } = useSchoolContext<{
    classroom: Classroom;
  }>();
  const { classroomId } = useParams();
  const { data: students = [], queryKey: mutationKey } = useGetEnrollments({
    where: {
      classroomEnrollments: {
        classroomId,
        schoolId,
        yearId,
      },
    },
  });

  const columns = React.useMemo(
    () =>
      enhanceColumns(studentColumns, {
        variant: "actions",
        renderRowAction: (enrollment) => (
          <EnrollmentRowAction
            schoolId={schoolId}
            yearId={yearId}
            enrollment={enrollment}
            mutationKey={mutationKey}
          />
        ),
      }),
    [mutationKey, schoolId, yearId],
  );

  return (
    <DataTable<EnrollmentDTO>
      data={students}
      columns={columns}
      keyExtractor={(s) => s.enrollmentId}
    >
      <DataTableToolbar>
        <FilteredTableToolbarContainer>
          <SearchTableToolbar
            searchColumn="student_fullName"
            placeholder="Rechercher ex. SHOMARI"
          />
          <TableFacetedFilterItem
            columnId="student_gender"
            title="Genre"
            options={GENDER_OPTIONS}
          />
          <TableFacetedFilterItem
            columnId="status"
            title="Statut"
            options={STUDENT_STATUS_OPTIONS}
          />
        </FilteredTableToolbarContainer>
        <div className="flex items-center gap-4">
          <SchedulePaymentDialog
            schoolId={schoolId}
            yearId={yearId}
            classId={classroomId as string}
            classroomName={classroom.shortIdentifier}
          >
            <Button variant="outline">
              <Banknote />
              <span>Paiements</span>
            </Button>
          </SchedulePaymentDialog>
          <CreateEnrollmentDialog
            schoolId={schoolId}
            yearId={yearId}
            defaultValues={{ schoolId, yearId, classroomId }}
          >
            <Button size="sm" className="gap-2 shadow-xs">
              <UserPlus className="h-4 w-4" />
              <span>Nouvelle inscription</span>
            </Button>
          </CreateEnrollmentDialog>
          <DataTableColumnToggle />
        </div>
      </DataTableToolbar>
      <DataTableContent>
        <DataContentHead className="bg-muted/10" />
        <DataContentBody />
      </DataTableContent>
      <DataTablePagination />
    </DataTable>
  );
};

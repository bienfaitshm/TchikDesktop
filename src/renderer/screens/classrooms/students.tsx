"use client";

import React from "react";
import { useParams } from "react-router";
import { Edit2, UserPen, UserPlus, Banknote, Eye, Trash2 } from "lucide-react";

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
  type DialogProps,
} from "@/renderer/dialog-actions/enrollment.dialog-actions";
import { UpdateStudentDialog } from "@/renderer/dialog-actions/student.dialog-action";

import { ExpandableRow } from "@/renderer/components/tables/data-table.expandable";
import { enhanceColumnsExpandable } from "@/renderer/components/tables/columns";
import { useSchoolContext } from "@/renderer/hooks/app-config-router";
import { Button } from "@/renderer/components/ui/button";
import { SchedulePaymentDialog } from "@/renderer/apps/finances/dialog/student-payement-schedule.dialog";
import type { Classroom, EnrollmentTDO } from "@/packages/@core/data-access/db";
import {
  createActionMenus,
  type ActionMenuConfig,
} from "@/components/menus/action-menus";
import type { Row } from "@tanstack/react-table";

const enrollmentStudentColumns = enhanceColumnsExpandable(studentColumns);

export interface EnrollmentRowActionsProps extends DialogProps {
  enrollmentItem: EnrollmentTDO;
}

const MENUS: ActionMenuConfig<EnrollmentRowActionsProps>[] = [
  {
    id: "details",
    label: "View details",
    icon: Eye,
    dialog({ enrollmentItem }) {
      return <span>View details</span>;
    },
  },
  {
    id: "edit-student",
    label: "Edit student profile",
    icon: UserPen,
    dialog({ enrollmentItem, mutationKey }) {
      const { student } = enrollmentItem;
      return (
        <UpdateStudentDialog
          studentId={student.userId}
          mutationKey={mutationKey}
          defaultValues={student}
        />
      );
    },
  },
  {
    id: "edit-enrollment",
    label: "Manage enrollment",
    icon: Edit2,
    dialog({ enrollmentItem, schoolId, yearId, mutationKey }) {
      const { student, classroom, ...enrollment } = enrollmentItem;
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
    label: "Delete enrollment",
    icon: Trash2,
    separator: true,
    variant: "destructive",
    dialog({ enrollmentItem, schoolId, yearId, mutationKey }) {
      const { student, classroom, ...enrollment } = enrollmentItem;
      return (
        <DeleteEnrollmentDialog
          studentName={student.fullName!}
          enrollmentId={enrollment.enrollmentId}
          schoolId={schoolId}
          yearId={yearId}
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
export const EnrollmentRowAction = createActionMenus(MENUS);

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
    where: { schoolId, yearId, classroomId: classroomId! },
  });

  return (
    <div className="overflow-hidden">
      <DataTable
        data={students}
        columns={enrollmentStudentColumns}
        keyExtractor={(s: any) => s.enrollmentId ?? s.enrolementId}
      >
        <DataTableToolbar>
          <FilteredTableToolbarContainer>
            <SearchTableToolbar
              searchColumn="student_fullName"
              placeholder="Search Ex. SHOMARI"
            />
            <TableFacetedFilterItem
              columnId="student_gender"
              title="Gender"
              options={GENDER_OPTIONS}
            />
            <TableFacetedFilterItem
              columnId="status"
              title="Status"
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
                <span>Payments</span>
              </Button>
            </SchedulePaymentDialog>
            <CreateEnrollmentDialog
              schoolId={schoolId}
              yearId={yearId}
              defaultValues={{ schoolId, yearId, classroomId }}
            >
              <Button size="sm" className="gap-2 shadow-xs">
                <UserPlus className="h-4 w-4" />
                <span>New Enrollment</span>
              </Button>
            </CreateEnrollmentDialog>
            <DataTableColumnToggle />
          </div>
        </DataTableToolbar>
        <DataTableContent>
          <DataContentHead className="bg-muted/10" />
          <DataContentBody>
            {({ row }) => (
              <ExpandableRow
                row={row as Row<unknown>}
                className="hover:bg-muted/5 transition-colors cursor-pointer"
                renderDetail={
                  <EnrollmentRowAction
                    enrollmentItem={row.original as any}
                    schoolId={schoolId}
                    yearId={yearId}
                    mutationKey={mutationKey}
                  />
                }
              />
            )}
          </DataContentBody>
        </DataTableContent>
        <DataTablePagination />
      </DataTable>
    </div>
  );
};

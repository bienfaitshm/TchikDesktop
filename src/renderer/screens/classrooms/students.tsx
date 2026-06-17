"use client";

import { useMemo } from "react";
import { useParams } from "react-router";
import { Edit2, UserPen } from "lucide-react";

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
} from "@/renderer/components/tables";
import {
  StudentColumns,
  TEnrolement,
} from "@/renderer/components/tables/columns.students";
import { useGetEnrollments } from "@/renderer/libs/queries/enrollements/enrollments";
import {
  ActionContainer,
  ActionTileDelete,
  ActionTileDetail,
  ActionTile,
} from "@/renderer/components/tables/data-table.action-tiles";
import {
  DeleteEnrollmentDialog,
  UpdateEnrollmentDialog,
} from "@/renderer/dialog-actions/enrollment.dialog-actions";
import { UpdateStudentDialog } from "@/renderer/dialog-actions/student.dialog-action";

import { ExpandableRow } from "@/renderer/components/tables/data-table.expandable";
import { enhanceColumnsExpandable } from "@/renderer/components/tables/columns";
import type { BaseFormConfig } from "@/renderer/dialog-actions/base.dialog-actions";

import { useSchoolContext } from "@/renderer/hooks/app-config-router";
import { ButtonSheetStudentStat } from "@/renderer/components/sheets/students.stat";

const enrolementStudentColumns = enhanceColumnsExpandable(StudentColumns);

/** * ACTIONS : Rafraîchies avec un design plus compact
 */
const EnrollementActions = ({
  enrolement,
  schoolId,
  yearId,
  options,
}: {
  schoolId: string;
  yearId: string;
  options?: BaseFormConfig;
  enrolement: TEnrolement;
}) => {
  const { student, enrolementId, studentId, ...restValue } = enrolement;
  const initialData = useMemo(
    () => ({ ...restValue, schoolId, yearId, enrolementId }),
    [restValue, schoolId, yearId, enrolementId],
  );

  return (
    <ActionContainer>
      <ActionTileDetail />
      <UpdateStudentDialog
        studentId={studentId}
        initialData={student}
        {...options}
      >
        <ActionTile
          icon={UserPen}
          label="Profil"
          description="Modifier l'identité de l'élève"
        />
      </UpdateStudentDialog>
      <UpdateEnrollmentDialog
        initialData={initialData}
        fullName={student.fullName}
        enrollmentId={enrolementId}
        schoolId={schoolId}
        yearId={yearId}
        {...options}
      >
        <ActionTile
          icon={Edit2}
          label="Gérer l'inscription"
          description="Modifier le statut, gérer les transferts ou signaler un abandon."
        />
      </UpdateEnrollmentDialog>
      <DeleteEnrollmentDialog
        enrollmentId={enrolementId}
        studentName={student.fullName}
        {...options}
      >
        {({ onOpen }) => <ActionTileDelete onClick={onOpen} />}
      </DeleteEnrollmentDialog>
    </ActionContainer>
  );
};

export const StudentPage = () => {
  const { schoolId, yearId } = useSchoolContext();
  const { classroomId } = useParams();
  const { data: students = [], queryKey } = useGetEnrollments({
    where: { schoolId, yearId, classroomId: classroomId! },
  });
  // min-h-screen
  return (
    <div className="overflow-hidden">
      <DataTable
        data={students}
        columns={enrolementStudentColumns}
        keyExtractor={(s: any) => s.enrolementId}
      >
        <DataTableToolbar
          searchColumn="student_fullName"
          className="flex-wrap gap-4"
        >
          <ButtonSheetStudentStat students={[]} />
          <TableFacetedFilterItem
            columnId="student_gender"
            title="Sexe"
            options={GENDER_OPTIONS}
          />
          <TableFacetedFilterItem
            columnId="status"
            title="Statut"
            options={STUDENT_STATUS_OPTIONS}
          />
        </DataTableToolbar>
        <DataTableContent>
          <DataContentHead className="bg-muted/10" />
          <DataContentBody>
            {({ row }) => (
              <ExpandableRow
                row={row as any}
                className="hover:bg-muted/5 transition-colors cursor-pointer"
                renderDetail={
                  <EnrollementActions
                    enrolement={row.original as any}
                    schoolId={schoolId}
                    yearId={yearId}
                    options={{ mutationKeys: queryKey }}
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

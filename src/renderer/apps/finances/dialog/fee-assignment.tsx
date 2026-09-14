import type { ReactNode } from "react";
import {
  FeeBulkAssignmentForm,
  type FeeBulkAssignmentData,
} from "@/renderer/apps/finances/forms/fee-bulk-assignment-form";
import {
  UpdateAmountByAssignmentForm,
  UpdateAmountByClassroomForm,
} from "../forms/update-amount-form";
import {
  useCreateBulkFeeAssignmentForm,
  useUpdateAmountByAssignmentsForm,
  useUpdateAmountByClassroomsForm,
  type BulkFeeAssignmentFormConfig,
} from "@/renderer/libs/queries/finances";
import {
  createBaseActionDialog,
  type ActionDialogProps,
} from "@/renderer/dialog-actions/base.dialog-actions";
import type {
  UpdateAmountByAssignments,
  UpdateAmountByClassrooms,
} from "@/packages/@core/data-access/schema-validations";
import type { FeeAssignment } from "@/packages/@core/data-access/db";
import { CURRENCY_ENUM } from "@/packages/@core/data-access/db/options";
import { BaseMutationConfig } from "@/renderer/libs/forms";

export type FeeBulkAssignmentDialogProps = ActionDialogProps<
  FeeBulkAssignmentData,
  BulkFeeAssignmentFormConfig
>;

/**
 * Action dialog component managing bulk fee assignments for groups of students.
 * @param props - Dialog properties including configuration settings and initial form values.
 * @returns Rendered bulk fee assignment dialog component.
 */
export const FeeBulkAssignmentDialog = createBaseActionDialog<
  FeeBulkAssignmentDialogProps,
  ReturnType<typeof useCreateBulkFeeAssignmentForm>
>({
  title: "Facturation collective / Assignation de masse",
  description:
    "Générez instantanément des fiches de frais pour tout un groupe d'élèves en fonction des critères sélectionnés.",
  useForm: useCreateBulkFeeAssignmentForm,
  form({
    formId,
    onSubmit,
    feeConfigSearch,
    scheduleSearch,
    classroomSearch,
    optionSearch,
    defaultValues,
  }): ReactNode {
    return (
      <FeeBulkAssignmentForm
        formId={formId}
        onSubmit={onSubmit}
        feeConfigSearch={feeConfigSearch}
        scheduleSearch={scheduleSearch}
        classroomSearch={classroomSearch}
        optionSearch={optionSearch}
        defaultValues={defaultValues}
      />
    );
  },
});

FeeBulkAssignmentDialog.displayName = "FeeBulkAssignmentDialog";

export type UpdateAmountByAssignmentsDialogProps = ActionDialogProps<
  UpdateAmountByAssignments,
  BaseMutationConfig<FeeAssignment[]>
> & {
  assignments: FeeAssignment[];
  enrollmentIds: string[];
  schoolId: string;
};

/**
 * Action dialog component for updating amounts on specific fee assignments.
 * @param props - Dialog properties including target assignment payload and mutation settings.
 * @returns Rendered update amount dialog component for individual assignments.
 */
export const UpdateAmountByAssignmentsDialog = createBaseActionDialog<
  UpdateAmountByAssignmentsDialogProps,
  ReturnType<typeof useUpdateAmountByAssignmentsForm>
>({
  title: "Ajustement des montants par attribution",
  description:
    "Modifiez les montants des frais sélectionnés pour les attributions ciblées.",
  useForm: useUpdateAmountByAssignmentsForm,
  form(
    { formId, onSubmit, currencyOptions },
    { assignments, enrollmentIds, schoolId },
  ): ReactNode {
    const assignmentIds: string[] = assignments.map(
      (item) => item.assignmentId,
    );
    const scheduleId: string[] = assignments.map((item) => item.scheduleId);
    return (
      <UpdateAmountByAssignmentForm
        formId={formId}
        onSubmit={onSubmit}
        previousAmount={assignments[0]?.amountPaid}
        defaultValues={{
          schoolId,
          scheduleIds: scheduleId,
          assignmentIds: assignmentIds,
          currency: assignments[0]?.currency,
          newTotalAmount: assignments[0]?.totalAmount,
        }}
        previousCurrency={CURRENCY_ENUM.CDF}
        currencyOptions={currencyOptions}
      />
    );
  },
});

UpdateAmountByAssignmentsDialog.displayName = "UpdateAmountByAssignmentsDialog";

export type UpdateAmountByClassroomsDialogProps = ActionDialogProps<
  UpdateAmountByClassrooms,
  BaseMutationConfig<FeeAssignment[]>
> & {};

/**
 * Action dialog component for updating fee amounts across entire classrooms.
 * @param props - Dialog properties including target classroom payload and mutation settings.
 * @returns Rendered update amount dialog component for classrooms.
 */
export const UpdateAmountByClassroomsDialog = createBaseActionDialog<
  UpdateAmountByClassroomsDialogProps,
  ReturnType<typeof useUpdateAmountByClassroomsForm>
>({
  title: "Ajustement des montants par classe",
  description:
    "Appliquez une mise à jour globale des montants de frais pour l'ensemble d'une classe.",
  useForm: useUpdateAmountByClassroomsForm,
  form({ formId, onSubmit, currencyOptions }): ReactNode {
    return (
      <UpdateAmountByClassroomForm
        formId={formId}
        onSubmit={onSubmit}
        currencyOptions={currencyOptions}
      />
    );
  },
});

UpdateAmountByClassroomsDialog.displayName = "UpdateAmountByClassroomsDialog";

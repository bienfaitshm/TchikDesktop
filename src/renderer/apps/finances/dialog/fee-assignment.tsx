import type { ReactNode } from "react";
import {
  FeeBulkAssignmentForm,
  type FeeBulkAssignmentData,
} from "@/renderer/apps/finances/forms/fee-bulk-assignment-form";
import {
  useCreateBulkFeeAssignmentForm,
  type BulkFeeAssignmentFormConfig,
} from "@/renderer/libs/queries/finances";
import {
  createBaseActionDialog,
  type ActionDialogProps,
} from "@/renderer/dialog-actions/base.dialog-actions";
import { UpdateAmountByAssignmentForm } from "../forms/update-amount-form";

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

export type UpdateAmountDialogProps = ActionDialogProps<
  FeeBulkAssignmentData,
  BulkFeeAssignmentFormConfig
> & {};
export const UpdateAmountDialog = createBaseActionDialog<
  UpdateAmountDialogProps,
  ReturnType<typeof useCreateBulkFeeAssignmentForm>
>({
  title: "Facturation collective / Assignation de masse",
  description:
    "Générez instantanément des fiches de frais pour tout un groupe d'élèves en fonction des critères sélectionnés.",
  useForm: useCreateBulkFeeAssignmentForm,
  form({ formId, onSubmit }): ReactNode {
    return (
      <UpdateAmountByAssignmentForm
        formId={formId}
        onSubmit={onSubmit}
        defaultValues={{}}
        currencyOptions={[]}
      />
    );
  },
});

UpdateAmountDialog.displayName = "UpdateAmountDialog";

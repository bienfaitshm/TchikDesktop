import * as React from "react";
import { DialogForm } from "@/renderer/components/dialog/form";
import {
  FeeBulkAssignmentForm,
  type FeeBulkAssignmentData,
} from "@/renderer/apps/finances/forms/fee-bulk-assignment-form";
import { useCreateBulkFeeAssignmentForm } from "@/renderer/libs/queries/finances";

type BulkAssignmentConfig = any;

export type FeeBulkAssignmentDialogProps = React.PropsWithChildren<
  BulkAssignmentConfig & {
    defaultValues?: Partial<FeeBulkAssignmentData>;
  }
>;

export const FeeBulkAssignmentDialog: React.FC<
  FeeBulkAssignmentDialogProps
> = ({ children, defaultValues, ...config }) => {
  const {
    formId,
    feeConfigSearch,
    scheduleSearch,
    classroomSearch,
    optionSearch,
    isSubmitting,
    onSubmit,
  } = useCreateBulkFeeAssignmentForm(config);

  return (
    <DialogForm
      trigger={children}
      title="Facturation collective / Assignation de masse"
      description="Générez instantanément des fiches de frais pour tout un groupe d'élèves en fonction des critères sélectionnés."
      formId={formId}
      isLoading={isSubmitting}
    >
      <FeeBulkAssignmentForm
        formId={formId}
        onSubmit={onSubmit}
        feeConfigSearch={feeConfigSearch}
        scheduleSearch={scheduleSearch}
        classroomSearch={classroomSearch}
        optionSearch={optionSearch}
        defaultValues={defaultValues}
      />
    </DialogForm>
  );
};

FeeBulkAssignmentDialog.displayName = "FeeBulkAssignmentDialog";

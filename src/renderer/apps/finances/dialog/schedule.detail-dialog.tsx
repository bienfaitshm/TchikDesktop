import type { FeeSchedule, FeeType } from "@/packages/@core/data-access/db";
import { LoadingButton } from "@/renderer/components/buttons/button-loading";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/renderer/components/ui/dialog";
import { Spinner } from "@/renderer/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/renderer/components/ui/table";
import { FeeScheduleForm } from "@/renderer/apps/finances/forms";
import {
  useCreateFeeScheduleForm,
  useGetFeeSchedules,
} from "@/renderer/libs/queries/finances";
import { Suspense } from "@/renderer/libs/queries/suspense";
import { CalendarX2, Pencil, Trash2 } from "lucide-react";
import { useMemo } from "react";
import {
  FeeScheduleDialogDeleteForm,
  FeeScheduleDialogUpdateForm,
  type FeeScheduleDialogProps,
} from "./schedule";
import { Button } from "@/renderer/components/ui/button";
import {
  ActionMenuConfig,
  createActionMenus,
} from "@/renderer/components/menus/action-menus";

const EMPTY_SCHEDULES: FeeSchedule[] = [];

export interface FeeScheduleRowActionProps extends Pick<
  FeeScheduleDialogProps,
  "mutationKey"
> {
  feeSchedule: FeeSchedule;
}

const MENUS: ActionMenuConfig<FeeScheduleRowActionProps>[] = [
  {
    id: "edit",
    label: "Edit Schedule",
    icon: Pencil,
    dialog({ feeSchedule, mutationKey }) {
      return (
        <FeeScheduleDialogUpdateForm
          mutationKey={mutationKey}
          defaultValues={{
            feeTypeId: feeSchedule.feeTypeId,
            installmentName: feeSchedule.installmentName,
          }}
          scheduleId={feeSchedule.scheduleId}
        />
      );
    },
  },
  {
    id: "delete",
    label: "Delete Schedule",
    icon: Trash2,
    separator: true,
    variant: "destructive",
    dialog({ feeSchedule, mutationKey }) {
      return (
        <FeeScheduleDialogDeleteForm
          mutationKey={mutationKey}
          name={feeSchedule.installmentName}
          id={feeSchedule.scheduleId}
        />
      );
    },
  },
];

/**
 * Renders an action menu for a fee schedule table row with edit and delete options.
 * @param props - Row action properties containing mutation keys and target fee schedule.
 * @returns Rendered dropdown action menu component.
 */
export const RowAction: React.FC<FeeScheduleRowActionProps> =
  createActionMenus<FeeScheduleRowActionProps>(MENUS);

export type CreateFeeScheduleFormProps = {
  schoolId: string;
  mutationKey: readonly unknown[];
  feeTypeId: string;
};

/**
 * Form component for creating a new fee schedule entry within a manager view.
 * @param props - Form configuration containing school identifier, mutation keys, and fee type.
 * @returns Rendered creation form component with submit button.
 */
const CreateFeeScheduleForm: React.FC<CreateFeeScheduleFormProps> = ({
  schoolId,
  mutationKey,
  feeTypeId,
}) => {
  const { formId, isSubmitting, feeTypeOptions, onSubmit } =
    useCreateFeeScheduleForm({ schoolId, mutationKey });

  const defaultValues = useMemo(() => ({ feeTypeId }), [feeTypeId]);

  return (
    <div className="space-y-4">
      <FeeScheduleForm
        formId={formId}
        feeTypeOptions={feeTypeOptions}
        onSubmit={onSubmit}
        defaultValues={defaultValues}
      />
      <div className="flex items-center justify-end">
        <LoadingButton loading={isSubmitting} type="submit" form={formId}>
          Add
        </LoadingButton>
      </div>
    </div>
  );
};

export interface FeeScheduleManagerProps {
  feeType: FeeType;
}

/**
 * Container component managing fee schedules list, empty states, and creation forms.
 * @param props - FeeType entity context containing identifiers and school metadata.
 * @returns Rendered fee schedule manager component.
 */
const FeeScheduleManager: React.FC<FeeScheduleManagerProps> = ({ feeType }) => {
  const { data: feeSchedules = EMPTY_SCHEDULES, queryKey } = useGetFeeSchedules(
    {
      where: { feeSchedules: { feeTypeId: feeType.feeTypeId } },
    },
  );

  return (
    <div className="relative -mx-4 my-2 overflow-y-auto border-t border-border/60 px-4 py-4 max-h-[60vh] scrollbar-thin scrollbar-thumb-muted-foreground/20">
      <div className="sticky top-0 z-10 pb-4 border-b border-border/40 mb-4">
        <CreateFeeScheduleForm
          schoolId={feeType.schoolId}
          mutationKey={queryKey}
          feeTypeId={feeType.feeTypeId}
        />
      </div>

      <div>
        {feeSchedules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
            <CalendarX2 className="size-10 mb-2 opacity-50" />
            <p>No schedules configured.</p>
            <p className="text-sm">Add one using the form above.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Installment Name</TableHead>
                <TableHead className="text-right w-25">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feeSchedules.map((feeSchedule) => (
                <TableRow key={feeSchedule.scheduleId}>
                  <TableCell className="font-medium">
                    {feeSchedule.installmentName}
                  </TableCell>
                  <TableCell className="text-right">
                    <RowAction
                      mutationKey={queryKey}
                      feeSchedule={feeSchedule}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export type ScheduleViewDialogProps = Partial<
  React.ComponentProps<typeof Dialog>
> & {
  feeType: FeeType;
};

/**
 * Modal dialog component displaying and managing payment schedules for a fee type.
 * @param props - Dialog properties including target FeeType entity context.
 * @returns Rendered schedule view dialog component.
 */
export const ScheduleViewDialog: React.FC<ScheduleViewDialogProps> = ({
  feeType,
  ...props
}) => {
  return (
    <Dialog modal={false} {...props}>
      <DialogContent className="sm:max-w-lg md:max-w-2xl lg:max-w-4xl flex flex-col max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Schedules for {feeType.name}</DialogTitle>
          <DialogDescription>
            Manage payment installments and due dates.
          </DialogDescription>
        </DialogHeader>
        <Suspense
          fallback={
            <div className="flex justify-center items-center py-10 gap-2 text-muted-foreground">
              <Spinner className="size-5" />
              <span>Loading schedules...</span>
            </div>
          }
        >
          <FeeScheduleManager feeType={feeType} />
        </Suspense>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

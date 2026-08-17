import type { FeeSchedule, FeeType } from "@/packages/@core/data-access/db";
import { LoadingButton } from "@/renderer/components/buttons/button-loading";
import { Button } from "@/renderer/components/ui/button";
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
import { FeeScheduleNameForm } from "@/renderer/apps/finances/forms";
import {
  useCreateFeeScheduleForm,
  useGetFeeSchedules,
} from "@/renderer/libs/queries/finances";
import { Suspense } from "@/renderer/libs/queries/suspense";
import { CalendarX2, List, Pencil, Trash2 } from "lucide-react";
import { useMemo } from "react";
import {
  FeeScheduleDialogDeleteForm,
  FeeScheduleDialogUpdateForm,
  type FeeScheduleDialogProps,
} from "./schedule";
import {
  ActionMenuConfig,
  createActionMenus,
} from "@/renderer/components/menus/action-menus";

const EMPTY_SCHEDULES: FeeSchedule[] = [];

/**
 * Localization strings dictionary for FeeSchedule interface elements.
 */
const I18N = {
  editSchedule: "Modifier la tranche",
  deleteSchedule: "Supprimer la tranche",
  addButton: "Ajouter",
  noSchedulesTitle: "Aucune tranche configurée",
  noSchedulesDescription:
    "Utilisez le formulaire ci-dessus pour créer la première tranche.",
  dialogTitle: (name: string) => `Échéancier pour ${name}`,
  dialogDescription: "Gérer les tranches de paiement et les dates d'échéance.",
  loading: "Chargement des échéanciers...",
  closeButton: "Fermer",
} as const;

export interface FeeScheduleRowActionProps extends Pick<
  FeeScheduleDialogProps,
  "mutationKey"
> {
  feeSchedule: FeeSchedule;
}

const MENUS: ActionMenuConfig<FeeScheduleRowActionProps>[] = [
  {
    id: "edit",
    label: I18N.editSchedule,
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
    label: I18N.deleteSchedule,
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
    <div className="flex items-center gap-4">
      <FeeScheduleNameForm
        formId={formId}
        feeTypeOptions={feeTypeOptions}
        onSubmit={onSubmit}
        defaultValues={defaultValues}
      />
      <LoadingButton loading={isSubmitting} type="submit" form={formId}>
        {I18N.addButton}
      </LoadingButton>
    </div>
  );
};

/**
 * Empty state component displayed when no fee schedules are available.
 * @returns Rendered empty state illustration with messaging.
 */
const EmptyScheduleState: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
    <CalendarX2 className="size-10 mb-2 opacity-40" />
    <p className="font-medium text-foreground">{I18N.noSchedulesTitle}</p>
    <p className="text-sm">{I18N.noSchedulesDescription}</p>
  </div>
);

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
    <div className="relative -mx-4 my-2 space-y-4 overflow-y-auto border-t border-border/60 px-4 py-4 max-h-[60vh] min-h-[40vh] scrollbar-thin scrollbar-thumb-muted-foreground/20">
      <div className="sticky top-0 z-10 pb-4 border-b border-border/40 mb-4">
        <CreateFeeScheduleForm
          schoolId={feeType.schoolId}
          mutationKey={queryKey}
          feeTypeId={feeType.feeTypeId}
        />
      </div>

      <div className="my-4">
        {feeSchedules.length === 0 ? (
          <EmptyScheduleState />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <List className="size-4" />
              <p>Liste des tranches</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {feeSchedules.map((feeSchedule) => (
                <div
                  key={feeSchedule.scheduleId}
                  className="group relative flex items-center justify-between rounded-lg border border-border/60 bg-card p-3.5 shadow-xs transition-all duration-200 hover:border-border hover:bg-accent/50 hover:shadow-sm"
                >
                  <span className="truncate pr-2 text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                    {feeSchedule.installmentName}
                  </span>

                  <div className="flex shrink-0 items-center opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-within:opacity-100">
                    <RowAction
                      mutationKey={queryKey}
                      feeSchedule={feeSchedule}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
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
 * @param props - Dialog properties including target FeeType entity context and handlers.
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
          <DialogTitle>{I18N.dialogTitle(feeType.name)}</DialogTitle>
          <DialogDescription>{I18N.dialogDescription}</DialogDescription>
        </DialogHeader>
        <Suspense
          fallback={
            <div className="flex justify-center items-center py-10 gap-2 text-muted-foreground">
              <Spinner className="size-5" />
              <span>{I18N.loading}</span>
            </div>
          }
        >
          <FeeScheduleManager feeType={feeType} />
        </Suspense>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{I18N.closeButton}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

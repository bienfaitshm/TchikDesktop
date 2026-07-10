import type { FeeSchedule, FeeType } from "@/packages/@core/data-access/db";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogClose,
} from "@/renderer/components/ui/dialog";
import {
  useCreateFeeScheduleForm,
  useGetFeeSchedules,
} from "@/renderer/libs/queries/finances";
import React, { useMemo } from "react";
import { FeeScheduleForm } from "@/renderer/apps/finances/forms";
import { LoadingButton } from "@/renderer/components/buttons/button-loading";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/renderer/components/ui/table";
import { Pencil, Trash2, CalendarX2 } from "lucide-react";
import { Button } from "@/renderer/components/ui/button";
import { Suspense } from "@/renderer/libs/queries/suspense";
import { Spinner } from "@/renderer/components/ui/spinner";
import { DropdownMenuSeparator } from "@/renderer/components/ui/dropdown-menu";
import { ButtonMenu } from "@/renderer/components/buttons/button-menu";
import {
  ActionMenu,
  MenuDialogItem,
  MenuDialogWrapper,
} from "@/renderer/components/menus/dropdown";
import {
  FeeScheduleDialogDeleteForm,
  FeeScheduleDialogUpdateForm,
  FeeScheduleDialogProps,
} from "./schedule";

const EMPTY_SCHEDULES: FeeSchedule[] = [];

interface FeeScheduleRowActionProps extends Pick<
  FeeScheduleDialogProps,
  "mutationKey"
> {
  feeSchedule: FeeSchedule;
}

export const FeeScheduleRowAction: React.FC<FeeScheduleRowActionProps> = ({
  mutationKey,
  feeSchedule,
}) => (
  <ActionMenu
    trigger={<ButtonMenu />}
    dialogs={
      <>
        <MenuDialogWrapper id="edit">
          <FeeScheduleDialogUpdateForm
            mutationKey={mutationKey}
            defaultValues={{
              feeTypeId: feeSchedule.feeTypeId as string,
              installmentName: feeSchedule.installmentName,
            }}
            scheduleId={feeSchedule.scheduleId}
          />
        </MenuDialogWrapper>
        <MenuDialogWrapper id="delete">
          <FeeScheduleDialogDeleteForm
            mutationKey={mutationKey}
            installmentName={feeSchedule.installmentName}
            scheduleId={feeSchedule.scheduleId}
          />
        </MenuDialogWrapper>
      </>
    }
  >
    <MenuDialogItem targetId="edit" className="gap-2 cursor-pointer">
      <Pencil className="size-4 text-muted-foreground" />
      <span>Modifier l'échéancier</span>
    </MenuDialogItem>

    <DropdownMenuSeparator />

    <MenuDialogItem
      targetId="delete"
      className="gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
    >
      <Trash2 className="size-4" />
      <span>Supprimer l'échéancier</span>
    </MenuDialogItem>
  </ActionMenu>
);

type CreateFeeScheduleFormProps = {
  schoolId: string;
  mutationKey: readonly unknown[];
  feeTypeId: string;
};

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
          Ajouter
        </LoadingButton>
      </div>
    </div>
  );
};

const FeeScheduleManager: React.FC<{ feeType: FeeType }> = ({ feeType }) => {
  const { data: feeSchedules = EMPTY_SCHEDULES, queryKey } = useGetFeeSchedules(
    {
      where: { feeTypeId: feeType.feeTypeId },
    },
  );

  return (
    <div className="relative -mx-4 my-2 overflow-y-auto border-t border-border/60 px-4 py-4 max-h-[60vh] scrollbar-thin scrollbar-thumb-muted-foreground/20">
      <div className="sticky top-0 z-10 pb-4 border-b border-border/40 mb-4">
        <CreateFeeScheduleForm
          schoolId={feeType.schoolId as string}
          mutationKey={queryKey}
          feeTypeId={feeType.feeTypeId}
        />
      </div>

      <div>
        {feeSchedules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
            <CalendarX2 className="size-10 mb-2 opacity-50" />
            <p>Aucun échéancier configuré.</p>
            <p className="text-sm">
              Ajoutez-en un via le formulaire ci-dessus.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom de l'échéance</TableHead>
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
                    <FeeScheduleRowAction
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

type ScheduleViewDialogProps = Partial<React.ComponentProps<typeof Dialog>> & {
  feeType: FeeType;
};

export const ScheduleViewDialog: React.FC<ScheduleViewDialogProps> = ({
  feeType,
  ...props
}) => {
  return (
    <Dialog modal={false} {...props}>
      <DialogContent className="sm:max-w-lg md:max-w-2xl lg:max-w-4xl flex flex-col max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Les échéances du {feeType.name}</DialogTitle>
          <DialogDescription>
            Gérez les tranches de paiement et leurs dates d'exigibilité.
          </DialogDescription>
        </DialogHeader>
        <Suspense
          fallback={
            <div className="flex justify-center items-center py-10 gap-2 text-muted-foreground">
              <Spinner className="size-5" />
              <span>Chargement des échéances...</span>
            </div>
          }
        >
          <FeeScheduleManager feeType={feeType} />
        </Suspense>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Fermer</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

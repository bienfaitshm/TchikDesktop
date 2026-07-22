import type { ReactNode } from "react";
import { CreditCard } from "lucide-react";
import { Button } from "@/renderer/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/renderer/components/ui/dialog";
import { Spinner } from "@/renderer/components/ui/spinner";
import { useOnClassroomSyncProgress } from "@/renderer/libs/queries/finances";
import { Suspense } from "@/renderer/libs/queries/suspense";
import { StudentSchedulePaymentTabs } from "../contents/student-schedule-payment-tab.contents";

export interface SchedulePaymentDialogProps extends Partial<
  React.ComponentProps<typeof Dialog>
> {
  children?: ReactNode;
  schoolId: string;
  yearId: string;
  classId: string;
  classroomName?: string;
}

/**
 * Fallback component showing real-time classroom data synchronization progress.
 * @returns Rendered progress spinner with percentage bar.
 */
const ClassroomProgressFallback: React.FC = () => {
  const { progress } = useOnClassroomSyncProgress();

  const currentMessage =
    progress?.message ?? "Chargement des données financières...";
  const currentPercent = progress?.pourcent ?? 0;

  return (
    <div className="flex h-full min-h-[45vh] flex-col justify-center items-center gap-4 text-muted-foreground px-6">
      <div className="relative flex items-center justify-center">
        <Spinner className="h-10 w-10 text-primary animate-spin" />
        {currentPercent > 0 && (
          <span className="absolute text-[10px] font-semibold text-primary">
            {currentPercent}%
          </span>
        )}
      </div>

      <div className="flex flex-col items-center gap-2 max-w-sm w-full text-center">
        <span className="text-sm font-semibold text-foreground">
          Synchronisation en cours
        </span>
        <span className="text-xs text-muted-foreground line-clamp-1">
          {currentMessage}
        </span>

        <div className="w-full bg-secondary h-1.5 rounded-full mt-2 overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-300 ease-out rounded-full"
            style={{ width: `${currentPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};

/**
 * Action dialog displaying the payment schedule and tracking interface for a classroom.
 * @param props - Dialog properties including classId, schoolId, yearId, and trigger children.
 * @returns Rendered schedule payment dialog component.
 */
export const SchedulePaymentDialog: React.FC<SchedulePaymentDialogProps> = ({
  children,
  schoolId,
  yearId,
  classId,
  classroomName,
  ...props
}) => {
  return (
    <Dialog modal={false} {...props}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-3xl md:max-w-5xl lg:max-w-[85vw] xl:max-w-[80vw] flex flex-col max-h-[85vh] h-[85vh]">
        <DialogHeader className="pt-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CreditCard className="h-5 w-5" />
            </div>
            <div className="flex flex-col gap-0.5">
              <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                Suivi des Paiements de la classe{" "}
                <b className="text-primary">{classroomName}</b>
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Visualisez la matrice des affectations, encaissez les frais et
                gérez l'état financier des élèves.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="-mx-4 overflow-y-auto px-4 flex-1 scrollbar-thin scrollbar-thumb-muted-foreground/20">
          <Suspense fallback={<ClassroomProgressFallback />}>
            <StudentSchedulePaymentTabs
              classId={classId}
              schoolId={schoolId}
              yearId={yearId}
            />
          </Suspense>
        </div>

        <DialogFooter className="border-t border-border/60 shrink-0 mt-0">
          <DialogClose asChild>
            <Button variant="outline" className="min-w-25">
              Fermer
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

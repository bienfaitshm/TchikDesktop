import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogClose,
  DialogTrigger,
} from "@/renderer/components/ui/dialog";
import { Spinner } from "@/renderer/components/ui/spinner";
import { Suspense } from "@/renderer/libs/queries/suspense";
import { StudentSchedulePaymentTabs } from "../contents/student-schedule-payement-tab.contents";
import { useOnClassroomSyncProgress } from "@/renderer/libs/queries/finances";

import { Button } from "@/renderer/components/ui/button";
import { CreditCard } from "lucide-react";

/**
 * Fallback dynamique affichant la progression réelle de la synchronisation SQLite
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

        {/* Barre de progression visuelle */}
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

type SchedulePaymentDialogProps = Partial<
  React.ComponentProps<typeof Dialog>
> & {
  children?: React.ReactNode;
  schoolId: string;
  yearId: string;
  classId: string;
  classroomName?: string;
};

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
        {/* Header avec design épuré et padding interne uniforme */}
        <DialogHeader className="p-6 border-b border-border/60 shrink-0">
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

        {/* Zone de contenu scrollable indépendante */}
        <div className="-mx-4 my-2 overflow-y-auto border-t border-border/60 px-4 py-4 flex-1 scrollbar-thin scrollbar-thumb-muted-foreground/20">
          <Suspense fallback={<ClassroomProgressFallback />}>
            <StudentSchedulePaymentTabs
              classId={classId}
              schoolId={schoolId}
              yearId={yearId}
            />
          </Suspense>
        </div>

        {/* Footer rigide, aligné sur la grille */}
        <DialogFooter className="p-4 border-t border-border/60 shrink-0">
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

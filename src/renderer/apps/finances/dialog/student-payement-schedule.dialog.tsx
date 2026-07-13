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
import { Button } from "@/renderer/components/ui/button";
import { CreditCard } from "lucide-react";

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

      <DialogContent className="w-full sm:max-w-3xl md:max-w-5xl lg:max-w-[85vw] xl:max-w-[80vw] h-[85vh] flex flex-col p-0 overflow-hidden gap-0 rounded-xl border bg-background shadow-lg">
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
        <div className="-mx-4 my-2 overflow-y-auto border-t border-border/60 px-4 py-4 h-full  felx-1 scrollbar-thin scrollbar-thumb-muted-foreground/20">
          <Suspense
            fallback={
              <div className="flex h-full min-h-[40vh] flex-col justify-center items-center gap-3 text-muted-foreground">
                <Spinner className="h-6 w-6 text-primary animate-spin" />
                <div className="flex flex-col items-center gap-1">
                  <span className="text-sm font-medium text-foreground">
                    Chargement des données financières
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Vérification et synchronisation de la matrice...
                  </span>
                </div>
              </div>
            }
          >
            <StudentSchedulePaymentTabs
              classId={classId}
              schoolId={schoolId}
              yearId={yearId}
            />
          </Suspense>
        </div>
        {/* Footer rigide, aligné sur la grille */}
        <DialogFooter>
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

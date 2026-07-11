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
import { StudentSchdulePayementTabs } from "../contents/student-schedule-payement-tab.contents";
import { Button } from "@/renderer/components/ui/button";
import type { ApplicableFeeConfigParams } from "@/renderer/libs/queries/finances";

type SchedulePayementDialogProps = Partial<
  React.ComponentProps<typeof Dialog>
> & {
  children?: React.ReactNode;
  params: ApplicableFeeConfigParams;
};

export const SchedulePayementDialog: React.FC<SchedulePayementDialogProps> = ({
  children,
  params,
  ...props
}) => {
  return (
    <Dialog modal={false} {...props}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-2xl md:max-w-4xl lg:max-w-4/5 flex flex-col max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Payement</DialogTitle>
          <DialogDescription>Gérez les tranches de paiement</DialogDescription>
        </DialogHeader>
        <div className="min-h-[50vh]">
          <Suspense
            fallback={
              <div className="flex h-full justify-center items-center py-10 gap-2 text-muted-foreground">
                <Spinner className="size-5" />
                <span>Chargement des configurations</span>
              </div>
            }
          >
            <StudentSchdulePayementTabs params={params} />
          </Suspense>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Fermer</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

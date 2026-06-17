import { useCallback, useId, useMemo, useState } from "react";
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
import ButtonGenerator from "@/renderer/components/buttons/button-generator";
import { SeatingGeneratorForm } from "@/renderer/components/form/seating-generator-form";
import { Button } from "@/renderer/components/ui/button";
import { useGetClassrooms } from "@/renderer/libs/queries/classrooms";
import { useGetLocalRooms } from "@/renderer/libs/queries/seating";

type SeatingData = {
  localRoomIds: string[];
  classRoomIds: string[];
};

interface SeatingGeneratorDialogProps {
  sessionName?: string;
  hasGenerated?: boolean;
  isLoading?: boolean;
  onGenerate?: (value: SeatingData) => void;
  schoolId?: string;
  yearId?: string;
}

/**
 * Hook personnalisé pour transformer les données API en options de Select
 */
const useRoomOptions = (schoolId?: string, yearId?: string) => {
  const { data: classRooms = [] } = useGetClassrooms({
    where: { schoolId, yearId },
  });
  const { data: localRooms = [] } = useGetLocalRooms({ where: { schoolId } });

  return useMemo(
    () => ({
      classRoomOptions: classRooms.map((c) => ({
        label: c.shortIdentifier,
        value: c.classId,
      })),
      localRoomOptions: localRooms.map((l) => ({
        label: l.name,
        value: l.localRoomId,
      })),
    }),
    [classRooms, localRooms],
  );
};

export const SeatingGeneratorDialog = ({
  onGenerate,
  hasGenerated,
  isLoading,
  sessionName,
  schoolId,
  yearId,
}: SeatingGeneratorDialogProps) => {
  const formId = useId();
  const [open, setOpen] = useState(false);
  const { classRoomOptions, localRoomOptions } = useRoomOptions(
    schoolId,
    yearId,
  );

  const handleFormSubmit = useCallback((data: SeatingData) => {
    onGenerate?.(data);
  }, []);

  return (
    <Dialog
      modal={false}
      open={open}
      onOpenChange={(val) => !isLoading && setOpen(val)}
    >
      <DialogTrigger asChild>
        <ButtonGenerator isLoading={isLoading} hasGenerated={hasGenerated} />
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px] md:max-w-[750px] lg:max-w-[950px]">
        <DialogHeader>
          <DialogTitle>Générer la mise en place</DialogTitle>
          <DialogDescription>
            Configurez la répartition des élèves pour la session{" "}
            <span className="font-semibold text-foreground">{sessionName}</span>
            .
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <SeatingGeneratorForm
            formId={formId}
            classRoomOptions={classRoomOptions}
            localRoomOptions={localRoomOptions}
            onSubmit={handleFormSubmit}
          />
        </div>

        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button variant="ghost" disabled={isLoading}>
              Annuler
            </Button>
          </DialogClose>

          <ButtonGenerator
            form={formId}
            type="submit"
            isLoading={isLoading}
            hasGenerated={hasGenerated}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

SeatingGeneratorDialog.displayName = "SeatingGeneratorDialog";
